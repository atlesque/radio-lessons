<script setup lang="ts">
import { MHz } from '~/radio/bands';
import { createSession } from '~/radio/session';
import { tuned } from '~/lessons/helpers';
import { LESSONS, lessonBySlug } from '~/lessons/lessons';

definePageMeta({ validate: (route) => !route.params.lang || route.params.lang === 'nl' });
const { t, to } = useLang();
const { data, isDone, resumeOf } = useProgress();
const account = useAccount();
usePageSeo({
  path: '/',
  title: () => t({ en: 'Radio lessons: get started with the Icom IC-R5', nl: 'Radiolessen: aan de slag met de Icom IC-R5' }),
  description: () => t({
    en: 'Interactive lessons with a 3D Icom IC-R5 that teach you, key by key, how to receive radio signals in Belgium: FM broadcast, PMR446, CB, radio amateurs and the ISS.',
    nl: 'Interactieve lessen met een 3D-Icom IC-R5 die je toets per toets leren radiosignalen te ontvangen in België: FM-omroep, PMR446, CB, radioamateurs en het ISS.',
  }),
});

const session = createSession();
onBeforeUnmount(() => session.dispose());
onMounted(() => session.radio.load(tuned(MHz(100.6), 'WFM', { vol: 8 })));

const totalMinutes = LESSONS.reduce((a, l) => a + l.minutes, 0);
const nextLesson = computed(() => LESSONS.find((l) => !isDone(l.slug)) ?? LESSONS[0]!);
const anyDone = computed(() => LESSONS.some((l) => isDone(l.slug)));
/** The lesson and step last worked on, if it wasn't finished. */
const resume = computed(() => {
  const last = data.value.last;
  const lesson = last && last.step >= 0 ? lessonBySlug(last.slug) : null;
  if (!lesson || !last) return null;
  return { lesson, n: LESSONS.indexOf(lesson) + 1, step: last.step, to: to(`/lessons/${lesson.slug}?step=${last.step + 1}`) };
});
const inProgress = (slug: string) => {
  const r = resumeOf(slug);
  return r && r.step > 0 && !isDone(slug) ? r.step + 1 : null;
};
/** Card and icon-tile classes that set done, in progress and not started apart. */
const cardTone = (slug: string) => isDone(slug)
  ? { card: 'border-success/60 ring-1 ring-success/40 bg-[color-mix(in_srgb,var(--ui-success)_6%,var(--ui-bg))] hover:border-success hover:bg-[color-mix(in_srgb,var(--ui-success)_10%,var(--ui-bg))]', icon: 'bg-success/15 text-success' }
  : inProgress(slug)
    ? { card: 'border-default bg-[color-mix(in_srgb,var(--ui-secondary)_6%,var(--ui-bg))] hover:border-accented hover:bg-[color-mix(in_srgb,var(--ui-secondary)_10%,var(--ui-bg))]', icon: 'bg-secondary/15 text-secondary' }
    : { card: 'border-default bg-default hover:border-accented hover:bg-elevated/60', icon: 'bg-elevated text-primary' };
</script>

