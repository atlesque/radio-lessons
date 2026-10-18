// Names and short descriptions of every part the lessons point at.

import type { L } from './bands';
import type { Key } from './sim';

export type Control = Key | 'DIAL' | 'ANT' | 'SP' | 'DC' | 'LCD' | 'BATT' | 'SPEAKER';

export const CONTROL_INFO: Record<Control, { name: L; short: L }> = {
  PWR: { name: { en: '[PWR] power key', nl: '[PWR]-aan/uit-toets' }, short: { en: 'Hold 1 s to switch on or off.', nl: 'Houd 1 s in om aan of uit te zetten.' } },
  UP: { name: { en: '[▲] up key', nl: '[▲]-toets' }, short: { en: 'Volume up.', nl: 'Volume omhoog.' } },
  DOWN: { name: { en: '[▼] down key', nl: '[▼]-toets' }, short: { en: 'Volume down.', nl: 'Volume omlaag.' } },
  BAND: { name: { en: '[BAND•LOCK] key', nl: '[BAND•LOCK]-toets' }, short: { en: 'Next frequency band. With [FUNC], hold 1 s to lock the keys.', nl: 'Volgende frequentieband. Met [FUNC] 1 s inhouden om de toetsen te vergrendelen.' } },
  TS: { name: { en: '[TS•SET] key', nl: '[TS•SET]-toets' }, short: { en: 'Tuning step. Hold 1 s for set mode.', nl: 'Afstemstap. Houd 1 s in voor de instelmodus.' } },
  MODE: { name: { en: '[MODE•SCAN] key', nl: '[MODE•SCAN]-toets' }, short: { en: 'AM, FM or WFM. Hold 1 s to scan.', nl: 'AM, FM of WFM. Houd 1 s in om te scannen.' } },
  VM: { name: { en: '[V/M•S.MW•SKIP] key', nl: '[V/M•S.MW•SKIP]-toets' }, short: { en: 'VFO or memory. Hold 1 s to store a channel.', nl: 'VFO of geheugen. Houd 1 s in om een kanaal op te slaan.' } },
  FUNC: { name: { en: '[FUNC] function key', nl: '[FUNC]-functietoets' }, short: { en: 'Hold it to give other keys and the dial their second job.', nl: 'Houd ze in om andere toetsen en de knop hun tweede functie te geven.' } },
  SQL: { name: { en: '[SQL] squelch key', nl: '[SQL]-squelchtoets' }, short: { en: 'Hold to listen past the squelch; hold and turn the dial to set it.', nl: 'Houd in om voorbij de squelch te luisteren; houd in en draai aan de knop om ze in te stellen.' } },
  DIAL: { name: { en: '[DIAL] tuning knob', nl: '[DIAL]-afstemknop' }, short: { en: 'Turn to tune; combined with other keys it sets squelch, bands and more.', nl: 'Draai om af te stemmen; samen met andere toetsen stelt ze squelch, banden en meer in.' } },
  ANT: { name: { en: 'Antenna (SMA)', nl: 'Antenne (SMA)' }, short: { en: 'Screws onto the SMA connector on top.', nl: 'Wordt op de SMA-aansluiting bovenaan geschroefd.' } },
  SP: { name: { en: '[SP] earphone jack', nl: '[SP]-oortelefoonaansluiting' }, short: { en: '3.5 mm jack under the rubber cover; the speaker goes quiet when something is plugged in.', nl: '3,5mm-aansluiting onder het rubberen kapje; de luidspreker zwijgt als er iets in zit.' } },
  DC: { name: { en: '[DC 6V] power jack', nl: '[DC 6V]-voedingsaansluiting' }, short: { en: 'For the charger. Only charge NiMH or NiCd cells, never alkaline.', nl: 'Voor de lader. Laad alleen NiMH- of NiCd-cellen, nooit alkaline.' } },
  LCD: { name: { en: 'Function display', nl: 'Display' }, short: { en: 'Frequency, mode, signal strength and status icons.', nl: 'Frequentie, modus, signaalsterkte en statusiconen.' } },
  BATT: { name: { en: 'Battery cover', nl: 'Batterijklepje' }, short: { en: 'Two AA cells go in here.', nl: 'Hier gaan twee AA-cellen in.' } },
  SPEAKER: { name: { en: 'Speaker', nl: 'Luidspreker' }, short: { en: 'The built-in speaker.', nl: 'De ingebouwde luidspreker.' } },
};

/** Camera presets: a direction from the target and a distance, in millimetres. */
export type View = 'front' | 'overview' | 'left' | 'right' | 'top' | 'back' | 'angle' | 'leftTop';
export const VIEWS: Record<View, { dir: [number, number, number]; target: [number, number, number]; dist: number }> = {
  overview: { dir: [0.35, 0.16, 1], target: [0, 62, 0], dist: 450 },
  front: { dir: [0, 0.05, 1], target: [0, 4, 0], dist: 250 },
  angle: { dir: [0.55, 0.3, 1], target: [0, 8, 0], dist: 270 },
  left: { dir: [-1, 0.12, 0.35], target: [0, 18, 0], dist: 210 },
  leftTop: { dir: [-0.85, 0.6, 0.75], target: [0, 26, 0], dist: 270 },
  right: { dir: [1, 0.12, 0.35], target: [0, 8, 0], dist: 210 },
  top: { dir: [0.15, 1, 0.75], target: [0, 40, 0], dist: 230 },
  back: { dir: [-0.15, 0.1, -1], target: [0, 0, 0], dist: 250 },
};

/** Which view shows a control best. */
export const CONTROL_VIEW: Partial<Record<Control, View>> = {
  FUNC: 'left', SQL: 'left', DC: 'right', BATT: 'back', ANT: 'top', DIAL: 'top', SP: 'top',
};
