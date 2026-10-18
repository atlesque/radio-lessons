// Lesson progress: which lessons are finished, where each unfinished lesson was left (with the radio's
// state at that step, so it can be restored exactly), and the last lesson opened. Shared by the app
// (localStorage) and the Worker (D1), so it has no app imports.

export interface PackedChannel { 0: number; 1: number; 2: string; 3: string }

/** The radio state, without the 1000-slot memory array (only programmed channels are kept). */
export interface PackedRadio {
  [key: string]: unknown;
  mem: [number, number, string, string][];
}

export interface Resume { step: number; radio: PackedRadio | null; at: number }

export interface ProgressData {
  v: 2;
  done: string[];
  last: { slug: string; step: number; at: number } | null;
  resume: Record<string, Resume>;
}

export const emptyProgress = (): ProgressData => ({ v: 2, done: [], last: null, resume: {} });

/** Accepts anything stored before (an array of finished slugs, or a v2 object) and returns v2. */
export function normaliseProgress(raw: unknown): ProgressData {
  if (Array.isArray(raw)) return { ...emptyProgress(), done: raw.filter((s): s is string => typeof s === 'string') };
  if (!raw || typeof raw !== 'object') return emptyProgress();
  const r = raw as Partial<ProgressData>;
  const done = Array.isArray(r.done) ? r.done.filter((s): s is string => typeof s === 'string') : [];
  const last = r.last && typeof r.last.slug === 'string' && Number.isFinite(r.last.step) && Number.isFinite(r.last.at) ? { slug: r.last.slug, step: r.last.step, at: r.last.at } : null;
  const resume: Record<string, Resume> = {};
  if (r.resume && typeof r.resume === 'object') {
    for (const [slug, v] of Object.entries(r.resume)) {
      if (v && Number.isFinite(v.step) && Number.isFinite(v.at)) resume[slug] = { step: v.step, radio: v.radio && Array.isArray(v.radio.mem) ? v.radio : null, at: v.at };
    }
  }
  return { v: 2, done, last, resume };
}

/** Two devices' progress combined: finished lessons add up, and for positions the newest wins. */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const done = [...new Set([...a.done, ...b.done])];
  const last = !a.last ? b.last : !b.last ? a.last : a.last.at >= b.last.at ? a.last : b.last;
  const resume: Record<string, Resume> = {};
  for (const slug of new Set([...Object.keys(a.resume), ...Object.keys(b.resume)])) {
    const x = a.resume[slug], y = b.resume[slug];
    resume[slug] = !x ? y! : !y ? x : x.at >= y.at ? x : y;
  }
  return { v: 2, done, last, resume };
}
