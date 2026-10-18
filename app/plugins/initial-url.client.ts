// The address the page was opened with. While a prerendered page hydrates, Nuxt briefly swaps the URL
// for the one it was built with (no query) and restores it afterwards, so read the query from here.
export default defineNuxtPlugin({
  name: 'initial-url',
  enforce: 'pre',
  setup: () => ({ provide: { initialUrl: new URL(window.location.href) } }),
});
