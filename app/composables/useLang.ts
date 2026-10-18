import type { L } from '~/radio/bands';

export type Lang = 'en' | 'nl';

/** The language comes from the URL: /nl/… is Dutch, everything else English. */
export function useLang() {
  const route = useRoute();
  const router = useRouter();
  const lang = computed<Lang>(() => (route.params.lang === 'nl' ? 'nl' : 'en'));
  const t = (l: L) => l[lang.value];
  /** A path in the current language. */
  const to = (p: string) => (lang.value === 'nl' ? `/nl${p === '/' ? '' : p}` : p);
  /** The current page in the other language, keeping the query (like ?step=3) and the hash. */
  const other = computed(() => {
    const path = route.path.replace(/\/$/, '') || '/';
    const target = lang.value === 'nl' ? path.replace(/^\/nl/, '') || '/' : path === '/' ? '/nl' : `/nl${path}`;
    return router.resolve({ path: target, query: route.query, hash: route.hash }).fullPath;
  });
  return { lang, t, to, other };
}
