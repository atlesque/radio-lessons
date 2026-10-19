<script setup lang="ts">
const { t, to, lang, other } = useLang();
const route = useRoute();
const links = computed(() => [
  { label: t({ en: 'Lessons', nl: 'Lessen' }), to: to('/'), active: route.path === to('/') || route.path.includes('/lessons/') },
  { label: t({ en: 'Free play', nl: 'Vrij spelen' }), to: to('/play'), active: route.path.endsWith('/play') },
  { label: t({ en: 'Frequencies', nl: 'Frequenties' }), to: to('/frequencies'), active: route.path.endsWith('/frequencies') },
  { label: t({ en: 'Glossary', nl: 'Woordenlijst' }), to: to('/glossary'), active: route.path.endsWith('/glossary') },
]);
// Each language in its own name; the current one is ticked and can't be picked.
const languages = computed(() => (['en', 'nl'] as const).map((code) => ({
  label: code === 'en' ? 'English' : 'Nederlands',
  type: 'checkbox' as const,
  checked: lang.value === code,
  disabled: lang.value === code,
  onSelect: () => navigateTo(other.value),
})));
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default bg-default/85 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4">
      <NuxtLink :to="to('/')" :aria-label="t({ en: 'Radio lessons home', nl: 'Radiolessen, startpagina' })" class="shrink-0">
        <BrandMark />
      </NuxtLink>
      <nav class="ms-2 hidden items-center gap-1 sm:flex" :aria-label="t({ en: 'Main', nl: 'Hoofdmenu' })">
        <UButton v-for="l in links" :key="l.to" :to="l.to" :label="l.label" color="neutral" :variant="l.active ? 'soft' : 'ghost'" size="sm" />
      </nav>
      <div class="ms-auto flex items-center gap-1">
        <UDropdownMenu :items="links.map((l) => ({ label: l.label, to: l.to }))" :content="{ align: 'end' }" class="sm:hidden">
          <UButton icon="i-lucide-menu" color="neutral" variant="ghost" size="sm" :aria-label="t({ en: 'Menu', nl: 'Menu' })" />
        </UDropdownMenu>
        <ClientOnly><AccountMenu /><template #fallback><USkeleton class="h-8 w-8 md:w-16" aria-hidden="true" /></template></ClientOnly>
        <UDropdownMenu :items="languages" :content="{ align: 'end' }">
          <UButton icon="i-lucide-globe" color="neutral" variant="ghost" size="sm" square :aria-label="t({ en: 'Language: English', nl: 'Taal: Nederlands' })" :title="t({ en: 'Language', nl: 'Taal' })" />
        </UDropdownMenu>
        <ThemeSwitch :labels="{ light: t({ en: 'Theme: light', nl: 'Thema: licht' }), dark: t({ en: 'Theme: dark', nl: 'Thema: donker' }), system: t({ en: 'Theme: automatic', nl: 'Thema: automatisch' }) }" />
      </div>
    </div>
  </header>
</template>
