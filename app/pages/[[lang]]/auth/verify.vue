<script setup lang="ts">
// Where the sign-in email's link lands. The token is exchanged with a POST (link scanners in mail
// programs only fetch the page, so they can't use the link up), then you go back where you were.
definePageMeta({ validate: (route) => !route.params.lang || route.params.lang === 'nl' });
const { t, to } = useLang();
useHead({ title: () => t({ en: 'Signing in · radio lessons', nl: 'Aanmelden · radiolessen' }), meta: [{ name: 'robots', content: 'noindex' }] });

const router = useRouter();
const account = useAccount();
const state = ref<'working' | 'error'>('working');
const error = ref('');

const pageQuery = usePageQuery();
onMounted(() => {
  const token = pageQuery.read().get('token') ?? '';
  // URL changes must wait for hydration to finish, or Nuxt puts the original address back.
  pageQuery.afterHydration(async () => {
    // Drop the token from the address bar and history straight away.
    await router.replace({ query: {} });
    if (!token) { state.value = 'error'; error.value = 'invalid'; return; }
    const result = await account.verify(token);
    if (result.ok) await navigateTo(result.next === '/' ? to('/') : result.next, { replace: true });
    else { state.value = 'error'; error.value = result.error; }
  });
});
</script>

<template>
  <main class="mx-auto max-w-md px-4 py-16 text-center">
    <template v-if="state === 'working'">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
      <p class="mt-4 text-toned">{{ t({ en: 'Signing you in…', nl: 'Je wordt aangemeld…' }) }}</p>
    </template>
    <template v-else>
      <UIcon name="i-lucide-link-2-off" class="size-8 text-error" />
      <h1 class="mt-4 font-display text-2xl text-highlighted">
        {{ error === 'expired' ? t({ en: 'This link has expired', nl: 'Deze link is verlopen' }) : t({ en: 'This link doesn\'t work', nl: 'Deze link werkt niet' }) }}
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-toned">
        {{ t({ en: 'Sign-in links work once and for 15 minutes. Request a new one and use the most recent email.', nl: 'Aanmeldlinks werken één keer en 15 minuten lang. Vraag een nieuwe aan en gebruik de meest recente e-mail.' }) }}
      </p>
      <div class="mt-6 flex justify-center gap-2">
        <UButton icon="i-lucide-mail" :label="t({ en: 'Send a new link', nl: 'Stuur een nieuwe link' })" @click="account.signInOpen.value = true" />
        <UButton :to="to('/')" color="neutral" variant="outline" :label="t({ en: 'Home', nl: 'Startpagina' })" />
      </div>
    </template>
  </main>
</template>
