// Bands, tuning steps and the practice signals the simulator can receive.
// Frequencies are whole hertz so 6.25 kHz steps stay exact.

export type Mode = 'FM' | 'WFM' | 'AM';
export type L = { en: string; nl: string };

export const MHz = (mhz: number) => Math.round(mhz * 1e6);
export const kHz = (khz: number) => Math.round(khz * 1e3);

export interface Band {
  id: string;
  name: L;
  lo: number;
  hi: number;
  start: number;
  mode: Mode;
  step: number;
}

/** The IC-R5's [BAND] groups (manual p. 7). Start frequencies differ per radio version; these are the simulator's. */
export const BANDS: Band[] = [
  { id: 'AMBC', name: { en: 'AM broadcast', nl: 'AM-omroep' }, lo: kHz(150), hi: kHz(1620), start: kHz(531), mode: 'AM', step: kHz(9) },
  { id: 'HF', name: { en: 'HF (shortwave)', nl: 'HF (kortegolf)' }, lo: kHz(1625), hi: kHz(29995), start: MHz(5), mode: 'AM', step: kHz(5) },
  { id: '50', name: { en: '50 MHz', nl: '50 MHz' }, lo: MHz(30), hi: MHz(75.995), start: MHz(51), mode: 'FM', step: kHz(10) },
  { id: 'FMBC', name: { en: 'FM broadcast', nl: 'FM-omroep' }, lo: MHz(76), hi: MHz(107.995), start: MHz(88), mode: 'WFM', step: kHz(100) },
  { id: 'AIR', name: { en: 'VHF air', nl: 'VHF-luchtvaart' }, lo: MHz(108), hi: MHz(136.995), start: MHz(118), mode: 'AM', step: kHz(25) },
  { id: '144', name: { en: '144 MHz', nl: '144 MHz' }, lo: MHz(137), hi: MHz(173.995), start: MHz(145), mode: 'FM', step: kHz(12.5) },
  { id: '300', name: { en: '300 MHz', nl: '300 MHz' }, lo: MHz(174), hi: MHz(399.995), start: MHz(300), mode: 'FM', step: kHz(12.5) },
  { id: '400', name: { en: '400 MHz', nl: '400 MHz' }, lo: MHz(400), hi: MHz(479.995), start: MHz(433), mode: 'FM', step: kHz(12.5) },
  { id: '800', name: { en: '800 MHz', nl: '800 MHz' }, lo: MHz(480), hi: MHz(999.995), start: MHz(851), mode: 'FM', step: kHz(12.5) },
  { id: '1200', name: { en: '1200 MHz', nl: '1200 MHz' }, lo: MHz(1000), hi: MHz(1309.995), start: MHz(1295), mode: 'FM', step: kHz(12.5) },
];

export const bandIndex = (id: string) => BANDS.findIndex((b) => b.id === id);
export const bandOf = (hz: number) => Math.max(0, BANDS.findIndex((b) => hz >= b.lo && hz <= b.hi));

/** Tuning steps (manual p. 9). 8.33 kHz only in the air band, 9 kHz only in the AM broadcast band. */
export const STEPS = [5000, 6250, 25000 / 3, 9000, 10000, 12500, 15000, 20000, 25000, 30000, 50000, 100000];
export const stepsFor = (bandId: string) => STEPS.filter((s) => (s === 25000 / 3 ? bandId === 'AIR' : s === 9000 ? bandId === 'AMBC' : true));
export const stepLabel = (s: number) => (s === 25000 / 3 ? '8.33' : s % 1000 === 0 ? `${s / 1000}.0` : `${s / 1000}`);

export type Sound = 'pop' | 'rock' | 'classical' | 'talk' | 'mellow' | 'voice' | 'digital';

export interface Station {
  id: string;
  f: number;
  /** Half the width over which the signal is at full strength, and the width where it fades out. */
  flat: number;
  fade: number;
  mode: Mode;
  strength: number;
  sound: Sound;
  /** Intermittent transmissions: on for `on` ms every `period` ms. */
  on?: number;
  period?: number;
  label: L;
  /** Real stations (the VRT list) versus practice signals invented for the lessons. */
  real?: boolean;
}

