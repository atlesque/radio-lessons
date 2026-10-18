import type { L, Mode } from '~/radio/bands';
import type { Control, View } from '~/radio/controls';
import type { Key, Radio, RadioEvent, Settings, State } from '~/radio/sim';

export type Gesture = 'press' | 'hold' | 'rotate' | 'click';

/** "Show me" actions. The tuning ones read the radio as they go, so they work from any starting point. */
export type Demo =
  | { press: Key; ms?: number }
  | { hold: Key; ms?: number }
  | { down: Key }
  | { up: Key }
  | { dial: number }
  | { wait: number }
  | { tune: number }
  | { band: string }
  | { mode: Mode }
  | { step: number }
  | { sql: number }
  | { scanType: 'ALL' | 'BAND' }
  | { act: 'cover' | 'cells' | 'antenna' }
  | { writeCh: number }
  | { set: string; value: unknown };

export interface Quiz {
  options: { text: L; correct?: boolean; explain: L }[];
}

export interface Step {
  title: L;
  body: L;
  tip?: L;
  target?: Control[];
  gesture?: Gesture;
  view?: View;
  /** Done when this returns true; checked after every radio change and event. `memo` is per step. */
  check?: (r: Radio, e: RadioEvent | null, memo: Record<string, number>) => boolean;
  /** Done when this part is clicked on the model. */
  explore?: Control;
  quiz?: Quiz;
  demo?: Demo[];
  /** Applied when the step is skipped, so later steps still work (cells in, antenna on). */
  skip?: (r: Radio) => void;
}

export type Setup = Partial<State> & { setPatch?: Partial<Settings> };

export interface Lesson {
  slug: string;
  title: L;
  summary: L;
  minutes: number;
  icon: string;
  intro: L;
  setup: () => Setup;
  steps: Step[];
  outro: L;
}
