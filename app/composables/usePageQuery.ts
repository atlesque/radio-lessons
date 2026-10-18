/**
 * The real query string, also while a prerendered page hydrates (see plugins/initial-url), and a way
 * to delay URL changes until hydration is over (Nuxt would put the original address back otherwise).
 * Call in setup; the returned functions can be used later from any callback.
 */
export function usePageQuery() {
  const nuxt = useNuxtApp();
  const route = useRoute();
  const read = () => (nuxt.isHydrating
    ? new URLSearchParams(nuxt.$initialUrl.search)
    : new URLSearchParams(Object.entries(route.query).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : []))));
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(() => fn(), { timeout: 300 }) : setTimeout(fn, 100));
  const afterHydration = (fn: () => void) => {
    if (nuxt.isHydrating) nuxt.hooks.hookOnce('app:suspense:resolve', () => { idle(fn); });
    else fn();
  };
  return { read, afterHydration };
}
