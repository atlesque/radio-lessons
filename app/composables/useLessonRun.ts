// Runs one lesson against a radio session: which step is current, whether it's done, quizzes and demos.
import type { Ref } from 'vue';
import type { View } from '~/radio/controls';
import type { Control } from '~/radio/controls';
import type { Session } from '~/radio/session';
import { runDemo, type DemoRun } from '~/lessons/demo';
import type { Lesson } from '~/lessons/types';

export function useLessonRun(lesson: Ref<Lesson>, session: Session) {
  const { markDone } = useProgress();
  const index = ref(0);
  const completed = ref<boolean[]>([]);
  const finished = ref(false);
  const quizPick = ref<number | null>(null);
  const demoing = ref(false);
  let memo: Record<string, number> = {};
  let demo: DemoRun | null = null;
  let advanceTimer: ReturnType<typeof setTimeout> | null = null;
  /** The radio as it was when the current step began, for redoing the step. */
  let snapshot: ReturnType<typeof structuredClone<Session['radio']['state']>> | null = null;

  const step = computed(() => lesson.value.steps[index.value]!);
  const kind = computed(() => (step.value.check ? 'action' : step.value.explore ? 'explore' : step.value.quiz ? 'quiz' : 'info'));
  const isComplete = computed(() => !!completed.value[index.value]);
  const view = computed<View>(() => {
    if (finished.value) return 'angle';
    for (let i = index.value; i >= 0; i--) { const v = lesson.value.steps[i]?.view; if (v) return v; }
    return 'front';
  });
  const highlight = computed<Control[]>(() => (finished.value || isComplete.value ? [] : step.value.target ?? []));
  const gesture = computed(() => (finished.value || isComplete.value ? null : step.value.gesture ?? null));

  function cancelDemo() { if (demo) demo.cancelled = true; demo = null; demoing.value = false; }
  function clearTimer() { if (advanceTimer) clearTimeout(advanceTimer); advanceTimer = null; }

  function enterStep(i: number) {
    clearTimer();
    cancelDemo();
    index.value = i;
    memo = {};
    quizPick.value = null;
    snapshot = structuredClone(toRaw(session.radio.state));
  }

  /** Un-marks the current step and puts the radio back as it was when the step began. */
  function resetStep() {
    clearTimer();
    cancelDemo();
    session.input.releaseAll();
    if (snapshot) session.radio.load(structuredClone(snapshot));
    completed.value = completed.value.map((c, i) => (i === index.value ? false : c));
    memo = {};
    quizPick.value = null;
  }

  function start() {
    clearTimer();
    cancelDemo();
    session.input.releaseAll();
    session.radio.load(lesson.value.setup());
    completed.value = lesson.value.steps.map(() => false);
    finished.value = false;
    enterStep(0);
  }

  function complete(auto: boolean) {
    if (completed.value[index.value]) return;
    completed.value = completed.value.map((c, i) => (i === index.value ? true : c));
    if (auto) advanceTimer = setTimeout(next, 1200);
  }

  function next() {
    clearTimer();
    if (kind.value === 'info' || kind.value === 'action' || kind.value === 'explore') completed.value = completed.value.map((c, i) => (i === index.value ? true : c));
    if (index.value < lesson.value.steps.length - 1) enterStep(index.value + 1);
    else { finished.value = true; cancelDemo(); markDone(lesson.value.slug); }
  }

  function prev() {
    if (finished.value) { finished.value = false; return; }
    if (index.value > 0) enterStep(index.value - 1);
  }

  function goTo(i: number) { finished.value = false; enterStep(i); }

  function pick(control: Control) {
    if (kind.value === 'explore' && control === step.value.explore) complete(true);
  }

  function answer(i: number) {
    quizPick.value = i;
    if (step.value.quiz?.options[i]?.correct) complete(false);
  }

  async function showMe() {
    if (!step.value.demo || demoing.value) return;
    cancelDemo();
    session.input.releaseAll();
    demo = { cancelled: false };
    demoing.value = true;
    const run = demo;
    await runDemo(step.value.demo, session.radio, run);
    if (demo === run) { demoing.value = false; demo = null; }
  }

  const evaluate = (e: Parameters<NonNullable<Lesson['steps'][number]['check']>>[1]) => {
    if (finished.value || completed.value[index.value]) return;
    const s = step.value;
    if (s.check && s.check(session.radio, e, memo)) complete(true);
  };
  const off = session.radio.on(evaluate);
  // Some checks depend on time (an intermittent signal coming on), not only on changes.
  const poll = import.meta.client ? setInterval(() => evaluate(null), 400) : null;
  onScopeDispose(() => { off(); clearTimer(); cancelDemo(); if (poll) clearInterval(poll); });

  watch(lesson, start);

  return { index, step, kind, completed, isComplete, finished, quizPick, demoing, view, highlight, gesture, start, next, prev, goTo, pick, answer, showMe, resetStep };
}

export type LessonRun = ReturnType<typeof useLessonRun>;
