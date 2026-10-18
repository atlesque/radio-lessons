// Runs before first paint: applies the saved Light/Dark/System theme (System when nothing is saved).
(() => {
  const root = document.documentElement;
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const media = matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    const saved = read('radio-lessons-theme');
    root.classList.toggle('dark', saved === 'dark' || (saved !== 'light' && media.matches));
  };
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('storage', (event) => { if (event.key === 'radio-lessons-theme') apply(); });
})();
