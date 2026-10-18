// Which lessons this browser has finished. Kept in localStorage: a per-viewer convenience only.
const KEY = 'radio-lessons-progress';

export function useProgress() {
  const done = useState<string[]>('progress', () => []);
  const loaded = useState('progress-loaded', () => false);
  onMounted(() => {
    if (loaded.value) return;
    loaded.value = true;
    try { done.value = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { /* storage blocked */ }
  });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done.value)); } catch { /* storage blocked */ } };
  const markDone = (slug: string) => { if (!done.value.includes(slug)) { done.value = [...done.value, slug]; save(); } };
  const reset = () => { done.value = []; save(); };
  const isDone = (slug: string) => done.value.includes(slug);
  return { done, markDone, isDone, reset };
}
