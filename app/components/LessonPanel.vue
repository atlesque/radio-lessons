<script setup lang="ts">
import type { LessonRun } from '~/composables/useLessonRun';
import type { Lesson } from '~/lessons/types';

const props = defineProps<{ lesson: Lesson; number: number; total: number; run: LessonRun; next: Lesson | null }>();
const { t, to } = useLang();
const run = props.run;
const showAll = ref(false);
const stepCount = computed(() => props.lesson.steps.length);
const doneCount = computed(() => run.completed.value.filter(Boolean).length);

const status = computed(() => {
  if (run.isComplete.value) return '';
  switch (run.kind.value) {
    case 'action': return t({ en: 'Your turn: try it on the radio.', nl: 'Jouw beurt: probeer het op de radio.' });
    case 'explore': return t({ en: 'Click the glowing part on the radio.', nl: 'Klik op het oplichtende onderdeel van de radio.' });
    case 'quiz': return t({ en: 'Pick an answer.', nl: 'Kies een antwoord.' });
    default: return '';
  }
});

// Keep the current step in view when it changes.
const card = ref<HTMLElement>();
watch(() => run.index.value, () => nextTick(() => card.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })));
</script>

<template>
  <div class="flex flex-col gap-4 p-4 sm:p-5">
    <div>
      <p class="text-xs font-semibold text-muted">
        {{ t({ en: 'Lesson', nl: 'Les' }) }} {{ number }} / {{ total }} · {{ lesson.minutes }} min
      </p>
      <h1 class="mt-1 font-display text-2xl leading-tight text-highlighted sm:text-3xl">{{ t(lesson.title) }}</h1>
      <div class="mt-3 flex items-center gap-1" role="progressbar" :aria-valuemin="0" :aria-valuemax="stepCount" :aria-valuenow="doneCount" :aria-label="t({ en: 'Steps done', nl: 'Afgewerkte stappen' })">
        <button
          v-for="(s, i) in lesson.steps"
          :key="i"
          type="button"
          class="h-1.5 flex-1 rounded-full transition"
          :class="run.completed.value[i] ? 'bg-secondary' : i === run.index.value && !run.finished.value ? 'bg-primary/60' : 'bg-accented'"
          :aria-label="`${t({ en: 'Step', nl: 'Stap' })} ${i + 1}: ${t(s.title)}`"
          @click="run.goTo(i)"
        />
      </div>
    </div>

    <div v-if="run.index.value === 0 && !run.finished.value" class="text-sm text-toned">
      <RichText :text="t(lesson.intro)" />
    </div>

    <!-- Current step -->
    <section
      v-if="!run.finished.value"
      ref="card"
      class="rounded-lg border bg-default p-4 shadow-sm transition"
      :class="run.isComplete.value ? 'border-success/60' : 'border-default'"
      aria-live="polite"
    >
      <p class="flex items-center gap-2 text-xs font-semibold text-muted">
        <span>{{ t({ en: 'Step', nl: 'Stap' }) }} {{ run.index.value + 1 }} / {{ stepCount }}</span>
        <UButton
          v-if="run.isComplete.value"
          color="success"
          variant="subtle"
          size="xs"
          icon="i-lucide-check"
          trailing-icon="i-lucide-rotate-ccw"
          :label="t({ en: 'Done', nl: 'Klaar' })"
          :title="t({ en: 'Do this step again', nl: 'Doe deze stap opnieuw' })"
          :aria-label="t({ en: 'Done. Do this step again', nl: 'Klaar. Doe deze stap opnieuw' })"
          class="done-badge"
          @click="run.resetStep()"
        />
      </p>
      <h2 class="mt-1 text-lg font-semibold text-highlighted">{{ t(run.step.value.title) }}</h2>
      <div class="mt-2 text-[0.95rem] text-toned">
        <RichText :text="t(run.step.value.body)" />
      </div>

      <div v-if="run.step.value.quiz" class="mt-3 flex flex-col gap-2">
        <button
          v-for="(o, i) in run.step.value.quiz.options"
          :key="i"
          type="button"
          class="rounded-md border px-3 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-primary"
          :class="run.quizPick.value === i ? (o.correct ? 'border-success bg-success/10' : 'border-error bg-error/10') : 'border-default hover:border-accented hover:bg-elevated/60'"
          @click="run.answer(i)"
        >
          <span class="font-medium text-highlighted">{{ t(o.text) }}</span>
          <span v-if="run.quizPick.value === i" class="mt-1 block text-muted">{{ t(o.explain) }}</span>
        </button>
      </div>

      <div v-if="run.step.value.tip && !run.isComplete.value" class="mt-3 flex gap-2 rounded-md bg-elevated/70 p-2.5 text-xs leading-relaxed text-muted">
        <UIcon name="i-lucide-info" class="mt-0.5 size-3.5 shrink-0" />
        <RichText :text="t(run.step.value.tip)" />
      </div>

      <p v-if="status" class="mt-3 text-sm font-medium text-primary">{{ status }}</p>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UButton
          v-if="run.step.value.demo && !run.isComplete.value"
          icon="i-lucide-play"
          :label="run.demoing.value ? t({ en: 'Showing…', nl: 'Bezig…' }) : t({ en: 'Show me', nl: 'Toon het' })"
          color="neutral"
          variant="outline"
          size="sm"
          :disabled="run.demoing.value"
          @click="run.showMe()"
        />
        <UButton
          v-if="run.kind.value === 'info' || run.isComplete.value"
          trailing-icon="i-lucide-arrow-right"
          :label="t({ en: 'Next', nl: 'Volgende' })"
          size="sm"
          class="ms-auto"
          @click="run.next()"
        />
        <UButton
          v-else
          :label="t({ en: 'Skip', nl: 'Overslaan' })"
          color="neutral"
          variant="ghost"
          size="sm"
          class="ms-auto"
          @click="run.next()"
        />
      </div>
    </section>

    <!-- Finished -->
    <section v-else class="rounded-lg border border-success/50 bg-default p-4 shadow-sm" aria-live="polite">
      <p class="flex items-center gap-2 text-sm font-semibold text-success"><UIcon name="i-lucide-circle-check" class="size-4" />{{ t({ en: 'Lesson complete', nl: 'Les afgewerkt' }) }}</p>
      <div class="mt-2 text-[0.95rem] text-toned"><RichText :text="t(lesson.outro)" /></div>
      <div class="mt-4 flex flex-wrap gap-2">
        <UButton v-if="next" :to="to(`/lessons/${next.slug}`)" trailing-icon="i-lucide-arrow-right" :label="`${t({ en: 'Next', nl: 'Volgende' })}: ${t(next.title)}`" />
        <UButton v-else :to="to('/play')" icon="i-lucide-gamepad-2" :label="t({ en: 'Free play', nl: 'Vrij spelen' })" />
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="outline" :label="t({ en: 'Again', nl: 'Opnieuw' })" @click="run.start()" />
      </div>
    </section>

    <div class="flex items-center gap-2">
      <UButton icon="i-lucide-chevron-left" :label="t({ en: 'Back', nl: 'Terug' })" color="neutral" variant="ghost" size="sm" :disabled="run.index.value === 0 && !run.finished.value" @click="run.prev()" />
      <UButton icon="i-lucide-rotate-ccw" :label="t({ en: 'Restart lesson', nl: 'Les herstarten' })" color="neutral" variant="ghost" size="sm" @click="run.start()" />
      <UButton :icon="showAll ? 'i-lucide-chevron-up' : 'i-lucide-list-checks'" :label="t({ en: 'All steps', nl: 'Alle stappen' })" color="neutral" variant="ghost" size="sm" class="ms-auto" @click="showAll = !showAll" />
    </div>
    <ol v-if="showAll" class="-mt-2 flex flex-col gap-0.5 text-sm">
      <li v-for="(s, i) in lesson.steps" :key="i">
        <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-elevated/60" :class="i === run.index.value && !run.finished.value ? 'bg-elevated font-semibold text-highlighted' : 'text-muted'" @click="run.goTo(i)">
          <UIcon :name="run.completed.value[i] ? 'i-lucide-circle-check' : 'i-lucide-circle'" class="size-4 shrink-0" :class="run.completed.value[i] ? 'text-success' : 'text-dimmed'" />
          {{ i + 1 }}. {{ t(s.title) }}
        </button>
      </li>
    </ol>

    <details class="text-xs text-muted">
      <summary class="cursor-pointer select-none font-semibold">{{ t({ en: 'Keyboard shortcuts', nl: 'Sneltoetsen' }) }}</summary>
      <p class="mt-2 leading-relaxed">
        {{ t({ en: 'P power · ↑ ↓ volume · ← → dial · F FUNC · S SQL · B BAND · T TS · M MODE · V V/M. Hold a key to hold the button.', nl: 'P aan/uit · ↑ ↓ volume · ← → knop · F FUNC · S SQL · B BAND · T TS · M MODE · V V/M. Houd een toets in om de knop in te houden.' }) }}
      </p>
    </details>
  </div>
</template>

<style scoped>
/* The redo arrow only appears on hover or focus, so the badge reads as "Done" first. */
.done-badge :deep([data-slot='trailingIcon']) { width: 0; opacity: 0; transition: width 120ms, opacity 120ms; }
.done-badge:hover :deep([data-slot='trailingIcon']),
.done-badge:focus-visible :deep([data-slot='trailingIcon']) { width: 0.875rem; opacity: 1; }
</style>
