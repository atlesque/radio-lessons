// One input path for the 3D model, the on-screen key pad, the keyboard and "Show me" demos.
// A mouse can only hold one thing at a time, so a quick click on [FUNC] or [SQL] latches it
// (it stays held until clicked again or until the next key press); a long press holds it normally.

import { ref } from 'vue';
import type { Key, Radio } from './sim';

const MODIFIERS: Key[] = ['FUNC', 'SQL'];
const TAP = 350;

export type RadioInput = ReturnType<typeof createInput>;

export function createInput(radio: Radio) {
  const latched = ref<Key[]>([]);
  const active = new Map<string, { key: Key; at: number; release: boolean }>();
  const enabled = ref(true);

  const isLatched = (k: Key) => latched.value.includes(k);
  const unlatch = (k: Key) => {
    if (!isLatched(k)) return;
    latched.value = latched.value.filter((x) => x !== k);
    radio.keyUp(k);
  };
  const releaseAll = () => { for (const k of [...latched.value]) unlatch(k); };

  /** While the radio is off, keys for power-on combinations ([FUNC] + [TS] or [V/M]) latch too. */
  const latchable = (k: Key) => MODIFIERS.includes(k) || (!radio.state.power && (k === 'TS' || k === 'VM'));

  function down(key: Key, src = 'pointer') {
    if (!enabled.value) return;
    if (isLatched(key)) { unlatch(key); active.set(src, { key, at: performance.now(), release: true }); return; }
    radio.keyDown(key);
    active.set(src, { key, at: performance.now(), release: false });
  }

  function up(src = 'pointer') {
    const a = active.get(src);
    active.delete(src);
    if (!a || a.release) return;
    const otherModifierHeld = latched.value.some((k) => MODIFIERS.includes(k) && k !== a.key);
    if (latchable(a.key) && performance.now() - a.at < TAP && !(MODIFIERS.includes(a.key) && otherModifierHeld)) {
      latched.value = [...latched.value, a.key];
      return;
    }
    radio.keyUp(a.key);
    if (!latchable(a.key) || otherModifierHeld) releaseAll();
  }

  /** Press for `ms` (a tap by default), then release. Used by keyboard taps and demos. */
  async function press(key: Key, ms = 120) {
    radio.keyDown(key);
    await wait(ms);
    radio.keyUp(key);
  }

  function dial(dir: 1 | -1) {
    if (!enabled.value) return;
    radio.dial(dir);
  }

  return { latched, enabled, down, up, press, dial, releaseAll, unlatch, isLatched };
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
