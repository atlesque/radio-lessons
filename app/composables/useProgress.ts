// Lesson progress for this browser, kept in localStorage. When signed in, useAccount also syncs it to the server.
import { emptyProgress, normaliseProgress, type PackedRadio, type ProgressData } from '~/progress/model';

const KEY = 'radio-lessons-progress';

export function useProgress() {
  const data = useState<ProgressData>('progress', emptyProgress);
  const loaded = useState('progress-loaded', () => false);
  /** Bumped on every local change, so the account sync knows to upload. */
  const changes = useState('progress-changes', () => 0);
  onMounted(() => {
    if (loaded.value) return;
    loaded.value = true;
    try { data.value = normaliseProgress(JSON.parse(localStorage.getItem(KEY) ?? 'null')); } catch { /* storage blocked */ }
  });
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(data.value)); } catch { /* storage blocked */ }
    changes.value++;
  };
  const replace = (next: ProgressData) => {
    data.value = next;
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
  };
  const done = computed(() => data.value.done);
  const isDone = (slug: string) => data.value.done.includes(slug);
  const markDone = (slug: string) => {
    const { [slug]: _, ...resume } = data.value.resume;
    data.value = { ...data.value, done: [...new Set([...data.value.done, slug])], resume, last: { slug, step: -1, at: Date.now() } };
    save();
  };
  /** Where a lesson was left: the step index and the radio as it was when that step began. */
  const setPosition = (slug: string, step: number, radio: PackedRadio | null, sig?: string) => {
    const at = Date.now();
    data.value = { ...data.value, last: { slug, step, at }, resume: { ...data.value.resume, [slug]: { step, radio, at, sig } } };
    save();
  };
  const resumeOf = (slug: string) => data.value.resume[slug] ?? null;
  const reset = () => { replace(emptyProgress()); changes.value++; };
  return { data, loaded, done, changes, isDone, markDone, setPosition, resumeOf, replace, reset };
}
