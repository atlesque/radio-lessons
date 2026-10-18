<script setup lang="ts">
import { GLOSSARY } from '~/lessons/glossary';
import { LESSONS } from '~/lessons/lessons';

definePageMeta({ validate: (route) => !route.params.lang || route.params.lang === 'nl' });
const { t, to, lang } = useLang();
usePageSeo({
  path: '/glossary',
  title: () => t({ en: 'Radio glossary for beginners · IC-R5 radio lessons', nl: 'Radiowoordenlijst voor beginners · IC-R5-radiolessen' }),
  description: () => t({
    en: 'Radio words and acronyms explained in plain language: frequency, squelch, FM and WFM, VHF and UHF, PMR446, CB, repeaters and more.',
    nl: 'Radiowoorden en afkortingen in gewone taal uitgelegd: frequentie, squelch, FM en WFM, VHF en UHF, PMR446, CB, relais en meer.',
  }),
});

const query = ref('');
const entries = computed(() => {
  const q = query.value.trim().toLowerCase();
  return [...GLOSSARY]
    .sort((a, b) => t(a.title).localeCompare(t(b.title), lang.value))
    .filter((g) => !q || t(g.title).toLowerCase().includes(q) || t(g.text).toLowerCase().includes(q) || g[lang.value].some((s) => s.toLowerCase().includes(q)));
});
const lessonOf = (slug?: string) => {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  return i < 0 ? null : { n: i + 1, title: t(LESSONS[i]!.title), to: to(`/lessons/${slug}`) };
};
</script>

<template>
  <main>
    <div class="mx-auto max-w-3xl px-4 py-8">
      <h1 class="font-display text-3xl text-highlighted sm:text-4xl">{{ t({ en: 'Glossary', nl: 'Woordenlijst' }) }}</h1>
      <p class="mt-3 leading-relaxed text-toned">
        {{ t({ en: 'Every acronym and technical word from the lessons, explained for someone who has never used a radio. In the lessons, click an underlined word to see its explanation.', nl: 'Elke afkorting en elk technisch woord uit de lessen, uitgelegd voor wie nog nooit een radio gebruikte. Klik in de lessen op een onderstreept woord om de uitleg te zien.' }) }}
      </p>
      <UInput v-model="query" icon="i-lucide-search" :placeholder="t({ en: 'Search the glossary', nl: 'Zoek in de woordenlijst' })" class="mt-5 w-full" size="lg" :aria-label="t({ en: 'Search the glossary', nl: 'Zoek in de woordenlijst' })" />
      <dl class="mt-6 divide-y divide-default rounded-lg border border-default">
        <div v-for="g in entries" :id="g.id" :key="g.id" class="scroll-mt-20 p-4 target:bg-elevated/70">
          <dt class="font-semibold text-highlighted">{{ t(g.title) }}</dt>
          <dd class="mt-1 text-sm leading-relaxed text-toned">
            {{ t(g.text) }}
            <NuxtLink v-if="lessonOf(g.lesson)" :to="lessonOf(g.lesson)!.to" class="ms-1 whitespace-nowrap text-primary underline underline-offset-2">
              {{ t({ en: 'Lesson', nl: 'Les' }) }} {{ lessonOf(g.lesson)!.n }}
            </NuxtLink>
          </dd>
        </div>
        <p v-if="!entries.length" class="p-4 text-sm text-muted">{{ t({ en: 'No matching terms.', nl: 'Geen overeenkomende termen.' }) }}</p>
      </dl>
    </div>
    <AppFooter />
  </main>
</template>
