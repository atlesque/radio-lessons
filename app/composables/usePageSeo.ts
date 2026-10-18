export const SITE = 'https://radio-lessons.atlesque.dev';

/** Title, description, canonical URL and the English/Dutch alternates for a page. `path` is the English path. */
export function usePageSeo(opts: { title: () => string; description: () => string; path: string }) {
  const { lang } = useLang();
  const nlPath = opts.path === '/' ? '/nl' : `/nl${opts.path}`;
  const url = computed(() => `${SITE}${lang.value === 'nl' ? nlPath : opts.path}`);
  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogType: 'website',
    ogUrl: url,
    ogImage: `${SITE}/og.jpg`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: 'radio lessons: learn to listen with your Icom IC-R5',
    ogLocale: () => (lang.value === 'nl' ? 'nl_BE' : 'en_GB'),
    twitterCard: 'summary_large_image',
  });
  useHead({
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: 'en', href: `${SITE}${opts.path}` },
      { rel: 'alternate', hreflang: 'nl', href: `${SITE}${nlPath}` },
      { rel: 'alternate', hreflang: 'x-default', href: `${SITE}${opts.path}` },
    ],
  });
}

export const validLang = (route: { params: Record<string, unknown> }) => !route.params.lang || route.params.lang === 'nl';
