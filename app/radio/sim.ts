// A behavioural model of the Icom IC-R5, following the instruction manual's key sequences.
// It knows nothing about Vue or three.js: the 3D view and the lessons drive it with keyDown/keyUp/dial
// and read `state`, `lcd()` and `reception()` back.

import { BANDS, STATIONS, bandOf, kHz, stepLabel, stepsFor, type Mode, type Station } from './bands';

export type Key = 'PWR' | 'UP' | 'DOWN' | 'BAND' | 'TS' | 'MODE' | 'VM' | 'FUNC' | 'SQL';
export const KEYS: Key[] = ['PWR', 'UP', 'DOWN', 'BAND', 'TS', 'MODE', 'VM', 'FUNC', 'SQL'];

/** -1 = OPEN, 0 = AUTO, 1–9 = LEVEL 1 (loose) to LEVEL 9 (tight). */
export type Squelch = number;
export const SQL_ORDER: Squelch[] = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const sqlLabel = (s: Squelch) => (s === -1 ? 'OPEN' : s === 0 ? 'AUTO' : `LEVEL ${s}`);

export type Skip = '' | 'SKIP' | 'PSKIP';
export interface Channel { freq: number; mode: Mode; skip: Skip }
export type ScanKind = 'ALL' | 'BAND' | 'MEM';
export type Screen = 'normal' | 'ts' | 'set' | 'write' | 'scanType';

export interface Settings {
  dsel: number;
  prio: 'OFF' | 'ON' | 'BELL';
  beep: boolean;
  light: 'AUTO' | 'ON' | 'OFF';
  psave: boolean;
  expand: boolean;
  antAm: 'EXT' | 'BAR';
  antFm: 'EXT' | 'EAR';
  lockFx: 'NORMAL' | 'NO SQL' | 'NO VOL' | 'ALL';
  moni: 'PUSH' | 'HOLD';
  apo: number;
  pause: number; // seconds, 0 = HOLD
  resume: number; // seconds, -1 = HOLD
  cont: number;
}

export interface State {
  power: boolean;
  vol: number;
  sql: Squelch;
  att: boolean;
  lock: boolean;
  dialVol: boolean;
  band: number;
  freqs: number[];
  modes: Mode[];
  steps: number[];
  memMode: boolean;
  memCh: number;
  mem: (Channel | null)[];
  screen: Screen;
  writeCh: number;
  setItem: number;
  setShownAt: number;
  scanType: ScanKind;
  scan: null | { kind: ScanKind; dir: 1 | -1; pausedAt: number; lostAt: number; last: number };
  monitor: boolean;
  set: Settings;
  held: Record<string, number>;
}

export type RadioEvent =
  | { type: 'press'; key: Key; long: boolean; func: boolean }
  | { type: 'dial'; dir: 1 | -1; func: boolean; sql: boolean }
  | { type: 'power'; on: boolean }
  | { type: 'memWrite'; ch: number }
  | { type: 'scanStart'; kind: ScanKind }
  | { type: 'scanPause'; freq: number }
  | { type: 'scanStop' }
  | { type: 'monitor' }
  | { type: 'reset'; kind: 'partial' | 'all' }
  | { type: 'denied'; key: Key | 'DIAL' };

export interface Lcd {
  on: boolean;
  light: boolean;
  main: string;
  sub: string;
  ch: string;
  mode: Mode | '';
  mem: boolean;
  lock: boolean;
  att: boolean;
  vol: boolean;
  skip: Skip;
  prio: boolean;
  smeter: number;
  battery: number;
}

export interface Reception {
  strength: number;
  station: Station | null;
  open: boolean;
  modeOk: boolean;
  active: boolean;
}

const LONG = 1000;
const MEM_SIZE = 1000;

export const defaultSettings = (): Settings => ({
  dsel: 1_000_000, prio: 'OFF', beep: true, light: 'AUTO', psave: true, expand: false, antAm: 'EXT', antFm: 'EXT',
  lockFx: 'NORMAL', moni: 'PUSH', apo: 0, pause: 10, resume: 2, cont: 3,
});

