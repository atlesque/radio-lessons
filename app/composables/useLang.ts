import type { L } from '~/radio/bands';

export type Lang = 'en' | 'nl';

/** The language comes from the URL: /nl/… is Dutch, everything else English. */
export function useLang() {
  const route = useRoute();
  const lang = computed<Lang>(() => (route.params.lang === 'nl' ? 'nl' : 'en'));
  const t = (l: L) => l[lang.value];
  /** A path in the current language. */
  const to = (p: string) => (lang.value === 'nl' ? `/nl${p === '/' ? '' : p}` : p);
  /** The current page in the other language. */
  const other = computed(() => {
    const path = route.path.replace(/\/$/, '') || '/';
    if (lang.value === 'nl') return path.replace(/^\/nl/, '') || '/';
    return path === '/' ? '/nl' : `/nl${path}`;
  });
  return { lang, t, to, other };
}
