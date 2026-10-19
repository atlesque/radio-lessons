<script setup lang="ts">
// Sign in with a link by email, see that progress is saved, sign out or delete the account.
const { t, lang, to } = useLang();
const route = useRoute();
const account = useAccount();
const progress = useProgress();

const address = ref('');
const phase = ref<'form' | 'sending' | 'sent'>('form');
const error = ref('');
const confirmDelete = ref(false);
const deleting = ref(false);

watch(account.signInOpen, (open) => { if (open) { phase.value = 'form'; error.value = ''; } });

const ERRORS: Record<string, { en: string; nl: string }> = {
  invalid_email: { en: 'That doesn\'t look like an email address.', nl: 'Dat lijkt geen e-mailadres.' },
  too_many: { en: 'Too many links requested. Please wait an hour and try again.', nl: 'Te veel links aangevraagd. Wacht een uur en probeer opnieuw.' },
  email_failed: { en: 'The email could not be sent. Please try again later.', nl: 'De e-mail kon niet verstuurd worden. Probeer later opnieuw.' },
  offline: { en: 'No connection. Check your internet and try again.', nl: 'Geen verbinding. Controleer je internet en probeer opnieuw.' },
};

async function send() {
  error.value = '';
  phase.value = 'sending';
  // Come back to this page after signing in (but not to the link page itself).
  const next = route.path.includes('/auth/verify') ? to('/') : route.fullPath;
  const result = await account.requestLink(address.value, lang.value, next);
  if (result === 'sent') { phase.value = 'sent'; return; }
  phase.value = 'form';
  error.value = t(ERRORS[result] ?? { en: 'Something went wrong. Please try again.', nl: 'Er ging iets mis. Probeer opnieuw.' });
}

async function signOut() {
  await account.signOut();
  // Progress stays in the account; this browser forgets it so the next person starts clean.
  progress.reset();
}

async function remove() {
  deleting.value = true;
  const ok = await account.deleteAccount();
  deleting.value = false;
  if (ok) { confirmDelete.value = false; progress.reset(); }
}

const syncLabel = computed(() => (account.syncing.value
  ? t({ en: 'Saving…', nl: 'Bezig met opslaan…' })
  : t({ en: 'Progress saved to your account', nl: 'Voortgang opgeslagen in je account' })));

const items = computed(() => [
  [{ label: account.email.value ?? '', type: 'label' as const }],
  [{ label: syncLabel.value, icon: account.syncing.value ? 'i-lucide-loader-circle' : 'i-lucide-cloud-check', disabled: true }],
  [
    { label: t({ en: 'Sign out', nl: 'Afmelden' }), icon: 'i-lucide-log-out', onSelect: () => { void signOut(); } },
    { label: t({ en: 'Delete account', nl: 'Account verwijderen' }), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => { confirmDelete.value = true; } },
  ],
]);
</script>

<template>
  <div class="flex items-center">
    <USkeleton v-if="account.status.value === 'unknown'" class="h-8 w-8 md:w-16" aria-hidden="true" />
    <UButton
      v-else-if="account.status.value === 'signed-out'"
      icon="i-lucide-log-in"
      color="neutral"
      variant="ghost"
      size="sm"
      :aria-label="t({ en: 'Sign in', nl: 'Aanmelden' })"
      @click="account.signInOpen.value = true"
    >
      <span class="hidden md:inline">{{ t({ en: 'Sign in', nl: 'Aanmelden' }) }}</span>
    </UButton>
    <UDropdownMenu v-else :items="items" :content="{ align: 'end' }">
      <UButton icon="i-lucide-circle-user-round" color="neutral" variant="ghost" size="sm" square :aria-label="t({ en: 'Account', nl: 'Account' })" :title="account.email.value ?? ''" />
    </UDropdownMenu>

    <UModal
      v-model:open="account.signInOpen.value"
      :title="t({ en: 'Save your progress', nl: 'Bewaar je voortgang' })"
      :description="t({ en: 'Sign in with a link by email. No password needed.', nl: 'Meld je aan met een link per e-mail. Geen wachtwoord nodig.' })"
    >
      <template #body>
        <div v-if="phase === 'sent'" class="flex gap-3" aria-live="polite">
          <UIcon name="i-lucide-mail-check" class="mt-0.5 size-5 shrink-0 text-success" />
          <div class="text-sm leading-relaxed text-toned">
            <p class="font-semibold text-highlighted">{{ t({ en: 'Check your inbox', nl: 'Kijk in je mailbox' }) }}</p>
            <p class="mt-1">
              {{ t({ en: 'We sent a sign-in link to', nl: 'We stuurden een aanmeldlink naar' }) }} <span class="font-medium text-highlighted">{{ address }}</span>.
              {{ t({ en: 'It works once and expires in 15 minutes. Open it on this device to continue here.', nl: 'Hij werkt één keer en vervalt na 15 minuten. Open hem op dit toestel om hier verder te gaan.' }) }}
            </p>
            <p class="mt-2 text-muted">{{ t({ en: 'Nothing after a few minutes? Check your spam folder.', nl: 'Na een paar minuten niets? Kijk in je spammap.' }) }}</p>
          </div>
        </div>
        <form v-else class="flex flex-col gap-3" @submit.prevent="send">
          <UFormField :label="t({ en: 'Email address', nl: 'E-mailadres' })" :error="error || undefined">
            <UInput v-model="address" type="email" autocomplete="email" required autofocus class="w-full" size="lg" :placeholder="t({ en: 'name@example.com', nl: 'naam@voorbeeld.be' })" :disabled="phase === 'sending'" />
          </UFormField>
          <UButton type="submit" block size="lg" :loading="phase === 'sending'" icon="i-lucide-mail" :label="t({ en: 'Email me a sign-in link', nl: 'Stuur me een aanmeldlink' })" />
          <p class="text-xs leading-relaxed text-muted">
            {{ t({ en: 'Your progress already works in this browser without an account. Signing in keeps it on all your devices. We only use your email address to sign you in, and you can delete your account at any time.', nl: 'Je voortgang werkt in deze browser ook zonder account. Met een account heb je ze op al je toestellen. We gebruiken je e-mailadres alleen om je aan te melden, en je kunt je account altijd verwijderen.' }) }}
          </p>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="confirmDelete"
      :title="t({ en: 'Delete your account?', nl: 'Je account verwijderen?' })"
      :description="t({ en: 'This removes your email address and the progress saved in your account. It can\'t be undone.', nl: 'Dit verwijdert je e-mailadres en de voortgang in je account. Dit kan niet ongedaan worden.' })"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" :label="t({ en: 'Cancel', nl: 'Annuleren' })" @click="confirmDelete = false" />
          <UButton color="error" icon="i-lucide-trash-2" :loading="deleting" :label="t({ en: 'Delete account', nl: 'Account verwijderen' })" @click="remove" />
        </div>
      </template>
    </UModal>
  </div>
</template>
