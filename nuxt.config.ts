export default defineNuxtConfig({
  extends: ['./ui'],
  compatibilityDate: '2026-10-01',
  ssr: true,
  css: ['~/assets/css/app.css'],
  // Icons named in data files (the lessons) aren't found by the bundle scan.
  icon: {
    clientBundle: {
      icons: ['lucide:cloud-check', 'lucide:loader-circle', 'lucide:log-out', 'lucide:trash-2', 'lucide:scan-search', 'lucide:power', 'lucide:volume-2', 'lucide:audio-lines', 'lucide:radio', 'lucide:waves', 'lucide:scale', 'lucide:bookmark', 'lucide:radar', 'lucide:messages-square', 'lucide:satellite', 'lucide:signal', 'lucide:settings-2', 'lucide:settings'],
    },
  },
  app: {
    head: {
      title: 'Radio lessons',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'format-detection', content: 'telephone=no' }],
      // Shared opt-in banner; loads Cloudflare Web Analytics only after consent.
      script: [{ src: 'https://tools.atlesque.dev/consent.js', defer: true }],
    },
  },
  // Static output only; without this, Nitro switches to its Cloudflare preset inside Workers Builds.
  nitro: { preset: 'static', prerender: { routes: ['/', '/nl', '/sitemap.xml', '/auth/verify', '/nl/auth/verify', '/account', '/nl/account'], crawlLinks: true, ignore: [/\?/] } },
  vite: {
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/controls/OrbitControls.js',
        'three/examples/jsm/environments/RoomEnvironment.js',
        'three/examples/jsm/geometries/RoundedBoxGeometry.js',
        'three/examples/jsm/utils/BufferGeometryUtils.js',
      ],
    },
  },
});
