import { LESSON_SLUGS } from '../../app/lessons/slugs';

const SITE = 'https://radio-lessons.atlesque.dev';

export default defineEventHandler((event) => {
  const paths = ['/', '/play', '/frequencies', ...LESSON_SLUGS.map((s) => `/lessons/${s}`)];
  const nl = (p: string) => (p === '/' ? '/nl' : `/nl${p}`);
  const urls = paths.map((p) => `  <url>
    <loc>${SITE}${p}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${p}"/>
    <xhtml:link rel="alternate" hreflang="nl" href="${SITE}${nl(p)}"/>
  </url>
  <url>
    <loc>${SITE}${nl(p)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${p}"/>
    <xhtml:link rel="alternate" hreflang="nl" href="${SITE}${nl(p)}"/>
  </url>`).join('\n');
  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
});
