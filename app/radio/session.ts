// A radio, its input path and its audio, shared by the viewer, the key pad and the lesson panel.

import { shallowRef, triggerRef, type ShallowRef } from 'vue';
import { RadioAudio } from './audio';
import { createInput, type RadioInput } from './input';
import { Radio, type RadioEvent } from './sim';

export interface Session {
  radio: Radio;
  input: RadioInput;
  audio: RadioAudio;
  /** Re-triggers on every radio change, for computed values in templates. */
  tick: ShallowRef<number>;
  events: ShallowRef<RadioEvent | null>;
  dispose: () => void;
}

export function createSession(): Session {
  const radio = new Radio();
  const audio = new RadioAudio();
  radio.beeper = (kind) => audio.beep(kind);
  const tick = shallowRef(0);
  const events = shallowRef<RadioEvent | null>(null);
  radio.on((e) => {
    tick.value = radio.version;
    if (e) { events.value = e; triggerRef(events); }
  });
  // The radio's own clock (long presses, scanning, key repeat) runs apart from rendering,
  // so it keeps time when animation frames are paused.
  const clock = import.meta.client ? setInterval(() => { radio.tick(); audio.update(radio); }, 25) : null;
  return { radio, input: createInput(radio), audio, tick, events, dispose: () => { if (clock) clearInterval(clock); audio.disable(); } };
}
