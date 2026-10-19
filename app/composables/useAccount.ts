// Magic-link sign-in and progress sync. Progress always lives in localStorage (useProgress); when
// signed in, it's merged with the server copy and every change is uploaded (debounced).
import { mergeProgress, normaliseProgress, type ProgressData } from '~/progress/model';

type Status = 'unknown' | 'signed-out' | 'signed-in';

async function api<T>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: init.body ? { 'content-type': 'application/json', ...init.headers } : init.headers,
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export function useAccount() {
  const status = useState<Status>('account-status', () => 'unknown');
  const email = useState<string | null>('account-email', () => null);
  const createdAt = useState<number | null>('account-created-at', () => null);
  const syncing = useState('account-syncing', () => false);
  const lastSync = useState<number | null>('account-last-sync', () => null);
  const signInOpen = useState('account-signin-open', () => false);
  const progress = useProgress();

  /** Combine the server's progress with this browser's and upload the result if it differs. */
  async function adopt(server: unknown) {
    const merged = mergeProgress(progress.data.value, normaliseProgress(server));
    progress.replace(merged);
    if (JSON.stringify(merged) !== JSON.stringify(normaliseProgress(server))) await upload(merged);
    else lastSync.value = Date.now();
  }

  async function upload(data: ProgressData = progress.data.value) {
    if (status.value !== 'signed-in') return;
    syncing.value = true;
    const res = await api<{ progress: ProgressData }>('/api/progress', { method: 'PUT', body: JSON.stringify({ progress: data }) });
    syncing.value = false;
    if (res.status === 401) { status.value = 'signed-out'; email.value = null; return; }
    if (res.ok && res.data) {
      // The server merges too (another device may have saved in between); keep its answer.
      progress.replace(mergeProgress(progress.data.value, normaliseProgress(res.data.progress)));
      lastSync.value = Date.now();
    }
  }

  /** Checks the session once per page load. */
  async function init() {
    if (status.value !== 'unknown') return;
    const res = await api<{ email: string; createdAt: number; progress: unknown }>('/api/me');
    if (res.ok && res.data) {
      email.value = res.data.email;
      createdAt.value = res.data.createdAt ?? null;
      status.value = 'signed-in';
      await adopt(res.data.progress);
    } else {
      status.value = 'signed-out';
    }
  }

  async function requestLink(address: string, lang: 'en' | 'nl', next: string) {
    const res = await api<{ ok?: boolean; error?: string }>('/api/auth/request', { method: 'POST', body: JSON.stringify({ email: address, lang, next }) });
    return res.ok ? 'sent' : (res.data?.error ?? (res.status ? 'server_error' : 'offline'));
  }

  async function verify(token: string) {
    const res = await api<{ email: string; createdAt: number; next: string; progress: unknown; error?: string }>('/api/auth/verify', { method: 'POST', body: JSON.stringify({ token }) });
    if (!res.ok || !res.data?.email) return { ok: false as const, error: res.data?.error ?? 'invalid' };
    email.value = res.data.email;
    createdAt.value = res.data.createdAt ?? null;
    status.value = 'signed-in';
    await adopt(res.data.progress);
    return { ok: true as const, next: res.data.next };
  }

  async function signOut() {
    await api('/api/auth/logout', { method: 'POST' });
    status.value = 'signed-out';
    email.value = null;
    createdAt.value = null;
    lastSync.value = null;
  }

  /** `confirm` is the account's email address, typed again by the person deleting it. */
  async function deleteAccount(confirm: string) {
    const res = await api<{ ok?: boolean; error?: string }>('/api/me', { method: 'DELETE', body: JSON.stringify({ confirm }) });
    if (res.ok) { status.value = 'signed-out'; email.value = null; createdAt.value = null; lastSync.value = null; }
    return res.ok ? 'deleted' : (res.data?.error ?? (res.status ? 'server_error' : 'offline'));
  }

  return { status, email, createdAt, syncing, lastSync, signInOpen, init, requestLink, verify, signOut, deleteAccount, upload };
}

/** Uploads local progress changes while signed in. Call once (app.vue). */
export function useProgressSync() {
  const account = useAccount();
  const { changes } = useProgress();
  let timer: ReturnType<typeof setTimeout> | null = null;
  onMounted(() => { void account.init(); });
  watch(changes, () => {
    if (account.status.value !== 'signed-in') return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void account.upload(); }, 1500);
  });
}
