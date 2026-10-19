<script setup lang="ts">
// Account settings: who you're signed in as, a copy of your data, sign out, and (at the bottom)
// deleting the account, which asks you to type your email address first.
definePageMeta({ validate: (route) => !route.params.lang || route.params.lang === 'nl' });
const { t, to, lang } = useLang();
useHead({ title: () => t({ en: 'Account settings · radio lessons', nl: 'Accountinstellingen · radiolessen' }), meta: [{ name: 'robots', content: 'noindex' }] });

const account = useAccount();
const progress = useProgress();

const since = computed(() => (account.createdAt.value
  ? new Date(account.createdAt.value).toLocaleDateString(lang.value === 'nl' ? 'nl-BE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  : null));

/** Everything the account holds, as a JSON file (the server copy is merged into this browser's on sign-in). */
function download() {
  const data = { email: account.email.value, createdAt: account.createdAt.value ? new Date(account.createdAt.value).toISOString() : null, progress: progress.data.value };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'radio-lessons-account.json' });
  a.click();
  URL.revokeObjectURL(url);
}

async function signOut() {
  await account.signOut();
  progress.reset();
  await navigateTo(to('/'));
}

const confirmOpen = ref(false);
const typed = ref('');
const deleting = ref(false);
const deleteError = ref('');
const matches = computed(() => !!account.email.value && typed.value.trim().toLowerCase() === account.email.value);
watch(confirmOpen, (open) => { if (open) { typed.value = ''; deleteError.value = ''; } });

async function remove() {
  if (!matches.value) return;
  deleting.value = true;
  deleteError.value = '';
  const result = await account.deleteAccount(typed.value);
  deleting.value = false;
  if (result === 'deleted') {
    confirmOpen.value = false;
    progress.reset();
    await navigateTo(to('/'));
    return;
  }
  deleteError.value = result === 'offline'
    ? t({ en: 'No connection. Check your internet and try again.', nl: 'Geen verbinding. Controleer je internet en probeer opnieuw.' })
    : t({ en: 'Your account could not be deleted. Please try again.', nl: 'Je account kon niet verwijderd worden. Probeer opnieuw.' });
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="font-display text-3xl text-highlighted sm:text-4xl">{{ t({ en: 'Account settings', nl: 'Accountinstellingen' }) }}</h1>

    <div v-if="account.status.value === 'unknown'" class="mt-10 flex justify-center">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
    </div>

    <div v-else-if="account.status.value === 'signed-out'" class="mt-6 rounded-lg border border-default p-5">
      <p class="leading-relaxed text-toned">
        {{ t({ en: 'You\'re not signed in. Sign in to see your account and save your progress on all your devices.', nl: 'Je bent niet aangemeld. Meld je aan om je account te zien en je voortgang op al je toestellen te bewaren.' }) }}
      </p>
      <UButton class="mt-4" icon="i-lucide-log-in" :label="t({ en: 'Sign in', nl: 'Aanmelden' })" @click="account.signInOpen.value = true" />
    </div>

    <template v-else>
      <section class="mt-6 rounded-lg border border-default p-5">
        <h2 class="font-semibold text-highlighted">{{ t({ en: 'Your account', nl: 'Je account' }) }}</h2>
        <dl class="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt class="text-muted">{{ t({ en: 'Email address', nl: 'E-mailadres' }) }}</dt>
          <dd class="break-all text-highlighted">{{ account.email.value }}</dd>
          <template v-if="since">
            <dt class="text-muted">{{ t({ en: 'Account since', nl: 'Account sinds' }) }}</dt>
            <dd class="text-highlighted">{{ since }}</dd>
          </template>
          <dt class="text-muted">{{ t({ en: 'Finished lessons', nl: 'Afgewerkte lessen' }) }}</dt>
          <dd class="text-highlighted">{{ progress.done.value.length }}</dd>
        </dl>
        <p class="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <UIcon :name="account.syncing.value ? 'i-lucide-loader-circle' : 'i-lucide-cloud-check'" class="size-4" />
          {{ account.syncing.value ? t({ en: 'Saving…', nl: 'Bezig met opslaan…' }) : t({ en: 'Progress saved to your account', nl: 'Voortgang opgeslagen in je account' }) }}
        </p>
        <UButton class="mt-4" color="neutral" variant="outline" icon="i-lucide-log-out" :label="t({ en: 'Sign out', nl: 'Afmelden' })" @click="signOut" />
      </section>

      <section class="mt-4 rounded-lg border border-default p-5">
        <h2 class="font-semibold text-highlighted">{{ t({ en: 'Your data', nl: 'Je gegevens' }) }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-toned">
          {{ t({ en: 'Your account holds your email address and your lesson progress, nothing else.', nl: 'Je account bevat je e-mailadres en je voortgang in de lessen, verder niets.' }) }}
          <NuxtLink :to="to('/privacy')" class="text-primary underline underline-offset-2">{{ t({ en: 'How we handle your data', nl: 'Hoe we met je gegevens omgaan' }) }}</NuxtLink>
        </p>
        <UButton class="mt-4" color="neutral" variant="outline" icon="i-lucide-download" :label="t({ en: 'Download my data', nl: 'Download mijn gegevens' })" @click="download" />
      </section>

      <section class="mt-10 rounded-lg border border-error/40 p-5">
        <h2 class="font-semibold text-error">{{ t({ en: 'Delete account', nl: 'Account verwijderen' }) }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-toned">
          {{ t({ en: 'Permanently removes your email address, your saved progress and every signed-in session on all your devices. This can\'t be undone.', nl: 'Verwijdert definitief je e-mailadres, je opgeslagen voortgang en elke aanmelding op al je toestellen. Dit kan niet ongedaan worden.' }) }}
        </p>
        <UButton class="mt-4" color="error" variant="soft" icon="i-lucide-trash-2" :label="t({ en: 'Delete my account', nl: 'Mijn account verwijderen' })" @click="confirmOpen = true" />
      </section>
    </template>

    <UModal
      v-model:open="confirmOpen"
      :title="t({ en: 'Delete your account?', nl: 'Je account verwijderen?' })"
      :description="t({ en: 'This removes your email address and the progress saved in your account. It can\'t be undone.', nl: 'Dit verwijdert je e-mailadres en de voortgang in je account. Dit kan niet ongedaan worden.' })"
    >
      <template #body>
        <form class="flex flex-col gap-3" @submit.prevent="remove">
          <UFormField :error="deleteError || undefined">
            <template #label>
              {{ t({ en: 'To confirm, type your email address', nl: 'Typ ter bevestiging je e-mailadres' }) }}
              <span class="font-medium text-highlighted">{{ account.email.value }}</span>
            </template>
            <UInput v-model="typed" type="email" autocomplete="off" autofocus class="w-full" :disabled="deleting" />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" :label="t({ en: 'Cancel', nl: 'Annuleren' })" @click="confirmOpen = false" />
          <UButton color="error" icon="i-lucide-trash-2" :disabled="!matches" :loading="deleting" :label="t({ en: 'Delete account', nl: 'Account verwijderen' })" @click="remove" />
        </div>
      </template>
    </UModal>
  </main>
</template>
