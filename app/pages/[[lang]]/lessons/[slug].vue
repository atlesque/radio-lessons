<script setup lang="ts">
import type { View } from '~/radio/controls';
import { createSession } from '~/radio/session';
import { LESSONS, lessonBySlug } from '~/lessons/lessons';

definePageMeta({
  validate: (route) => (!route.params.lang || route.params.lang === 'nl') && !!LESSONS.find((l) => l.slug === route.params.slug),
});
const route = useRoute();
const { t } = useLang();
const lesson = computed(() => lessonBySlug(String(route.params.slug))!);
const number = computed(() => LESSONS.indexOf(lesson.value) + 1);
const next = computed(() => LESSONS[number.value] ?? null);

usePageSeo({
  path: `/lessons/${lesson.value.slug}`,
  title: () => `${t(lesson.value.title)} · ${t({ en: 'IC-R5 radio lessons', nl: 'IC-R5-radiolessen' })}`,
  description: () => `${t({ en: 'Lesson', nl: 'Les' })} ${number.value}: ${t(lesson.value.summary)}`,
});

const session = createSession();
onBeforeUnmount(() => session.dispose());
const run = useLessonRun(lesson, session);
const view = ref<View>('front');
watch(() => run.view.value, (v) => { view.value = v; }, { immediate: true });
onMounted(() => run.start());
</script>

<template>
  <main class="lg:grid lg:h-[calc(100dvh-3.5rem-1px)] lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
    <section class="stage sticky top-14 z-30 flex flex-col border-b border-default lg:static lg:min-h-0 lg:overflow-hidden lg:border-b-0">
      <div class="relative h-[40dvh] min-h-[240px] sm:h-[46dvh] lg:h-auto lg:min-h-0 lg:flex-1">
        <ClientOnly>
          <RadioViewer :session="session" :highlight="run.highlight.value" :gesture="run.gesture.value" :view="view" @pick="run.pick" />
        </ClientOnly>
      </div>
      <ControlPad v-model:view="view" :session="session" :highlight="run.highlight.value" />
    </section>
    <aside class="border-default lg:overflow-y-auto lg:border-l">
      <LessonPanel :lesson="lesson" :number="number" :total="LESSONS.length" :run="run" :next="next" />
    </aside>
  </main>
</template>