<template>
  <main>
    <section class="mx-auto grid max-w-6xl items-center gap-6 px-4 pt-8 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pt-12">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
          {{ t({ en: 'Icom IC-R5 · receive only · Belgium', nl: 'Icom IC-R5 · alleen ontvangen · België' }) }}
        </p>
        <h1 class="mt-3 font-display text-4xl leading-[1.05] text-highlighted sm:text-5xl">
          {{ t({ en: 'Learn to listen with your IC-R5', nl: 'Leer luisteren met je IC-R5' }) }}
        </h1>
        <p class="mt-4 max-w-xl text-base leading-relaxed text-toned">
          {{ t({
            en: 'Step-by-step lessons on a 3D model of the radio. Each lesson lights up the key to press, checks that you did it, and explains what happened, from switching on to scanning, walkie-talkies and the International Space Station.',
            nl: 'Lessen stap voor stap op een 3D-model van de radio. Elke les licht de toets op die je moet indrukken, controleert of je het deed en legt uit wat er gebeurde, van aanzetten tot scannen, walkietalkies en het internationale ruimtestation.',
          }) }}
        </p>
        <div class="mt-6 flex flex-wrap gap-2">
          <UButton
            v-if="resume"
            :to="resume.to"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            :label="`${t({ en: 'Continue lesson', nl: 'Verder met les' })} ${resume.n} · ${t({ en: 'step', nl: 'stap' })} ${resume.step + 1}`"
          />
          <UButton
            v-else
            :to="to(`/lessons/${nextLesson.slug}`)"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            :label="anyDone ? `${t({ en: 'Next: lesson', nl: 'Volgende: les' })} ${LESSONS.indexOf(nextLesson) + 1}` : t({ en: 'Start lesson 1', nl: 'Start les 1' })"
          />
          <UButton :to="to('/play')" size="lg" color="neutral" variant="outline" icon="i-lucide-gamepad-2" :label="t({ en: 'Free play', nl: 'Vrij spelen' })" />
        </div>
        <p v-if="resume" class="mt-3 text-sm text-toned">
          {{ t({ en: 'Last time:', nl: 'Vorige keer:' }) }} <span class="font-medium text-highlighted">{{ t(resume.lesson.title) }}</span>
        </p>
        <ClientOnly>
          <p v-if="account.status.value === 'signed-out'" class="mt-3 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
            <UIcon name="i-lucide-cloud" class="size-4" />
            {{ t({ en: 'Your progress is saved in this browser.', nl: 'Je voortgang wordt in deze browser bewaard.' }) }}
            <button type="button" class="font-medium text-primary underline underline-offset-2" @click="account.signInOpen.value = true">
              {{ t({ en: 'Sign in to keep it on all your devices', nl: 'Meld je aan om ze op al je toestellen te hebben' }) }}
            </button>
          </p>
          <p v-else-if="account.status.value === 'signed-in'" class="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <UIcon name="i-lucide-cloud-check" class="size-4 text-success" />
            {{ t({ en: 'Signed in as', nl: 'Aangemeld als' }) }} <span class="font-medium text-toned">{{ account.email.value }}</span> · {{ t({ en: 'progress saved', nl: 'voortgang bewaard' }) }}
          </p>
        </ClientOnly>
        <p class="mt-4 text-sm text-muted">
          {{ LESSONS.length }} {{ t({ en: 'lessons', nl: 'lessen' }) }} · {{ t({ en: 'about', nl: 'ongeveer' }) }} {{ totalMinutes }} {{ t({ en: 'minutes', nl: 'minuten' }) }} · English &amp; Nederlands
        </p>
      </div>
      <div class="stage relative h-[380px] overflow-hidden rounded-xl border border-default sm:h-[480px]">
        <ClientOnly>
          <RadioViewer :session="session" view="overview" idle-spin :keyboard="false" :wheel-zoom="false" />
        </ClientOnly>
        <p class="pointer-events-none absolute bottom-2 left-3 text-[0.7rem] text-dimmed">
          {{ t({ en: 'Drag to turn · scroll over the knob to tune', nl: 'Sleep om te draaien · scrol boven de knop om af te stemmen' }) }}
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-8" aria-labelledby="lessons-title">
      <h2 id="lessons-title" class="font-display text-2xl text-highlighted">{{ t({ en: 'The lessons', nl: 'De lessen' }) }}</h2>
      <ol class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="(l, i) in LESSONS" :key="l.slug">
          <NuxtLink
            :to="to(`/lessons/${l.slug}`) + (inProgress(l.slug) ? `?step=${inProgress(l.slug)}` : '')"
            class="group flex h-full gap-3 rounded-lg border p-4 transition focus-visible:outline-2 focus-visible:outline-primary"
            :class="cardTone(l.slug).card"
          >
            <span class="grid size-10 shrink-0 place-items-center rounded-md" :class="cardTone(l.slug).icon">
              <UIcon :name="l.icon" class="size-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2 text-xs font-semibold text-muted">
                {{ t({ en: 'Lesson', nl: 'Les' }) }} {{ i + 1 }} · {{ l.minutes }} min
                <UBadge v-if="isDone(l.slug)" color="success" variant="subtle" size="sm" icon="i-lucide-check" :label="t({ en: 'Done', nl: 'Klaar' })" />
                <UBadge v-else-if="inProgress(l.slug)" color="secondary" variant="subtle" size="sm" icon="i-lucide-circle-play" :label="`${t({ en: 'Step', nl: 'Stap' })} ${inProgress(l.slug)}/${l.steps.length}`" />
              </span>
              <span class="mt-0.5 block font-semibold text-highlighted group-hover:underline">{{ t(l.title) }}</span>
              <span class="mt-1 block text-sm leading-snug text-muted">{{ t(l.summary) }}</span>
              <span v-if="inProgress(l.slug)" class="mt-3 block h-1 overflow-hidden rounded-full bg-secondary/15" aria-hidden="true">
                <span class="block h-full rounded-full bg-secondary" :style="{ width: `${((inProgress(l.slug)! - 1) / l.steps.length) * 100}%` }" />
              </span>
            </span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section class="mx-auto grid max-w-6xl gap-3 px-4 pb-12 sm:grid-cols-3">
      <div class="rounded-lg border border-default bg-default p-4">
        <UIcon name="i-lucide-radio-tower" class="size-5 text-primary" />
        <h3 class="mt-2 font-semibold text-highlighted">{{ t({ en: 'Receive only', nl: 'Alleen ontvangen' }) }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ t({ en: 'The IC-R5 cannot transmit, so owning and using it needs no licence.', nl: 'De IC-R5 kan niet zenden, dus voor bezit en gebruik heb je geen vergunning nodig.' }) }}</p>
      </div>
      <NuxtLink :to="to('/lessons/listening-rules')" class="rounded-lg border border-default bg-default p-4 transition hover:border-accented">
        <UIcon name="i-lucide-scale" class="size-5 text-primary" />
        <h3 class="mt-2 font-semibold text-highlighted">{{ t({ en: 'What\'s allowed in Belgium', nl: 'Wat mag in België' }) }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ t({ en: 'Broadcast, radio amateurs, CB and PMR446 are free to listen to. Aviation, maritime and emergency services are not.', nl: 'Omroep, radioamateurs, CB en PMR446 zijn vrij te beluisteren. Luchtvaart, maritiem en hulpdiensten niet.' }) }}</p>
      </NuxtLink>
      <NuxtLink :to="to('/frequencies')" class="rounded-lg border border-default bg-default p-4 transition hover:border-accented">
        <UIcon name="i-lucide-list" class="size-5 text-primary" />
        <h3 class="mt-2 font-semibold text-highlighted">{{ t({ en: 'Frequency guide', nl: 'Frequentiegids' }) }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ t({ en: 'VRT stations per region, PMR446 and CB channels, amateur and ISS frequencies.', nl: 'VRT-zenders per regio, PMR446- en CB-kanalen, amateur- en ISS-frequenties.' }) }}</p>
      </NuxtLink>
    </section>
    <AppFooter />
  </main>
</template>
