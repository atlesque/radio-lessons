import { BANDS, MHz, bandOf, type Mode } from '~/radio/bands';
import { freqEq, type Channel, type Radio } from '~/radio/sim';
import type { Setup } from './types';

/** A powered-on radio in VFO mode on `hz`. */
export function tuned(hz: number, mode?: Mode, extra: Setup = {}): Setup {
  const band = bandOf(hz);
  const freqs = BANDS.map((b) => b.start);
  freqs[band] = hz;
  const modes = BANDS.map((b) => b.mode);
  if (mode) modes[band] = mode;
  return { power: true, vol: 10, sql: 1, band, freqs, modes, ...extra };
}

export function withMem(list: [number, number, Mode][]) {
  const mem: (Channel | null)[] = Array.from({ length: 1000 }, () => null);
  for (const [ch, mhz, mode] of list) mem[ch] = { freq: MHz(mhz), mode, skip: '' };
  return mem;
}

export const at = (r: Radio, mhz: number) => freqEq(r.freq, MHz(mhz));
export const inMHz = (r: Radio, lo: number, hi: number) => r.freq >= MHz(lo) && r.freq <= MHz(hi);
export const L = (en: string, nl: string) => ({ en, nl });