export const defaultState = (): State => ({
  power: false, vol: 10, sql: 1, att: false, lock: false, dialVol: false,
  band: 5, freqs: BANDS.map((b) => b.start), modes: BANDS.map((b) => b.mode), steps: BANDS.map((b) => b.step),
  memMode: false, memCh: 0, mem: Array.from({ length: MEM_SIZE }, () => null),
  screen: 'normal', writeCh: 0, setItem: 0, setShownAt: 0, scanType: 'ALL', scan: null, monitor: false,
  set: defaultSettings(), held: {},
});

interface SetItem {
  id: string;
  name: string;
  code: string;
  expand?: boolean;
  only?: 'AMBC' | 'FMBC';
  values: (s: Settings) => { list: unknown[]; get: () => unknown; put: (v: any) => void; show: (v: any) => string };
}

/** Set mode items (manual pp. 39–47). The simulator implements the common ones. */
export const SET_ITEMS: SetItem[] = [
  { id: 'dsel', name: 'D SEL', code: 'DS', values: (s) => ({ list: [100_000, 1_000_000, 10_000_000], get: () => s.dsel, put: (v) => { s.dsel = v; }, show: (v) => (v === 100_000 ? '100K' : v === 1_000_000 ? '1M' : '10M') }) },
  { id: 'prio', name: 'PRIO', code: 'PR', values: (s) => ({ list: ['OFF', 'ON', 'BELL'], get: () => s.prio, put: (v) => { s.prio = v; }, show: (v) => v }) },
  { id: 'beep', name: 'BEEP', code: 'bP', values: (s) => ({ list: [true, false], get: () => s.beep, put: (v) => { s.beep = v; }, show: (v) => (v ? 'ON' : 'OFF') }) },
  { id: 'light', name: 'LIGHT', code: 'LG', values: (s) => ({ list: ['AUTO', 'ON', 'OFF'], get: () => s.light, put: (v) => { s.light = v; }, show: (v) => v }) },
  { id: 'psave', name: 'P SAVE', code: 'PS', values: (s) => ({ list: [true, false], get: () => s.psave, put: (v) => { s.psave = v; }, show: (v) => (v ? 'ON' : 'OFF') }) },
  { id: 'ant', name: 'ANT', code: 'An', only: 'AMBC', values: (s) => ({ list: ['EXT', 'BAR'], get: () => s.antAm, put: (v) => { s.antAm = v; }, show: (v) => v }) },
  { id: 'antfm', name: 'ANT', code: 'An', only: 'FMBC', values: (s) => ({ list: ['EXT', 'EAR'], get: () => s.antFm, put: (v) => { s.antFm = v; }, show: (v) => v }) },
  { id: 'expand', name: 'EXPAND', code: 'EX', values: (s) => ({ list: [false, true], get: () => s.expand, put: (v) => { s.expand = v; }, show: (v) => (v ? 'ON' : 'OFF') }) },
  { id: 'lockfx', name: 'LOCK', code: 'LK', expand: true, values: (s) => ({ list: ['NORMAL', 'NO SQL', 'NO VOL', 'ALL'], get: () => s.lockFx, put: (v) => { s.lockFx = v; }, show: (v) => v }) },
  { id: 'moni', name: 'MONI', code: 'Mo', expand: true, values: (s) => ({ list: ['PUSH', 'HOLD'], get: () => s.moni, put: (v) => { s.moni = v; }, show: (v) => v }) },
  { id: 'apo', name: 'AP OFF', code: 'AP', expand: true, values: (s) => ({ list: [0, 30, 60, 90, 120], get: () => s.apo, put: (v) => { s.apo = v; }, show: (v) => (v ? `${v}MIN` : 'OFF') }) },
  { id: 'pause', name: 'PAUSE', code: 'PA', expand: true, values: (s) => ({ list: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 0], get: () => s.pause, put: (v) => { s.pause = v; }, show: (v) => (v ? `${v}SEC` : 'HOLD') }) },
  { id: 'resume', name: 'RESUME', code: 'rE', expand: true, values: (s) => ({ list: [0, 1, 2, 3, 4, 5, -1], get: () => s.resume, put: (v) => { s.resume = v; }, show: (v) => (v < 0 ? 'HOLD' : `${v}SEC`) }) },
  { id: 'cont', name: 'CONT', code: 'Co', expand: true, values: (s) => ({ list: [1, 2, 3, 4], get: () => s.cont, put: (v) => { s.cont = v; }, show: (v) => `${v}` }) },
];