// Each signal is heard only inside its own channel: one 100 kHz click off an FM station, one 5 kHz step off an
// AM station or outside the DAB block is silence (just band noise with the squelch open).
const wfm = (id: string, mhz: number, sound: Sound, strength: number, label: L): Station => ({ id, f: MHz(mhz), flat: kHz(25), fade: kHz(50), mode: 'WFM', strength, sound, label, real: true });
const nfm = (id: string, mhz: number, on: number, period: number, label: L, strength = 0.7): Station => ({ id, f: MHz(mhz), flat: kHz(2.5), fade: kHz(7.5), mode: 'FM', strength, sound: 'voice', on, period, label });

/**
 * What the simulator can hear. The FM stations are VRT's frequencies for Vlaams-Brabant and Brussels (vrt.be);
 * everything else is a practice signal so each lesson has something to find.
 */
export const STATIONS: Station[] = [
  wfm('mnm', 88.3, 'pop', 0.86, { en: 'MNM (Brussels)', nl: 'MNM (Brussel)' }),
  wfm('klara', 89.5, 'classical', 0.8, { en: 'Klara (Vlaams-Brabant)', nl: 'Klara (Vlaams-Brabant)' }),
  wfm('radio1', 91.7, 'talk', 0.9, { en: 'Radio 1 (Vlaams-Brabant)', nl: 'Radio 1 (Vlaams-Brabant)' }),
  wfm('radio2', 93.7, 'mellow', 0.84, { en: 'Radio 2 Vlaams-Brabant', nl: 'Radio 2 Vlaams-Brabant' }),
  wfm('stubru', 100.6, 'rock', 0.92, { en: 'Studio Brussel (Vlaams-Brabant)', nl: 'Studio Brussel (Vlaams-Brabant)' }),
  { id: 'sw', f: kHz(6070), flat: kHz(2), fade: kHz(3), mode: 'AM', strength: 0.45, sound: 'talk', label: { en: 'Shortwave broadcaster (practice signal)', nl: 'Kortegolfzender (oefensignaal)' } },
  { id: 'mw', f: kHz(1008), flat: kHz(2), fade: kHz(3), mode: 'AM', strength: 0.35, sound: 'mellow', label: { en: 'Distant AM station (practice signal)', nl: 'Verre AM-zender (oefensignaal)' } },
  { ...nfm('cb19', 27.185, 6000, 16000, { en: 'CB channel 19 (practice signal)', nl: 'CB-kanaal 19 (oefensignaal)' }), flat: kHz(2.5), fade: kHz(6) },
  nfm('call2m', 145.5, 4500, 20000, { en: '2 m calling channel (practice signal)', nl: '2m-aanroepkanaal (oefensignaal)' }, 0.6),
  nfm('rep2m', 145.65, 7000, 15000, { en: '2 m repeater output (practice signal)', nl: 'Uitgang 2m-relais (oefensignaal)' }, 0.8),
  nfm('iss', 145.8, 6000, 11000, { en: 'ISS voice downlink (practice pass)', nl: 'ISS-spraakverbinding (oefenpassage)' }, 0.55),
  nfm('pmr3', 446.03125, 5000, 13000, { en: 'PMR446 channel 3 (practice signal)', nl: 'PMR446-kanaal 3 (oefensignaal)' }, 0.75),
  { id: 'dab', f: 223936000, flat: 700000, fade: 68000, mode: 'FM', strength: 0.7, sound: 'digital', label: { en: 'DAB+ block 12A (digital, not decodable)', nl: 'DAB+-blok 12A (digitaal, niet te decoderen)' } },
];

/** PMR446 channels 1–16 (12.5 kHz apart from 446.00625 MHz). */
export const PMR446 = Array.from({ length: 16 }, (_, i) => 446006250 + i * 12500);

/** CB channels 1–40 in Europe (the classic CEPT channel plan with its gaps). */
export const CB = (() => {
  const out: number[] = [];
  let f = 26965000;
  for (let ch = 1; ch <= 40; ch++) {
    out.push(f);
    // The historic gaps: 3→4, 7→8, 11→12, 15→16, 19→20 skip a slot; 22→23 and 23→24 are out of order.
    f += [3, 7, 11, 15, 19].includes(ch) ? 20000 : 10000;
  }
  // Channel 23 is 27.255, 24 is 27.235, 25 is 27.245.
  out[22] = 27255000; out[23] = 27235000; out[24] = 27245000;
  return out;
})();
