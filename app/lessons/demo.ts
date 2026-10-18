// Plays a step's "Show me" actions on the radio, key by key, so the model animates them.

import { BANDS, bandOf } from '~/radio/bands';
import { SQL_ORDER, type Key, type Radio } from '~/radio/sim';
import { wait } from '~/radio/input';
import type { Demo } from './types';

export interface DemoRun { cancelled: boolean }

export async function runDemo(actions: Demo[], radio: Radio, run: DemoRun) {
  const sleep = async (ms: number) => { await wait(ms); return !run.cancelled; };
  const press = async (key: Key, ms = 170) => { radio.keyDown(key); await wait(ms); radio.keyUp(key); return sleep(240); };
  const turn = async (dir: 1 | -1, ms = 150) => { radio.dial(dir); return sleep(ms); };

  for (const a of actions) {
    if (run.cancelled) return;
    if ('press' in a) await press(a.press, a.ms);
    else if ('hold' in a) { radio.keyDown(a.hold); await wait(a.ms ?? 1200); radio.keyUp(a.hold); await sleep(300); }
    else if ('down' in a) { radio.keyDown(a.down); await sleep(150); }
    else if ('up' in a) { radio.keyUp(a.up); await sleep(150); }
    else if ('wait' in a) await sleep(a.wait);
    else if ('act' in a) {
      if (a.act === 'cover') radio.toggleCover();
      else if (a.act === 'cells') radio.toggleCells();
      else radio.attachAntenna();
      await sleep(900);
    }
    else if ('dial' in a) { for (let i = 0; i < Math.abs(a.dial); i++) if (!(await turn(a.dial > 0 ? 1 : -1, 180))) return; }
    else if ('band' in a) { for (let i = 0; i < BANDS.length && radio.bandId !== a.band; i++) if (!(await press('BAND'))) return; }
    else if ('mode' in a) { for (let i = 0; i < 3 && radio.mode !== a.mode; i++) if (!(await press('MODE'))) return; }
    else if ('tune' in a) { if (!(await tune(radio, a.tune, press, turn))) return; }
    else if ('step' in a) {
      if (!(await press('TS'))) return;
      for (let i = 0; i < 14 && radio.step !== a.step; i++) if (!(await turn(radio.step < a.step ? 1 : -1, 260))) return;
      await sleep(300);
      if (!(await press('TS'))) return;
    } else if ('sql' in a) {
      radio.keyDown('SQL');
      await sleep(250);
      await turn(1, 350); // the first click only shows the level
      for (let i = 0; i < 12 && radio.state.sql !== a.sql; i++) {
        const dir = SQL_ORDER.indexOf(radio.state.sql) < SQL_ORDER.indexOf(a.sql) ? 1 : -1;
        if (!(await turn(dir, 300))) break;
      }
      await sleep(400);
      radio.keyUp('SQL');
    } else if ('scanType' in a) {
      for (let i = 0; i < 2 && radio.state.scanType !== a.scanType; i++) if (!(await turn(1, 400))) return;
    } else if ('writeCh' in a) {
      for (let i = 0; i < 60 && radio.state.writeCh !== a.writeCh; i++) {
        const dir = radio.state.writeCh < a.writeCh ? 1 : -1;
        if (!(await turn(dir, 220))) return;
      }
    } else if ('set' in a) {
      const items = () => radio.visibleSetItems();
      const target = items().findIndex((i) => i.id === a.set);
      for (let i = 0; i < 20 && radio.state.setItem !== target; i++) if (!(await turn(radio.state.setItem < target ? 1 : -1, 400))) return;
      if (a.value === undefined) { await sleep(900); continue; }
      await sleep(1100);
      radio.keyDown('FUNC');
      await sleep(250);
      for (let i = 0; i < 8; i++) {
        const v = items()[radio.state.setItem]!.values(radio.state.set);
        if (v.get() === a.value) break;
        const dir = v.list.indexOf(a.value) > v.list.indexOf(v.get()) ? 1 : -1;
        if (!(await turn(dir, 350))) break;
      }
      await sleep(250);
      radio.keyUp('FUNC');
      await sleep(300);
    }
  }
}

/** Band, then 1 MHz jumps with [FUNC], then single steps. */
async function tune(radio: Radio, hz: number, press: (k: Key) => Promise<boolean>, turn: (d: 1 | -1, ms?: number) => Promise<boolean>) {
  if (radio.state.memMode && !(await press('VM'))) return false;
  const band = bandOf(hz);
  for (let i = 0; i < BANDS.length && radio.state.band !== band; i++) if (!(await press('BAND'))) return false;
  if (Math.abs(hz - radio.freq) >= radio.state.set.dsel) {
    radio.keyDown('FUNC');
    await wait(200);
    for (let i = 0; i < 400 && Math.abs(hz - radio.freq) >= radio.state.set.dsel; i++) {
      if (!(await turn(hz > radio.freq ? 1 : -1, 140))) { radio.keyUp('FUNC'); return false; }
    }
    radio.keyUp('FUNC');
    await wait(250);
  }
  let lastDir = 0;
  for (let i = 0; i < 400 && Math.abs(hz - radio.freq) > 1; i++) {
    const dir = hz > radio.freq ? 1 : -1;
    if (lastDir && dir !== lastDir) break; // the target isn't on this step grid
    lastDir = dir;
    if (!(await turn(dir, Math.abs(hz - radio.freq) / radio.step > 12 ? 70 : 170))) return false;
  }
  return true;
}