/** Squelch threshold on the 0–1 strength scale. */
const threshold = (s: Squelch) => (s === -1 ? -1 : s === 0 ? 0.12 : 0.04 + s * 0.07);

export function formatFreq(hz: number): { main: string; sub: string } {
  const mhz = Math.floor(hz / 1e6);
  const khz = Math.floor((hz % 1e6) / 1000);
  const rest = Math.round(hz % 1000);
  const sub = rest === 250 ? '25' : rest === 500 ? '50' : rest === 750 ? '75' : '';
  return { main: `${mhz}.${String(khz).padStart(3, '0')}`, sub };
}

export class Radio {
  state: State = defaultState();
  /** Bumped on every change; the Vue side watches it. */
  version = 0;
  private listeners = new Set<(e: RadioEvent | null) => void>();
  private longFired = new Set<Key>();
  private usedWhileHeld = new Set<Key>();
  private sqlFirstClick = false;
  private repeatAt = 0;
  private flash: { text: string; until: number } | null = null;
  private lastActivity = 0;
  private now = 0;
  beeper: ((kind: 'key' | 'error' | 'write' | 'long') => void) | null = null;

  on(fn: (e: RadioEvent | null) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private emit(e: RadioEvent | null) { this.version++; for (const fn of this.listeners) fn(e); }
  private changed() { this.emit(null); }

  // ---------- helpers ----------
  get freq() { const s = this.state; return s.memMode && s.mem[s.memCh] ? s.mem[s.memCh]!.freq : s.freqs[s.band]!; }
  get mode(): Mode { const s = this.state; return s.memMode && s.mem[s.memCh] ? s.mem[s.memCh]!.mode : s.modes[s.band]!; }
  get bandId() { return BANDS[this.state.band]!.id; }
  get step() { return this.state.steps[this.state.band]!; }
  isHeld(k: Key) { return k in this.state.held; }
  private beep(kind: 'key' | 'error' | 'write' | 'long' = 'key') { if (this.state.set.beep) this.beeper?.(kind); }
  private say(text: string, ms = 1500) { this.flash = { text, until: this.now + ms }; }
  private programmed() { return this.state.mem.flatMap((c, i) => (c ? [i] : [])); }

  /** Replaces the whole state (lesson setup). */
  load(patch: Partial<State> & { setPatch?: Partial<Settings> }) {
    const { setPatch, ...rest } = patch;
    this.state = { ...defaultState(), ...rest, held: {} };
    if (setPatch) Object.assign(this.state.set, setPatch);
    this.longFired.clear(); this.usedWhileHeld.clear(); this.flash = null;
    this.changed();
  }

  /** Straight to a frequency from outside the radio (the free-play signal list). */
  jump(hz: number, mode?: Mode) {
    const s = this.state;
    s.power = true;
    s.screen = 'normal';
    s.scan = null;
    this.tune(hz, mode);
    this.lastActivity = performance.now();
    this.changed();
  }

  tune(hz: number, mode?: Mode) {
    const s = this.state;
    s.memMode = false;
    s.band = bandOf(hz);
    s.freqs[s.band] = hz;
    if (mode) s.modes[s.band] = mode;
  }

  // ---------- keys ----------
  keyDown(key: Key, now = performance.now()) {
    this.now = now;
    if (this.isHeld(key)) return;
    this.state.held[key] = now;
    this.longFired.delete(key);
    this.usedWhileHeld.delete(key);
    this.lastActivity = now;
    if (!this.state.power) { this.changed(); return; }
    const func = this.isHeld('FUNC') && key !== 'FUNC';
    if (func) this.usedWhileHeld.add('FUNC');
    if (this.state.lock && !this.allowedWhileLocked(key)) { this.emit({ type: 'denied', key }); return; }
    switch (key) {
      case 'UP': case 'DOWN':
        this.repeatAt = now + 500;
        this.volOrTune(key === 'UP' ? 1 : -1);
        this.emit({ type: 'press', key, long: false, func });
        return;
      case 'SQL':
        if (func) { this.state.att = !this.state.att; this.usedWhileHeld.add('SQL'); this.beep(); this.emit({ type: 'press', key, long: false, func }); return; }
        this.sqlFirstClick = true;
        if (this.state.set.moni === 'HOLD') this.state.monitor = !this.state.monitor;
        else this.state.monitor = true;
        break;
    }
    this.changed();
  }

  keyUp(key: Key, now = performance.now()) {
    this.now = now;
    const s = this.state;
    if (!this.isHeld(key)) return;
    const downAt = s.held[key]!;
    delete s.held[key];
    const used = this.usedWhileHeld.has(key) || this.longFired.has(key);
    const func = this.isHeld('FUNC');
    if (!s.power) { this.changed(); return; }
    if (key === 'SQL') {
      if (s.set.moni === 'PUSH') s.monitor = false;
      if (!used && now - downAt >= 400 && s.screen === 'normal') this.emit({ type: 'monitor' });
      if (!used) this.emit({ type: 'press', key, long: false, func });
      this.changed();
      return;
    }
    if (used || key === 'FUNC' || key === 'PWR' || key === 'UP' || key === 'DOWN') {
      // MODE held while turning the dial starts the chosen scan on release (manual p. 26, note).
      if (key === 'MODE' && this.usedWhileHeld.has('MODE') && s.screen === 'scanType') this.startScan();
      this.changed();
      return;
    }
    if (s.lock && !this.allowedWhileLocked(key)) return;
    if (func) this.usedWhileHeld.add('FUNC');
    this.shortPress(key, func);
  }

  private allowedWhileLocked(key: Key) {
    const fx = this.state.set.lockFx;
    if (key === 'PWR' || key === 'FUNC') return true;
    if (key === 'BAND') return this.isHeld('FUNC');
    if (key === 'UP' || key === 'DOWN') return fx === 'NORMAL' || fx === 'NO SQL';
    if (key === 'SQL') return fx === 'NORMAL' || fx === 'NO VOL';
    return false;
  }

  private shortPress(key: Key, func: boolean) {
    const s = this.state;
    const press = () => this.emit({ type: 'press', key, long: false, func });
    switch (key) {
      case 'BAND':
        if (func) break;
        if (s.screen !== 'normal' || s.scan) { this.beep('error'); break; }
        if (s.memMode) { this.beep('error'); break; }
        s.band = (s.band + 1) % BANDS.length;
        this.beep();
        break;
      case 'TS':
        if (func) { s.dialVol = !s.dialVol; this.beep(); break; }
        if (s.screen === 'set') { s.screen = 'normal'; this.beep(); break; }
        if (s.screen === 'ts') { s.screen = 'normal'; this.beep(); break; }
        if (s.screen !== 'normal' || s.scan || s.memMode) { this.beep('error'); break; }
        s.screen = 'ts';
        this.beep();
        break;
      case 'MODE':
        if (s.scan) { this.stopScan(); break; }
        if (s.screen === 'scanType') { this.startScan(); break; }
        if (s.screen !== 'normal') { this.beep('error'); break; }
        if (func) { this.beep('error'); break; }
        {
          const order: Mode[] = ['FM', 'WFM', 'AM'];
          const next = order[(order.indexOf(this.mode) + 1) % order.length]!;
          if (s.memMode && s.mem[s.memCh]) s.mem[s.memCh]!.mode = next;
          else s.modes[s.band] = next;
        }
        this.beep();
        break;
      case 'VM':
        if (func) {
          // Skip setting cycles in memory mode (manual p. 30).
          if (s.memMode && s.mem[s.memCh]) {
            const c = s.mem[s.memCh]!;
            c.skip = c.skip === '' ? 'SKIP' : c.skip === 'SKIP' ? 'PSKIP' : '';
            this.beep();
          } else this.beep('error');
          break;
        }
        if (s.screen === 'write') { s.screen = 'normal'; this.beep(); break; }
        if (s.scan) { this.beep('error'); break; }
        if (s.screen !== 'normal') { this.beep('error'); break; }
        if (!s.memMode) {
          const list = this.programmed();
          if (!list.length) { this.beep('error'); break; }
          if (!s.mem[s.memCh]) s.memCh = list[0]!;
          s.memMode = true;
        } else s.memMode = false;
        this.beep();
        break;
    }
    press();
  }

  private longPress(key: Key) {
    const s = this.state;
    const func = this.isHeld('FUNC');
    this.longFired.add(key);
    if (key === 'PWR') {
      if (!s.power) {
        s.power = true;
        // Resets happen at power-on with keys held (manual p. 53).
        if (this.isHeld('FUNC') && this.isHeld('VM')) { this.allReset(); this.emit({ type: 'reset', kind: 'all' }); }
        else if (this.isHeld('FUNC') && this.isHeld('TS')) { this.partialReset(); this.emit({ type: 'reset', kind: 'partial' }); }
        for (const k of ['FUNC', 'VM', 'TS'] as Key[]) if (this.isHeld(k)) this.longFired.add(k);
        this.lastActivity = this.now;
      } else {
        s.power = false;
        s.scan = null;
        s.screen = 'normal';
        s.monitor = false;
      }
      this.emit({ type: 'power', on: s.power });
      this.emit({ type: 'press', key, long: true, func });
      return;
    }
    if (!s.power) return;
    if (s.lock && !this.allowedWhileLocked(key)) return;
    switch (key) {
      case 'BAND':
        if (!func) return;
        s.lock = !s.lock;
        this.usedWhileHeld.add('FUNC');
        this.beep('long');
        break;
      case 'TS':
        if (func) return;
        if (s.scan) return;
        s.screen = s.screen === 'set' ? 'normal' : 'set';
        s.setItem = this.visibleSetItems().findIndex((i) => i.id === 'dsel');
        s.setShownAt = this.now;
        this.beep('long');
        break;
      case 'MODE':
        if (func || s.scan || s.screen !== 'normal') return;
        if (s.memMode) {
          if (this.programmed().filter((i) => s.mem[i]!.skip === '').length < 2) { this.beep('error'); return; }
          s.scanType = 'MEM';
          this.startScan();
        } else {
          s.screen = 'scanType';
          if (s.scanType === 'MEM') s.scanType = 'BAND';
          this.beep('long');
        }
        break;
      case 'VM':
        if (func) return;
        if (s.screen === 'write') { this.writeMemory(); return; }
        if (s.screen !== 'normal' || s.scan) return;
        s.screen = 'write';
        s.writeCh = s.memCh;
        this.beep('long');
        break;
      default:
        return;
    }
    this.emit({ type: 'press', key, long: true, func });
  }

  private writeMemory() {
    const s = this.state;
    const ch = s.writeCh;
    s.mem[ch] = { freq: this.freq, mode: this.mode, skip: '' };
    s.memCh = ch;
    s.screen = 'normal';
    s.memMode = false;
    this.beep('write');
    this.emit({ type: 'memWrite', ch });
    this.emit({ type: 'press', key: 'VM', long: true, func: false });
  }

  private partialReset() {
    const { mem, held } = this.state;
    this.state = { ...defaultState(), power: true, mem, held };
  }

  private allReset() {
    this.state = { ...defaultState(), power: true, held: this.state.held };
  }

  // ---------- dial ----------
  dial(dir: 1 | -1, now = performance.now()) {
    this.now = now;
    const s = this.state;
    this.lastActivity = now;
    if (!s.power) return;
    const func = this.isHeld('FUNC');
    const sql = this.isHeld('SQL');
    if (func) this.usedWhileHeld.add('FUNC');
    if (s.lock && !(sql && this.allowedWhileLocked('SQL'))) { this.emit({ type: 'denied', key: 'DIAL' }); return; }
    if (s.dialVol && !sql && s.screen === 'normal' && !s.scan) {
      this.setVol(s.vol + dir);
    } else this.dialAction(dir, func, sql);
    this.emit({ type: 'dial', dir, func, sql });
  }

  /** [DIAL] work; when [DIAL] and [▲]/[▼] are traded, the arrow keys call this. */
  private dialAction(dir: 1 | -1, func: boolean, sql: boolean) {
    const s = this.state;
    if (sql) {
      this.usedWhileHeld.add('SQL');
      if (this.sqlFirstClick) this.sqlFirstClick = false;
      else {
        const i = SQL_ORDER.indexOf(s.sql);
        s.sql = SQL_ORDER[Math.max(0, Math.min(SQL_ORDER.length - 1, i + dir))]!;
      }
      this.say(sqlLabel(s.sql), 1200);
      return;
    }
    if (this.isHeld('BAND') && !s.memMode && s.screen === 'normal' && !s.scan) {
      this.usedWhileHeld.add('BAND');
      s.band = (s.band + dir + BANDS.length) % BANDS.length;
      return;
    }
    if (this.isHeld('MODE') && !s.memMode && !s.scan && (s.screen === 'normal' || s.screen === 'scanType')) {
      this.usedWhileHeld.add('MODE');
      s.screen = 'scanType';
      s.scanType = s.scanType === 'ALL' ? 'BAND' : 'ALL';
      return;
    }
    if (s.scan) {
      s.scan.dir = dir;
      s.scan.pausedAt = 0;
      s.scan.lostAt = 0;
      this.scanStep();
      return;
    }
    switch (s.screen) {
      case 'ts': {
        const list = stepsFor(this.bandId);
        const i = list.indexOf(this.step);
        s.steps[s.band] = list[Math.max(0, Math.min(list.length - 1, (i < 0 ? 0 : i) + dir))]!;
        return;
      }
      case 'set': {
        const items = this.visibleSetItems();
        if (func) {
          const v = items[s.setItem]!.values(s.set);
          const i = v.list.indexOf(v.get());
          v.put(v.list[Math.max(0, Math.min(v.list.length - 1, i + dir))]);
          s.setShownAt = 0;
        } else {
          s.setItem = Math.max(0, Math.min(items.length - 1, s.setItem + dir));
          s.setShownAt = this.now;
        }
        return;
      }
      case 'write':
        s.writeCh = (s.writeCh + dir * (func ? 10 : 1) + MEM_SIZE) % MEM_SIZE;
        return;
      case 'scanType':
        s.scanType = s.scanType === 'ALL' ? 'BAND' : 'ALL';
        return;
    }
    if (s.memMode) {
      const list = this.programmed();
      if (!list.length) return;
      if (func) {
        // 10-channel jumps land on the next programmed channel at or past the target.
        const target = (s.memCh + dir * 10 + MEM_SIZE) % MEM_SIZE;
        const sorted = dir > 0 ? list : [...list].reverse();
        s.memCh = sorted.find((c) => (dir > 0 ? c >= target : c <= target)) ?? sorted[0]!;
      } else {
        const i = list.indexOf(s.memCh);
        s.memCh = list[(i + dir + list.length) % list.length]!;
      }
      return;
    }
    const band = BANDS[s.band]!;
    if (func) {
      const f = s.freqs[s.band]! + dir * s.set.dsel;
      s.freqs[s.band] = Math.max(band.lo, Math.min(band.hi, f));
      return;
    }
    s.freqs[s.band] = this.stepFrom(s.freqs[s.band]!, dir, this.step, band.lo, band.hi);
  }

  private stepFrom(f: number, dir: 1 | -1, step: number, lo: number, hi: number) {
    // Snap onto the step grid, then move one step (the radio tunes on the grid of the selected step).
    const n = f / step;
    const snapped = dir > 0 ? Math.floor(n + 1e-6) + 1 : Math.ceil(n - 1e-6) - 1;
    let next = Math.round(snapped * step);
    if (next > hi) next = lo;
    if (next < lo) next = hi - ((hi - lo) % Math.round(step));
    return next;
  }

  private setVol(v: number) {
    this.state.vol = Math.max(0, Math.min(31, v));
    this.say(`VOL ${String(this.state.vol).padStart(2, ' ')}`, 1200);
    this.beep();
  }

  private volOrTune(dir: 1 | -1) {
    const s = this.state;
    if (s.dialVol) { this.dialAction(dir, this.isHeld('FUNC'), this.isHeld('SQL')); this.changed(); return; }
    this.setVol(s.vol + dir);
  }

  visibleSetItems() {
    const s = this.state;
    const band = this.bandId;
    return SET_ITEMS.filter((i) => (!i.expand || s.set.expand) && (!i.only || (i.only === band && !s.memMode)));
  }

  // ---------- scan ----------
  private startScan() {
    const s = this.state;
    s.screen = 'normal';
    s.scan = { kind: s.memMode ? 'MEM' : s.scanType, dir: 1, pausedAt: 0, lostAt: 0, last: this.now };
    this.beep();
    this.emit({ type: 'scanStart', kind: s.scan.kind });
  }

  private stopScan() {
    this.state.scan = null;
    this.beep();
    this.emit({ type: 'scanStop' });
  }

  private scanStep() {
    const s = this.state;
    const scan = s.scan!;
    if (scan.kind === 'MEM') {
      const list = this.programmed().filter((i) => s.mem[i]!.skip === '');
      if (list.length < 2) { this.stopScan(); return; }
      const i = list.indexOf(s.memCh);
      s.memCh = list[(i < 0 ? 0 : i + scan.dir + list.length) % list.length]!;
      return;
    }
    const band = BANDS[s.band]!;
    let f = this.stepFrom(s.freqs[s.band]!, scan.dir, this.step, band.lo, band.hi);
    if (scan.kind === 'ALL' && (f === band.lo || f === band.hi) && f !== s.freqs[s.band]) {
      // Full scan runs on into the next band.
      const next = (s.band + scan.dir + BANDS.length) % BANDS.length;
      s.band = next;
      f = scan.dir > 0 ? BANDS[next]!.lo : BANDS[next]!.hi;
    }
    // Skip frequencies marked P SKIP in memory.
    if (s.mem.some((c) => c?.skip === 'PSKIP' && c.freq === f)) f = this.stepFrom(f, scan.dir, this.step, band.lo, band.hi);
    s.freqs[s.band] = f;
  }

  // ---------- time ----------
  tick(now = performance.now()) {
    this.now = now;
    const s = this.state;
    let dirty = false;
    for (const key of Object.keys(s.held) as Key[]) {
      if (!this.longFired.has(key) && now - s.held[key]! >= LONG && key !== 'FUNC' && key !== 'SQL' && key !== 'UP' && key !== 'DOWN') {
        if (this.usedWhileHeld.has(key)) continue;
        this.longPress(key);
        dirty = true;
      }
    }
    if (s.power && (this.isHeld('UP') || this.isHeld('DOWN')) && now >= this.repeatAt) {
      this.repeatAt = now + 120;
      this.volOrTune(this.isHeld('UP') ? 1 : -1);
      dirty = true;
    }
    if (s.power && s.scan) {
      const scan = s.scan;
      const r = this.reception(now);
      // With the squelch open the scan stops everywhere, which is why you set it first (manual p. 26).
      const hit = s.sql === -1 || s.monitor || (r.active && r.strength > threshold(s.sql));
      if (scan.pausedAt) {
        // Paused on a signal: resume after the pause timer, or after the resume timer once it disappears.
        if (!hit && !scan.lostAt) scan.lostAt = now;
        if (hit) scan.lostAt = 0;
        const pauseDone = s.set.pause > 0 && now - scan.pausedAt > s.set.pause * 1000;
        const lostDone = scan.lostAt && s.set.resume >= 0 && now - scan.lostAt > s.set.resume * 1000;
        if (pauseDone || lostDone) { scan.pausedAt = 0; scan.lostAt = 0; this.scanStep(); scan.last = now; dirty = true; }
      } else if (hit) {
        scan.pausedAt = now;
        this.emit({ type: 'scanPause', freq: this.freq });
      } else if (now - scan.last >= (scan.kind === 'MEM' ? 160 : 28)) {
        scan.last = now;
        this.scanStep();
        dirty = true;
      }
    }
    if (dirty) this.changed();
  }

  // ---------- what the receiver hears ----------
  reception(now = this.now): Reception {
    const s = this.state;
    if (!s.power) return { strength: 0, station: null, open: false, modeOk: true, active: false };
    const f = this.freq;
    let best: Station | null = null;
    let strength = 0;
    for (const st of STATIONS) {
      const d = Math.abs(f - st.f);
      if (d > st.flat + st.fade) continue;
      const shape = d <= st.flat ? 1 : 1 - (d - st.flat) / st.fade;
      let v = st.strength * shape * shape;
      if (st.mode === 'AM' && this.bandId === 'AMBC' && s.set.antAm === 'BAR') v = Math.min(1, v * 1.6);
      if (s.att) v *= 0.35;
      if (v > strength) { strength = v; best = st; }
    }
    const active = !!best && (!best.period || (now % best.period) < best.on!);
    if (!active) strength = 0;
    const open = s.monitor || s.sql === -1 || strength > threshold(s.sql);
    return { strength, station: active ? best : null, open, modeOk: !best || best.mode === this.mode, active };
  }

  // ---------- display ----------
  lcd(now = this.now): Lcd {
    const s = this.state;
    const blank: Lcd = { on: false, light: false, main: '', sub: '', ch: '', mode: '', mem: false, lock: false, att: false, vol: false, skip: '', prio: false, smeter: 0, battery: 0 };
    if (!s.power) return blank;
    const blink = Math.floor(now / 400) % 2 === 0;
    const light = s.set.light === 'ON' || (s.set.light === 'AUTO' && now - this.lastActivity < 5000);
    const out: Lcd = { ...blank, on: true, light, mode: this.mode, lock: s.lock, att: s.att, vol: s.dialVol, prio: s.set.prio !== 'OFF', battery: 2 };
    const f = formatFreq(this.freq);
    out.main = f.main;
    out.sub = f.sub;
    if (s.memMode) {
      const c = s.mem[s.memCh];
      out.mem = true;
      out.ch = String(s.memCh).padStart(3, '0');
      out.skip = c?.skip ?? '';
    }
    const r = this.reception(now);
    out.smeter = r.station ? Math.max(1, Math.round(r.strength * 7)) : 0;
    if (s.monitor && !r.station) out.smeter = blink ? 1 : 0;
    switch (s.screen) {
      case 'ts':
        out.main = stepLabel(this.step);
        out.sub = '';
        out.ch = 'TS';
        out.mem = false;
        break;
      case 'write':
        out.mem = blink;
        out.ch = blink ? String(s.writeCh).padStart(3, '0') : '';
        out.skip = '';
        break;
      case 'scanType':
        out.main = s.scanType === 'ALL' ? 'ALL' : 'BAND';
        out.sub = '';
        out.ch = '';
        break;
      case 'set': {
        const item = this.visibleSetItems()[s.setItem];
        if (item) {
          const v = item.values(s.set);
          out.main = now - s.setShownAt < 1000 ? item.name : v.show(v.get());
          out.ch = now - s.setShownAt < 1000 ? '' : item.code;
          out.sub = '';
          out.mem = false;
          out.mode = '';
          out.smeter = 0;
        }
        break;
      }
    }
    if (s.scan && !s.scan.pausedAt && !blink) out.main = out.main.replace('.', ' ');
    if (this.flash && now < this.flash.until) { out.main = this.flash.text; out.sub = ''; }
    return out;
  }

  /** A readable one-line summary for the lesson panel and screen readers. */
  describe(lang: 'en' | 'nl') {
    const s = this.state;
    if (!s.power) return lang === 'nl' ? 'Uit' : 'Off';
    const f = this.freq / 1e6;
    const mhz = f.toFixed(5).replace(/0+$/, '').replace(/\.$/, '.0');
    const parts = [`${mhz} MHz`, this.mode === 'WFM' ? 'WFM' : this.mode];
    parts.push(s.memMode ? `${lang === 'nl' ? 'geheugen' : 'memory'} ${String(s.memCh).padStart(3, '0')}` : 'VFO');
    parts.push(`${lang === 'nl' ? 'volume' : 'volume'} ${s.vol}`);
    parts.push(`squelch ${sqlLabel(s.sql)}`);
    if (s.scan) parts.push(lang === 'nl' ? 'scant' : 'scanning');
    if (s.lock) parts.push(lang === 'nl' ? 'vergrendeld' : 'locked');
    return parts.join(' · ');
  }
}

export const freqEq = (a: number, b: number) => Math.abs(a - b) < 1;
export { kHz };
