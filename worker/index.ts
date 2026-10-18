// The site's API: magic-link sign-in and saved lesson progress. Static pages are served by the assets
// binding; only /api/* reaches this Worker (assets.run_worker_first in wrangler.jsonc).

import { emptyProgress, mergeProgress, normaliseProgress } from '../app/progress/model';
import { signInEmail } from './email';

const COOKIE = 'rl_session';
const LINK_TTL = 15 * 60 * 1000;
const SESSION_TTL = 90 * 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MAX_LINKS_PER_EMAIL = 3; // per hour
const MAX_LINKS_PER_IP = 10; // per hour
const MAX_PROGRESS_BYTES = 256 * 1024;

type Json = Record<string, unknown>;

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const fail = (status: number, error: string) => json({ error }, status);

const bytes = (n: number) => crypto.getRandomValues(new Uint8Array(n));
const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function sha256(s: string) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  return [...d].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function cookieValue(req: Request, name: string) {
  for (const part of (req.headers.get('cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}
const sessionCookie = (value: string, maxAgeMs: number) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}`;

/** State-changing requests must come from the site itself (the cookie is SameSite=Lax as well). */
function sameOrigin(req: Request, env: Env) {
  const origin = req.headers.get('origin');
  const allowed = new Set([new URL(env.SITE_URL).origin, new URL(req.url).origin]);
  return !!origin && allowed.has(origin);
}

async function body(req: Request, limit = 16 * 1024): Promise<Json | null> {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return null;
  const text = await req.text();
  if (text.length > limit) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === 'object' ? (v as Json) : null;
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Only local paths, so a sign-in link can never send someone to another site. */
const safeNext = (v: unknown) => (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && v.length < 300 ? v : '/');

async function currentUser(req: Request, env: Env) {
  const token = cookieValue(req, COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    'SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?',
  ).bind(await sha256(token), Date.now()).first<{ id: string; email: string }>();
  return row ?? null;
}

async function loadProgress(env: Env, userId: string) {
  const row = await env.DB.prepare('SELECT data FROM progress WHERE user_id = ?').bind(userId).first<{ data: string }>();
  try { return row ? normaliseProgress(JSON.parse(row.data)) : emptyProgress(); } catch { return emptyProgress(); }
}

// ---------- handlers ----------

async function requestLink(req: Request, env: Env) {
  const b = await body(req);
  const email = typeof b?.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) return fail(400, 'invalid_email');
  const lang = b?.lang === 'nl' ? 'nl' : 'en';
  const next = safeNext(b?.next);
  const now = Date.now();
  const ipHash = await sha256(`radio-lessons:${req.headers.get('cf-connecting-ip') ?? 'unknown'}`);

  const counts = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) AS n FROM login_tokens WHERE email = ? AND created_at > ?').bind(email, now - HOUR),
    env.DB.prepare('SELECT COUNT(*) AS n FROM login_tokens WHERE ip_hash = ? AND created_at > ?').bind(ipHash, now - HOUR),
  ]);
  const perEmail = (counts[0]!.results[0] as { n: number }).n;
  const perIp = (counts[1]!.results[0] as { n: number }).n;
  if (perEmail >= MAX_LINKS_PER_EMAIL || perIp >= MAX_LINKS_PER_IP) return fail(429, 'too_many');

  const token = b64url(bytes(32));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM login_tokens WHERE created_at < ?').bind(now - 24 * HOUR),
    env.DB.prepare('INSERT INTO login_tokens (token_hash, email, ip_hash, next_path, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(await sha256(token), email, ipHash, next, now, now + LINK_TTL),
  ]);

  // Always the live site (wrangler dev presents requests under the production hostname too).
  const link = new URL(`${lang === 'nl' ? '/nl' : ''}/auth/verify`, env.SITE_URL);
  link.searchParams.set('token', token);
  const mail = signInEmail(lang, link.toString());
  try {
    await env.EMAIL.send({ to: email, from: { email: env.MAIL_FROM, name: lang === 'nl' ? 'Radiolessen' : 'Radio lessons' }, ...mail });
  } catch (e) {
    const code = (e as { code?: string }).code ?? 'unknown';
    console.error('sign-in email failed', code, (e as Error).message);
    return fail(code === 'E_RATE_LIMIT_EXCEEDED' || code === 'E_DAILY_LIMIT_EXCEEDED' ? 429 : 502, 'email_failed');
  }
  return json({ ok: true });
}

async function verifyLink(req: Request, env: Env) {
  const b = await body(req);
  const token = typeof b?.token === 'string' ? b.token : '';
  if (!token || token.length > 100) return fail(400, 'invalid');
  const now = Date.now();
  const hash = await sha256(token);
  const row = await env.DB.prepare('SELECT email, next_path, expires_at, used_at FROM login_tokens WHERE token_hash = ?')
    .bind(hash).first<{ email: string; next_path: string | null; expires_at: number; used_at: number | null }>();
  if (!row || row.used_at) return fail(400, 'invalid');
  if (row.expires_at < now) return fail(400, 'expired');
  // Mark used first; only the request that flips it wins, so a link works once.
  const used = await env.DB.prepare('UPDATE login_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL').bind(now, hash).run();
  if (!used.meta.changes) return fail(400, 'invalid');

  let user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(row.email).first<{ id: string; email: string }>();
  if (!user) {
    user = { id: crypto.randomUUID(), email: row.email };
    await env.DB.prepare('INSERT INTO users (id, email, created_at, last_login_at) VALUES (?, ?, ?, ?)').bind(user.id, user.email, now, now).run();
  } else {
    await env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').bind(now, user.id).run();
  }
  const session = b64url(bytes(32));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(await sha256(session), user.id, now, now + SESSION_TTL),
  ]);
  return json({ email: user.email, next: safeNext(row.next_path), progress: await loadProgress(env, user.id) }, 200, { 'set-cookie': sessionCookie(session, SESSION_TTL) });
}

async function me(req: Request, env: Env) {
  const user = await currentUser(req, env);
  if (!user) return fail(401, 'signed_out');
  return json({ email: user.email, progress: await loadProgress(env, user.id) });
}

async function saveProgress(req: Request, env: Env) {
  const user = await currentUser(req, env);
  if (!user) return fail(401, 'signed_out');
  const b = await body(req, MAX_PROGRESS_BYTES);
  if (!b) return fail(400, 'invalid');
  const merged = mergeProgress(await loadProgress(env, user.id), normaliseProgress(b.progress));
  const data = JSON.stringify(merged);
  if (data.length > MAX_PROGRESS_BYTES) return fail(413, 'too_large');
  await env.DB.prepare('INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
    .bind(user.id, data, Date.now()).run();
  return json({ progress: merged });
}

async function signOut(req: Request, env: Env) {
  const token = cookieValue(req, COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}

async function deleteAccount(req: Request, env: Env) {
  const user = await currentUser(req, env);
  if (!user) return fail(401, 'signed_out');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM login_tokens WHERE email = ?').bind(user.email),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
  ]);
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}

const ROUTES: Record<string, Partial<Record<string, (req: Request, env: Env) => Promise<Response>>>> = {
  '/api/auth/request': { POST: requestLink },
  '/api/auth/verify': { POST: verifyLink },
  '/api/auth/logout': { POST: signOut },
  '/api/me': { GET: me, DELETE: deleteAccount },
  '/api/progress': { PUT: saveProgress },
};

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    const route = ROUTES[url.pathname.replace(/\/$/, '')];
    const handler = route?.[req.method];
    if (!route) return fail(404, 'not_found');
    if (!handler) return fail(405, 'method_not_allowed');
    if (req.method !== 'GET' && !sameOrigin(req, env)) return fail(403, 'bad_origin');
    try {
      return await handler(req, env);
    } catch (e) {
      console.error('api error', url.pathname, (e as Error).message);
      return fail(500, 'server_error');
    }
  },
} satisfies ExportedHandler<Env>;
