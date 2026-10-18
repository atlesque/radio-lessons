<script setup lang="ts">
// An underlined word in lesson text; clicking it explains the term in plain language.
import { GLOSSARY_BY_ID } from '~/lessons/glossary';
import { LESSONS } from '~/lessons/lessons';

const props = defineProps<{ id: string; text: string }>();
const { t, to } = useLang();
const route = useRoute();
const entry = computed(() => GLOSSARY_BY_ID[props.id]!);
const lesson = computed(() => {
  const slug = entry.value.lesson;
  if (!slug || route.path.endsWith(`/lessons/${slug}`)) return null;
  const i = LESSONS.findIndex((l) => l.slug === slug);
  return i < 0 ? null : { n: i + 1, title: t(LESSONS[i]!.title), to: to(`/lessons/${slug}`) };
});
</script>

<template>
  <UPopover :content="{ side: 'top', sideOffset: 6, collisionPadding: 12 }" arrow>
    <button type="button" class="glossary-term" :aria-label="`${text}: ${t({ en: 'explain', nl: 'uitleg' })}`">{{ text }}</button>
    <template #content>
      <div class="max-w-[19rem] p-3 text-sm leading-relaxed" role="note">
        <p class="font-semibold text-highlighted">{{ t(entry.title) }}</p>
        <p class="mt-1 text-toned">{{ t(entry.text) }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <NuxtLink v-if="lesson" :to="lesson.to" class="font-medium text-primary underline underline-offset-2">
            {{ t({ en: 'More in lesson', nl: 'Meer in les' }) }} {{ lesson.n }}
          </NuxtLink>
          <NuxtLink :to="`${to('/glossary')}#${id}`" class="text-muted underline underline-offset-2">
            {{ t({ en: 'All terms', nl: 'Alle termen' }) }}
          </NuxtLink>
        </div>
      </div>
    </template>
  </UPopover>
</template>
