// Runs one lesson against a radio session: which step is current, whether it's done, quizzes and demos.
import type { Ref } from 'vue';
import type { View } from '~/radio/controls';
import type { Control } from '~/radio/controls';
import type { Session } from '~/radio/session';
import type { State } from '~/radio/sim';
import { runDemo, type DemoRun } from '~/lessons/demo';
import type { Lesson } from '~/lessons/types';

export interface LessonRunHooks {
  /** A step began (also when going back to one); `radio` is the radio's state at that moment. */
  onStep?: (index: number, radio: State) => void;
  onFinish?: () => void;
}

export function useLessonRun(lesson: Ref<Lesson>, session: Session, hooks: LessonRunHooks = {}) {
  const { markDone } = useProgress();
  const index = ref(0);
  const completed = ref<boolean[]>([]);
  const finished = ref(false);
  const quizPick = ref<number | null>(null);
  const demoing = ref(false);
  let memo: Record<string, number> = {};
  let demo: DemoRun | null = null;
  let advanceTimer: ReturnType<typeof setTimeout> | null = null;
  /** True between completing a step and moving on; the glow is hidden only then, not on revisits. */
  const advancing = ref(false);
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
  const highlight = computed<Control[]>(() => (finished.value || advancing.value ? [] : step.value.target ?? []));
  const gesture = computed(() => (finished.value || advancing.value ? null : step.value.gesture ?? null));

  function cancelDemo() { if (demo) demo.cancelled = true; demo = null; demoing.value = false; }
  function clearTimer() { if (advanceTimer) clearTimeout(advanceTimer); advanceTimer = null; advancing.value = false; }

  function enterStep(i: number) {
    clearTimer();
    cancelDemo();
    index.value = i;
    memo = {};
    quizPick.value = null;
    snapshot = structuredClone(toRaw(session.radio.state));
    hooks.onStep?.(i, snapshot);
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

  /**
   * Starts the lesson, or picks it up at `step` with the radio as saved for that step.
   * Steps before `step` count as done; `finished` opens the end of the lesson.
   */
  function start(opts: { step?: number; radio?: Partial<State> | null; finished?: boolean } = {}) {
    clearTimer();
    cancelDemo();
    session.input.releaseAll();
    session.radio.load(opts.radio ?? lesson.value.setup());
    const count = lesson.value.steps.length;
    const step = Math.max(0, Math.min(count - 1, opts.step ?? 0));
    completed.value = lesson.value.steps.map((_, i) => !!opts.finished || i < step);
    finished.value = !!opts.finished;
    enterStep(opts.finished ? count - 1 : step);
  }

  function complete(auto: boolean) {
    if (completed.value[index.value]) return;
    completed.value = completed.value.map((c, i) => (i === index.value ? true : c));
    if (auto) { advancing.value = true; advanceTimer = setTimeout(next, 1200); }
  }

  function next() {
    clearTimer();
    if (!completed.value[index.value]) step.value.skip?.(session.radio);
    if (kind.value === 'info' || kind.value === 'action' || kind.value === 'explore') completed.value = completed.value.map((c, i) => (i === index.value ? true : c));
    if (index.value < lesson.value.steps.length - 1) enterStep(index.value + 1);
    else { finished.value = true; cancelDemo(); markDone(lesson.value.slug); hooks.onFinish?.(); }
  }

  function prev() {
    if (finished.value) { finished.value = false; return; }
    if (index.value > 0) enterStep(index.value - 1);
  }

  function goTo(i: number) { finished.value = false; enterStep(i); }

  function pick(control: Control) {
    // Clicking the right part moves straight on; there is nothing to watch happen on the radio.
    if (kind.value === 'explore' && control === step.value.explore) next();
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

  watch(lesson, () => start());

  return { index, step, kind, completed, isComplete, finished, quizPick, demoing, view, highlight, gesture, start, next, prev, goTo, pick, answer, showMe, resetStep };
}

export type LessonRun = ReturnType<typeof useLessonRun>;
