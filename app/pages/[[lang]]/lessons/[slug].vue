<script setup lang="ts">
import type { View } from '~/radio/controls';
import { createSession } from '~/radio/session';
import { LESSONS, lessonBySlug } from '~/lessons/lessons';
import { packRadio, unpackRadio } from '~/progress/snapshot';

definePageMeta({
  validate: (route) => (!route.params.lang || route.params.lang === 'nl') && !!LESSONS.find((l) => l.slug === route.params.slug),
  // One page per lesson whatever the language, so switching language keeps the lesson where it is.
  key: (route) => `lesson:${route.params.slug}`,
  scrollToTop: false,
});
const route = useRoute();
const router = useRouter();
const { t } = useLang();
const progress = useProgress();
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

/** Keeps ?step= in the URL in step with the lesson (1-based, or "done"). */
const pageQuery = usePageQuery();
function syncUrl(step: number | 'done') {
  pageQuery.afterHydration(() => {
    const query = Object.fromEntries(pageQuery.read());
    if (query.step === String(step)) return;
    void router.replace({ query: { ...query, step: String(step) }, hash: route.hash });
  });
}

const run = useLessonRun(lesson, session, {
  onStep: (i, radio) => {
    syncUrl(i + 1);
    progress.setPosition(lesson.value.slug, i, packRadio(radio));
  },
  onFinish: () => syncUrl('done'),
});
const view = ref<View>('front');
watch(() => run.view.value, (v) => { view.value = v; }, { immediate: true });

onMounted(() => {
  // Wait for useProgress to read localStorage (its own onMounted ran first, in setup order).
  const slug = lesson.value.slug;
  const q = pageQuery.read().get('step');
  if (q === 'done') { run.start({ finished: true }); return; }
  const saved = progress.resumeOf(slug);
  const asked = Number(q);
  const step = Number.isInteger(asked) && asked >= 1 ? asked - 1 : saved?.step ?? 0;
  // The saved radio belongs to the saved step; for any other step, start from the lesson's setup.
  const radio = saved && saved.step === step && saved.radio ? unpackRadio(saved.radio) : null;
  run.start({ step, radio });
});
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
