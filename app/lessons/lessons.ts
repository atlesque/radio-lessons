// The course. Key sequences follow the IC-R5 instruction manual; Belgian rules follow BIPT's position on scanners.
// Text markup: blank line = paragraph, "- " = list item, **bold**, {KEY} = key cap, [label](url) = link.

import { BANDS, MHz, kHz } from '~/radio/bands';
import { SET_ITEMS } from '~/radio/sim';
import { L, at, inMHz, tuned, withMem } from './helpers';
import type { Lesson } from './types';

const TIP_FUNC = L(
  'With a mouse: click {FUNC} once and it stays held (it glows). Turn the dial, then click {FUNC} again to let go. Keyboard: hold F and use ← →.',
  'Met een muis: klik één keer op {FUNC} en ze blijft ingedrukt (ze licht op). Draai aan de knop en klik nog eens op {FUNC} om los te laten. Toetsenbord: houd F in en gebruik ← →.',
);
const TIP_SQL = L(
  'With a mouse: click {SQL} once and it stays held. Turn the dial, then click {SQL} again to let go. Keyboard: hold S and use ← →.',
  'Met een muis: klik één keer op {SQL} en ze blijft ingedrukt. Draai aan de knop en klik nog eens op {SQL} om los te laten. Toetsenbord: houd S in en gebruik ← →.',
);
const TIP_DIAL = L(
  'Drag across the knob or scroll over it. The ← → keys and the dial buttons under the radio work too.',
  'Sleep over de knop of scrol erboven. De toetsen ← → en de knopjes onder de radio werken ook.',
);
const TIP_HOLD = L(
  'Keep the mouse button (or your finger) down on the key until the radio reacts.',
  'Houd de muisknop (of je vinger) op de toets tot de radio reageert.',
);

const setIndex = (id: string) => SET_ITEMS.findIndex((i) => i.id === id);

export const LESSONS: Lesson[] = [
  {
    slug: 'meet-your-radio',
    icon: 'i-lucide-scan-search',
    minutes: 5,
    title: L('Meet your IC-R5', 'Maak kennis met je IC-R5'),
    summary: L('A tour of every key, the dial, the display and the connectors.', 'Een rondleiding langs elke toets, de knop, het display en de aansluitingen.'),
    intro: L(
      'The Icom IC-R5 is a pocket communications receiver, often called a scanner. It covers 0.150 to 1309.995 MHz and only receives: it cannot transmit, so you can never disturb anyone with it.\n\nDrag to turn the radio; it zooms by itself to stay in view. Click each highlighted part to continue.',
      'De Icom IC-R5 is een zakformaat communicatieontvanger, vaak scanner genoemd. Hij ontvangt van 0,150 tot 1309,995 MHz en kan alleen ontvangen: zenden kan niet, dus je stoort er nooit iemand mee.\n\nSleep om de radio te draaien; hij zoomt zelf zodat hij in beeld blijft. Klik op elk oplichtend onderdeel om verder te gaan.',
    ),
    setup: () => ({ power: false }),
    steps: [
      {
        title: L('Find the antenna', 'Zoek de antenne'), explore: 'ANT', target: ['ANT'], gesture: 'click', view: 'top',
        body: L(
          'The flexible antenna screws onto the **SMA** connector on top. It is made for VHF and UHF; better antennas help, but the stock one is fine to start with. Never carry the radio by its antenna.',
          'De flexibele antenne wordt op de **SMA**-aansluiting bovenaan geschroefd. Ze is gemaakt voor VHF en UHF; betere antennes helpen, maar deze volstaat om te beginnen. Draag de radio nooit aan de antenne.',
        ),
      },
      {
        title: L('The tuning knob', 'De afstemknop'), explore: 'DIAL', target: ['DIAL'], gesture: 'click', view: 'top',
        body: L(
          'Next to it is the tuning knob, {DIAL}. Turning it changes the frequency. Together with other keys it also sets the squelch, the band, the memory channel and the settings.',
          'Daarnaast zit de afstemknop, {DIAL}. Draaien verandert de frequentie. Samen met andere toetsen stelt ze ook de squelch, de band, het geheugenkanaal en de instellingen in.',
        ),
      },
      {
        title: L('The earphone jack', 'De oortelefoonaansluiting'), explore: 'SP', target: ['SP'], gesture: 'click', view: 'top',
        body: L(
          'Under the small rubber cover between them is the **[SP]** jack for earphones or headphones (3.5 mm). When something is plugged in, the speaker goes quiet. Keep the cover on when you don\'t use it.',
          'Onder het rubberen kapje daartussen zit de **[SP]**-aansluiting voor oortjes of een hoofdtelefoon (3,5 mm). Zit er iets in, dan zwijgt de luidspreker. Laat het kapje erop als je ze niet gebruikt.',
        ),
      },
      {
        title: L('The display', 'Het display'), explore: 'LCD', target: ['LCD'], gesture: 'click', view: 'front',
        body: L(
          'The display shows the frequency, the receive mode (FM, W FM or AM), the signal strength bars, the memory channel number and status icons such as the key lock and the battery.',
          'Het display toont de frequentie, de ontvangstmodus (FM, W FM of AM), de signaalsterkte, het geheugenkanaal en statusiconen zoals de toetsvergrendeling en de batterij.',
        ),
      },
      {
        title: L('Keys with two or three jobs', 'Toetsen met twee of drie functies'), explore: 'BAND', target: ['BAND'], gesture: 'click', view: 'front',
        body: L(
          'The four keys under the display each have more than one job:\n\n- the **white** label is a short press\n- the **orange** label (S.MW, SCAN, SET) is a press-and-hold for 1 second\n- a **boxed** label (SKIP, LOCK) works while you hold {FUNC}: SKIP with a short press of {VM}, LOCK by holding {BAND} for 1 second\n\nClick {BAND}.',
          'De vier toetsen onder het display hebben elk meer dan één functie:\n\n- het **witte** label is een korte druk\n- het **oranje** label (S.MW, SCAN, SET) is 1 seconde ingedrukt houden\n- een label **in een kader** (SKIP, LOCK) werkt terwijl je {FUNC} inhoudt: SKIP met een korte druk op {VM}, LOCK door {BAND} 1 seconde in te houden\n\nKlik op {BAND}.',
        ),
      },
      {
        title: L('Volume keys', 'Volumetoetsen'), explore: 'UP', target: ['UP', 'DOWN'], gesture: 'click', view: 'front',
        body: L('{UP} and {DOWN} set the volume in 32 steps. Click {UP}.', '{UP} en {DOWN} regelen het volume in 32 stappen. Klik op {UP}.'),
      },
      {
        title: L('The power key', 'De aan/uit-toets'), explore: 'PWR', target: ['PWR'], gesture: 'click', view: 'front',
        body: L(
          'The orange {PWR} key switches the radio on and off. You hold it for a second, so it doesn\'t switch on in your pocket.',
          'Met de oranje {PWR}-toets zet je de radio aan en uit. Je houdt ze een seconde in, zodat hij niet in je zak aangaat.',
        ),
      },
      {
        title: L('FUNC, the second-job key', 'FUNC, de tweede-functietoets'), explore: 'FUNC', target: ['FUNC'], gesture: 'click', view: 'left',
        body: L(
          'On the left side: {FUNC}. Hold it to give the dial and the other keys their second job, for example tuning 1 MHz per click.',
          'Aan de linkerkant: {FUNC}. Houd ze in om de knop en de andere toetsen hun tweede functie te geven, bijvoorbeeld afstemmen met 1 MHz per klik.',
        ),
      },
      {
        title: L('SQL, the squelch key', 'SQL, de squelchtoets'), explore: 'SQL', target: ['SQL'], gesture: 'click', view: 'left',
        body: L(
          'Below it is {SQL}. Hold it to listen past the squelch, or hold it and turn the dial to set the squelch level. Lesson 3 explains it.',
          'Daaronder zit {SQL}. Houd ze in om voorbij de squelch te luisteren, of houd ze in en draai aan de knop om het squelchniveau in te stellen. Les 3 legt het uit.',
        ),
      },
      {
        title: L('The DC jack', 'De DC-aansluiting'), explore: 'DC', target: ['DC'], gesture: 'click', view: 'right',
        body: L(
          'On the right side, under a cover: the **[DC 6V]** jack for the charger. It charges NiMH or NiCd cells inside the radio in about 10 hours. **Never charge alkaline batteries.**',
          'Aan de rechterkant, onder een kapje: de **[DC 6V]**-aansluiting voor de lader. Die laadt NiMH- of NiCd-cellen in de radio op in ongeveer 10 uur. **Laad nooit alkalinebatterijen op.**',
        ),
      },
      {
        title: L('The battery cover', 'Het batterijklepje'), explore: 'BATT', target: ['BATT'], gesture: 'click', view: 'back',
        body: L(
          'On the back are the belt-clip loop and the battery cover. The radio runs on two AA cells.',
          'Op de achterkant zitten de lus voor de riemclip en het batterijklepje. De radio werkt op twee AA-cellen.',
        ),
      },
    ],
    outro: L('That\'s the whole radio. Next: batteries in, antenna on, and switch it on.', 'Dat is de hele radio. Hierna: batterijen erin, antenne erop en aanzetten.'),
  },

  {
    slug: 'power-up',
    icon: 'i-lucide-power',
    minutes: 3,
    title: L('Batteries, antenna and power', 'Batterijen, antenne en aanzetten'),
    summary: L('Get the radio ready and switch it on and off.', 'Maak de radio klaar en zet hem aan en uit.'),
    intro: L('Before you can listen, the radio needs power and an antenna.', 'Voor je kunt luisteren, heeft de radio stroom en een antenne nodig.'),
    setup: () => ({ power: false, batteries: false, coverOpen: false, antenna: false }),
    steps: [
      {
        title: L('Slide off the battery cover', 'Schuif het batterijklepje eraf'), target: ['BATT'], gesture: 'click', view: 'back',
        body: L(
          'The radio runs on two AA cells, which go in at the back. Slide the battery cover off: **click the glowing cover**.',
          'De radio werkt op twee AA-cellen, die achteraan in de radio gaan. Schuif het batterijklepje eraf: **klik op het oplichtende klepje**.',
        ),
        check: (r) => r.state.coverOpen,
        demo: [{ act: 'cover' }],
        skip: (r) => { if (!r.state.coverOpen) r.toggleCover(); },
      },
      {
        title: L('Put in two AA cells', 'Plaats twee AA-cellen'), target: ['CELLS'], gesture: 'click', view: 'back',
        body: L(
          'Put in two AA cells, matching the + and − marks. Rechargeable **NiMH** cells are best; alkaline cells work too.\n\n- never mix old and new cells, or different brands\n- take the cells out if you won\'t use the radio for weeks: it draws a little current even when off\n\n**Click the compartment** to put them in.',
          'Plaats twee AA-cellen volgens de + en −. Herlaadbare **NiMH**-cellen zijn het best; alkaline werkt ook.\n\n- meng nooit oude en nieuwe cellen, of verschillende merken\n- haal de cellen eruit als je de radio weken niet gebruikt: ook uitgeschakeld verbruikt hij een beetje stroom\n\n**Klik op het batterijvak** om ze erin te steken.',
        ),
        check: (r) => r.state.batteries,
        demo: [{ act: 'cells' }],
        skip: (r) => { if (!r.state.coverOpen) r.toggleCover(); if (!r.state.batteries) r.toggleCells(); },
      },
      {
        title: L('Close the cover', 'Sluit het klepje'), target: ['BATT'], gesture: 'click', view: 'back',
        body: L('Slide the cover back on: **click the cover** below the radio.', 'Schuif het klepje er weer op: **klik op het klepje** onder de radio.'),
        check: (r) => r.state.batteries && !r.state.coverOpen,
        demo: [{ act: 'cover' }],
        skip: (r) => { if (!r.state.coverOpen) r.toggleCover(); if (!r.state.batteries) r.toggleCells(); r.toggleCover(); },
      },
      {
        title: L('Screw on the antenna', 'Schroef de antenne erop'), target: ['ANT'], gesture: 'click', view: 'top',
        body: L(
          'The antenna screws onto the gold **SMA** connector on top, clockwise and finger-tight; no tools. **Click the connector** to screw it on.\n\nKeep the rubber cover on the [SP] jack when you\'re not using earphones, against dust and moisture.',
          'De antenne schroef je met de klok mee op de gouden **SMA**-aansluiting bovenaan, handvast; geen gereedschap. **Klik op de aansluiting** om ze erop te schroeven.\n\nLaat het rubberen kapje op de [SP]-aansluiting als je geen oortjes gebruikt, tegen stof en vocht.',
        ),
        check: (r) => r.state.antenna,
        demo: [{ act: 'antenna' }],
        skip: (r) => r.attachAntenna(),
      },
      {
        title: L('Switch on', 'Zet hem aan'), target: ['PWR'], gesture: 'hold', view: 'front', tip: TIP_HOLD,
        body: L('Hold {PWR} for 1 second until the display comes on.', 'Houd {PWR} 1 seconde in tot het display aangaat.'),
        check: (r) => r.state.power,
        demo: [{ hold: 'PWR', ms: 1200 }],
      },
      {
        title: L('Read the display', 'Lees het display'), target: ['LCD'], view: 'front',
        body: L(
          'The radio starts on the frequency it had when it was switched off. Top right is the battery indicator: two segments mean full, one means nearly empty. While charging it scrolls; when the cells are full, both segments blink.',
          'De radio start op de frequentie van toen hij werd uitgezet. Rechtsboven staat de batterij-indicator: twee segmenten is vol, één is bijna leeg. Tijdens het laden loopt hij; zijn de cellen vol, dan knipperen beide segmenten.',
        ),
      },
      {
        title: L('Switch off', 'Zet hem uit'), target: ['PWR'], gesture: 'hold', tip: TIP_HOLD,
        body: L('Hold {PWR} for 1 second again to switch off.', 'Houd {PWR} opnieuw 1 seconde in om uit te zetten.'),
        check: (r) => !r.state.power,
        demo: [{ hold: 'PWR', ms: 1200 }],
      },
      {
        title: L('And back on', 'En weer aan'), target: ['PWR'], gesture: 'hold',
        body: L('One more time: hold {PWR} to switch on.', 'Nog één keer: houd {PWR} in om aan te zetten.'),
        check: (r) => r.state.power,
        demo: [{ hold: 'PWR', ms: 1200 }],
      },
    ],
    outro: L('The radio keeps its frequency and settings while it is off. Next: volume and squelch.', 'De radio onthoudt zijn frequentie en instellingen als hij uit staat. Hierna: volume en squelch.'),
  },

  {
    slug: 'volume-and-squelch',
    icon: 'i-lucide-volume-2',
    minutes: 5,
    title: L('Volume and squelch', 'Volume en squelch'),
    summary: L('Set the volume and the squelch, and listen past it with monitor.', 'Stel volume en squelch in, en luister er voorbij met monitor.'),
    intro: L(
      'Turn on **Sound** (the speaker button under the radio) to hear the simulation. Everything also works silently: the display and the signal bars show what happens.',
      'Zet het **geluid** aan (de luidsprekerknop onder de radio) om de simulatie te horen. Alles werkt ook zonder geluid: het display en de signaalbalkjes tonen wat er gebeurt.',
    ),
    setup: () => tuned(MHz(145.3), 'FM', { vol: 6, sql: 1 }),
    steps: [
      {
        title: L('Volume up', 'Volume omhoog'), target: ['UP'], gesture: 'press', view: 'front',
        body: L('Press {UP} a few times until the volume is at least **14**. The display briefly shows the level.', 'Druk enkele keren op {UP} tot het volume minstens **14** is. Het display toont kort het niveau.'),
        check: (r) => r.state.vol >= 14,
        demo: [{ press: 'UP' }, { press: 'UP' }, { press: 'UP' }, { press: 'UP' }, { press: 'UP' }, { press: 'UP' }, { press: 'UP' }, { press: 'UP' }],
      },
      {
        title: L('Volume down', 'Volume omlaag'), target: ['DOWN'], gesture: 'press',
        body: L('Press {DOWN} to bring it back a little. Holding a volume key changes it continuously.', 'Druk op {DOWN} om het iets terug te draaien. Houd je een volumetoets in, dan verandert het volume doorlopend.'),
        check: (r, e) => e?.type === 'press' && e.key === 'DOWN',
        demo: [{ press: 'DOWN' }],
      },
      {
        title: L('What squelch does', 'Wat squelch doet'),
        body: L(
          '**Squelch** is a gate. Between transmissions a receiver hears only noise, a hiss. The squelch mutes that noise and opens when a signal comes in.\n\n- **LEVEL 1** is loose, **LEVEL 9** is tight\n- **AUTO** adjusts itself to the noise\n- **OPEN** never mutes',
          '**Squelch** is een poort. Tussen uitzendingen hoort een ontvanger alleen ruis, een gesis. De squelch dempt die ruis en gaat open als er een signaal binnenkomt.\n\n- **LEVEL 1** is los, **LEVEL 9** is streng\n- **AUTO** past zich aan de ruis aan\n- **OPEN** dempt nooit',
        ),
      },
      {
        title: L('Open the squelch', 'Zet de squelch open'), target: ['SQL', 'DIAL'], gesture: 'rotate', view: 'leftTop', tip: TIP_SQL,
        body: L(
          'Hold {SQL} and turn {DIAL} down until the display shows **OPEN**. The first click only shows the current level.',
          'Houd {SQL} in en draai {DIAL} terug tot het display **OPEN** toont. De eerste klik toont alleen het huidige niveau.',
        ),
        check: (r) => r.state.sql === -1,
        demo: [{ sql: -1 }],
      },
      {
        title: L('Close it just enough', 'Sluit ze net genoeg'), target: ['SQL', 'DIAL'], gesture: 'rotate', view: 'leftTop', tip: TIP_SQL,
        body: L(
          'Hear the hiss? That\'s the receiver with nothing to receive. Hold {SQL} and turn the dial up to **LEVEL 1** or **LEVEL 2**, just where the noise stops, then let go of {SQL}.',
          'Hoor je het gesis? Dat is de ontvanger zonder iets om te ontvangen. Houd {SQL} in en draai de knop naar **LEVEL 1** of **LEVEL 2**, net waar de ruis stopt, en laat {SQL} dan los.',
        ),
        check: (r) => (r.state.sql === 1 || r.state.sql === 2) && !r.isHeld('SQL'),
        demo: [{ sql: 1 }],
      },
      {
        title: L('Not too tight', 'Niet te streng'),
        body: L(
          'Set it too tight and weak signals stay muted; too loose and the noise keeps opening it. Level 1 or 2 suits most bands. Always set the squelch before scanning.',
          'Te streng en zwakke signalen blijven gedempt; te los en de ruis opent ze telkens. Level 1 of 2 past bij de meeste banden. Stel de squelch altijd in voor je scant.',
        ),
      },
      {
        title: L('Monitor', 'Monitor'), target: ['SQL'], gesture: 'hold', view: 'left', tip: TIP_SQL,
        body: L(
          'Hold {SQL} for a moment **without** turning the dial. The squelch opens so you can hear weak signals, and the first signal bar blinks. Let go to close it again.',
          'Houd {SQL} even in **zonder** aan de knop te draaien. De squelch gaat open zodat je zwakke signalen hoort, en het eerste signaalbalkje knippert. Laat los om ze weer te sluiten.',
        ),
        check: (r, e) => e?.type === 'monitor',
        demo: [{ hold: 'SQL', ms: 1500 }],
      },
    ],
    outro: L('Volume and squelch are what you\'ll touch most. Next: bands and tuning.', 'Volume en squelch gebruik je het vaakst. Hierna: banden en afstemmen.'),
  },

  {
    slug: 'bands-and-tuning',
    icon: 'i-lucide-audio-lines',
    minutes: 6,
    title: L('Bands and tuning', 'Banden en afstemmen'),
    summary: L('Frequencies, bands, 1 MHz jumps and the tuning step.', 'Frequenties, banden, sprongen van 1 MHz en de afstemstap.'),
    intro: L(
      'A radio signal sits on a **frequency**, counted in megahertz (MHz). In **VFO** mode, the normal mode, you tune freely with the dial. The IC-R5 splits its range into **bands**, each with its own tuning step and receive mode.',
      'Een radiosignaal zit op een **frequentie**, uitgedrukt in megahertz (MHz). In **VFO**-modus, de gewone modus, stem je vrij af met de knop. De IC-R5 verdeelt zijn bereik in **banden**, elk met een eigen afstemstap en ontvangstmodus.',
    ),
    setup: () => tuned(MHz(145), 'FM'),
    steps: [
      {
        title: L('Turn the dial', 'Draai aan de knop'), target: ['DIAL'], gesture: 'rotate', view: 'top', tip: TIP_DIAL,
        body: L('Turn {DIAL} a few clicks. In this band each click moves **12.5 kHz**: 145.000, 145.012 50, 145.025…', 'Draai {DIAL} enkele klikken. In deze band verschuift elke klik **12,5 kHz**: 145.000, 145.012 50, 145.025…'),
        check: (r, e, memo) => { if (e?.type === 'dial' && !e.func && !e.sql) memo.n = (memo.n ?? 0) + 1; return (memo.n ?? 0) >= 3; },
        demo: [{ dial: 4 }],
      },
      {
        title: L('Change band', 'Wissel van band'), target: ['BAND'], gesture: 'press', view: 'front',
        body: L(
          'Press {BAND} several times until you reach the **FM broadcast** band, around 88 MHz with **W FM** on the display. The order: AM broadcast, HF, 50 MHz, FM broadcast, air, 144, 300, 400, 800 and 1200 MHz, then round again.',
          'Druk enkele keren op {BAND} tot je in de **FM-omroepband** zit, rond 88 MHz met **W FM** op het display. De volgorde: AM-omroep, HF, 50 MHz, FM-omroep, luchtvaart, 144, 300, 400, 800 en 1200 MHz, en dan opnieuw.',
        ),
        check: (r) => r.bandId === 'FMBC',
        demo: [{ band: 'FMBC' }],
      },
      {
        title: L('Jump 1 MHz at a time', 'Spring per 1 MHz'), target: ['FUNC', 'DIAL'], gesture: 'rotate', view: 'leftTop', tip: TIP_FUNC,
        body: L('Hold {FUNC} and turn {DIAL}: each click is now **1 MHz**. Go to **100** MHz.', 'Houd {FUNC} in en draai aan {DIAL}: elke klik is nu **1 MHz**. Ga naar **100** MHz.'),
        check: (r) => r.bandId === 'FMBC' && inMHz(r, 100, 100.999),
        demo: [{ tune: MHz(100) }],
      },
      {
        title: L('Fine-tune to 100.6 MHz', 'Stem fijn af op 100,6 MHz'), target: ['DIAL'], gesture: 'rotate', view: 'top', tip: TIP_DIAL,
        body: L(
          'Let go of {FUNC}, then fine-tune to **100.6 MHz** with the dial (100 kHz per click in this band). That\'s Studio Brussel in Vlaams-Brabant and Brussels.',
          'Laat {FUNC} los en stem met de knop fijn af op **100,6 MHz** (100 kHz per klik in deze band). Dat is Studio Brussel in Vlaams-Brabant en Brussel.',
        ),
        check: (r) => at(r, 100.6) && !r.isHeld('FUNC'),
        demo: [{ tune: MHz(100.6) }],
      },
      {
        title: L('The tuning step', 'De afstemstap'),
        body: L(
          'The **tuning step** decides how far one click goes. Each band has its own; pick the one that matches the channel spacing of what you listen to. Steps from 5 to 100 kHz are available, plus 8.33 kHz in the air band and 9 kHz in the AM broadcast band.',
          'De **afstemstap** bepaalt hoe ver één klik gaat. Elke band heeft zijn eigen stap; kies die die past bij de kanaalafstand van wat je beluistert. Er zijn stappen van 5 tot 100 kHz, plus 8,33 kHz in de luchtvaartband en 9 kHz in de AM-omroepband.',
        ),
      },
      {
        title: L('Set a 50 kHz step', 'Kies een stap van 50 kHz'), target: ['TS', 'DIAL'], gesture: 'press', view: 'angle',
        body: L(
          'Press {TS}. The display shows the step (100.0) and **TS**. Turn {DIAL} to **50.0** (kHz), then press {TS} again.',
          'Druk op {TS}. Het display toont de stap (100.0) en **TS**. Draai {DIAL} naar **50.0** (kHz) en druk dan opnieuw op {TS}.',
        ),
        check: (r) => r.state.steps[r.state.band] === kHz(50) && r.state.screen === 'normal',
        demo: [{ step: kHz(50) }],
      },
      {
        title: L('And back to 100 kHz', 'En terug naar 100 kHz'), target: ['TS', 'DIAL'], gesture: 'press',
        body: L('Set it back: {TS}, dial to **100.0**, {TS}. FM stations in Belgium are 100 kHz apart, so that\'s the handy step here.', 'Zet hem terug: {TS}, knop naar **100.0**, {TS}. FM-zenders in België liggen 100 kHz uit elkaar, dus dat is hier de handige stap.'),
        check: (r) => r.state.steps[r.state.band] === kHz(100) && r.state.screen === 'normal',
        demo: [{ step: kHz(100) }],
      },
    ],
    outro: L('You can now reach any frequency. Next: your first real station.', 'Je kunt nu elke frequentie bereiken. Hierna: je eerste echte zender.'),
  },

  {
    slug: 'fm-radio',
    icon: 'i-lucide-radio',
    minutes: 5,
    title: L('Your first station: FM radio', 'Je eerste zender: FM-radio'),
    summary: L('Tune in VRT stations and read the signal meter.', 'Stem af op VRT-zenders en lees de signaalmeter.'),
    intro: L(
      'FM broadcasting runs from 87.5 to 108 MHz in **WFM** (wide FM). In Flanders and Brussels you\'ll find VRT (Radio 1, Radio 2, Klara, Studio Brussel, MNM), RTBF in French and many private stations. Frequencies differ per region; the simulator uses VRT\'s frequencies for Vlaams-Brabant and Brussels.',
      'FM-omroep loopt van 87,5 tot 108 MHz in **WFM** (breed FM). In Vlaanderen en Brussel vind je VRT (Radio 1, Radio 2, Klara, Studio Brussel, MNM), RTBF in het Frans en veel private zenders. De frequenties verschillen per regio; de simulator gebruikt die van VRT voor Vlaams-Brabant en Brussel.',
    ),
    setup: () => tuned(MHz(88), 'WFM'),
    steps: [
      {
        title: L('Tune to MNM', 'Stem af op MNM'), target: ['DIAL'], gesture: 'rotate', view: 'front', tip: TIP_DIAL,
        body: L('Tune to **88.3 MHz**: MNM in Brussels.', 'Stem af op **88,3 MHz**: MNM in Brussel.'),
        check: (r) => at(r, 88.3), demo: [{ tune: MHz(88.3) }],
      },
      {
        title: L('Klara', 'Klara'), target: ['DIAL'], gesture: 'rotate',
        body: L('Now **89.5 MHz**: Klara.', 'Nu **89,5 MHz**: Klara.'),
        check: (r) => at(r, 89.5), demo: [{ tune: MHz(89.5) }],
      },
      {
        title: L('Radio 1', 'Radio 1'), target: ['DIAL'], gesture: 'rotate',
        body: L('**91.7 MHz**: Radio 1. Watch the signal bars at the bottom of the display.', '**91,7 MHz**: Radio 1. Let op de signaalbalkjes onderaan het display.'),
        check: (r) => at(r, 91.7), demo: [{ tune: MHz(91.7) }],
      },
      {
        title: L('Just off the station', 'Net naast de zender'), target: ['DIAL'], gesture: 'rotate',
        body: L('Tune one click up to **91.8 MHz**. The signal fades: you\'re off the station.', 'Stem één klik hoger af, op **91,8 MHz**. Het signaal valt weg: je zit naast de zender.'),
        check: (r) => at(r, 91.8), demo: [{ tune: MHz(91.8) }],
      },
      {
        title: L('Radio 2', 'Radio 2'), target: ['DIAL'], gesture: 'rotate',
        body: L('Go on to **93.7 MHz**: Radio 2 Vlaams-Brabant.', 'Ga verder naar **93,7 MHz**: Radio 2 Vlaams-Brabant.'),
        check: (r) => at(r, 93.7), demo: [{ tune: MHz(93.7) }],
      },
      {
        title: L('Your own region', 'Je eigen regio'),
        body: L(
          'Living elsewhere? These are VRT\'s frequencies per region ([vrt.be](https://www.vrt.be/nl/ons-aanbod/fm-antenne)):\n\n- **Antwerpen**: Radio 1 94.2 · Radio 2 97.5 · Klara 96.4 · StuBru 100.9 · MNM 89.0\n- **Vlaams-Brabant**: Radio 1 91.7 · Radio 2 93.7 · Klara 89.5 · StuBru 100.6 · MNM 97.0 (Brussels 88.3)\n- **Leuven**: Radio 1 98.5 · Radio 2 88.7 · StuBru 88.0 · MNM 94.8\n- **Limburg**: Radio 1 99.9 · Radio 2 97.9 · Klara 89.9 · StuBru 101.4 · MNM 102.0\n- **Oost-Vlaanderen**: Radio 1 95.7 · Radio 2 98.6 · Klara 92.0 · StuBru 102.1 (Gent 94.5) · MNM 101.5\n- **West-Vlaanderen**: Radio 1 95.7 · Radio 2 100.1 · Klara 90.4 · StuBru 102.1 · MNM 101.5',
          'Woon je elders? Dit zijn de VRT-frequenties per regio ([vrt.be](https://www.vrt.be/nl/ons-aanbod/fm-antenne)):\n\n- **Antwerpen**: Radio 1 94.2 · Radio 2 97.5 · Klara 96.4 · StuBru 100.9 · MNM 89.0\n- **Vlaams-Brabant**: Radio 1 91.7 · Radio 2 93.7 · Klara 89.5 · StuBru 100.6 · MNM 97.0 (Brussel 88.3)\n- **Leuven**: Radio 1 98.5 · Radio 2 88.7 · StuBru 88.0 · MNM 94.8\n- **Limburg**: Radio 1 99.9 · Radio 2 97.9 · Klara 89.9 · StuBru 101.4 · MNM 102.0\n- **Oost-Vlaanderen**: Radio 1 95.7 · Radio 2 98.6 · Klara 92.0 · StuBru 102.1 (Gent 94.5) · MNM 101.5\n- **West-Vlaanderen**: Radio 1 95.7 · Radio 2 100.1 · Klara 90.4 · StuBru 102.1 · MNM 101.5',
        ),
      },
      {
        title: L('Quick check', 'Even testen'),
        body: L('Which receive mode do FM broadcast stations need?', 'Welke ontvangstmodus hebben FM-omroepzenders nodig?'),
        quiz: {
          options: [
            { text: L('WFM', 'WFM'), correct: true, explain: L('Right: broadcast FM is wide, about 200 kHz per station.', 'Juist: omroep-FM is breed, ongeveer 200 kHz per zender.') },
            { text: L('FM', 'FM'), explain: L('Narrow FM is for walkie-talkies and radio amateurs; broadcast sounds distorted in it.', 'Smal FM is voor walkietalkies en radioamateurs; omroep klinkt er vervormd in.') },
            { text: L('AM', 'AM'), explain: L('AM is for medium wave, shortwave and aviation.', 'AM is voor middengolf, kortegolf en luchtvaart.') },
          ],
        },
      },
    ],
    outro: L(
      'Indoors, stand near a window. Your earphone cable can serve as the FM antenna (set mode, ANT, EAR). Next: why the receive mode matters.',
      'Binnen ga je best bij een raam staan. Je oortjeskabel kan dienen als FM-antenne (instelmodus, ANT, EAR). Hierna: waarom de ontvangstmodus ertoe doet.',
    ),
  },

  {
    slug: 'receive-modes',
    icon: 'i-lucide-waves',
    minutes: 4,
    title: L('Receive modes: AM, FM and WFM', 'Ontvangstmodi: AM, FM en WFM'),
    summary: L('Why the mode must match the signal.', 'Waarom de modus bij het signaal moet passen.'),
    intro: L(
      'Radio signals carry sound in different ways:\n\n- **AM** (amplitude modulation): medium wave and shortwave broadcasting, and aviation\n- **FM** (narrow FM): radio amateurs, PMR446 walkie-talkies, CB in Europe, business radio\n- **WFM** (wide FM): FM broadcasting\n\nThe receive mode must match the signal, or it sounds distorted or nearly silent.',
      'Radiosignalen dragen geluid op verschillende manieren:\n\n- **AM** (amplitudemodulatie): middengolf- en kortegolfomroep, en luchtvaart\n- **FM** (smal FM): radioamateurs, PMR446-walkietalkies, CB in Europa, bedrijfsradio\n- **WFM** (breed FM): FM-omroep\n\nDe ontvangstmodus moet bij het signaal passen, anders klinkt het vervormd of bijna stil.',
    ),
    setup: () => tuned(MHz(100.6), 'WFM'),
    steps: [
      {
        title: L('Narrow FM', 'Smal FM'), target: ['MODE'], gesture: 'press', view: 'front',
        body: L('Press {MODE} until the display shows **FM** without the W. With Sound on, Studio Brussel now sounds loud and distorted.', 'Druk op {MODE} tot het display **FM** toont zonder W. Met geluid aan klinkt Studio Brussel nu luid en vervormd.'),
        check: (r) => r.mode === 'FM', demo: [{ mode: 'FM' }],
      },
      {
        title: L('AM', 'AM'), target: ['MODE'], gesture: 'press',
        body: L('Press {MODE} again: **AM**. Barely anything intelligible.', 'Druk opnieuw op {MODE}: **AM**. Bijna niets verstaanbaars.'),
        check: (r) => r.mode === 'AM', demo: [{ mode: 'AM' }],
      },
      {
        title: L('Back to WFM', 'Terug naar WFM'), target: ['MODE'], gesture: 'press',
        body: L('Press {MODE} once more to get back to **W FM**.', 'Druk nog eens op {MODE} om terug te keren naar **W FM**.'),
        check: (r) => r.mode === 'WFM', demo: [{ mode: 'WFM' }],
      },
      {
        title: L('Walkie-talkies', 'Walkietalkies'),
        body: L('You want to listen to PMR446 walkie-talkies. Which mode?', 'Je wilt naar PMR446-walkietalkies luisteren. Welke modus?'),
        quiz: {
          options: [
            { text: L('FM', 'FM'), correct: true, explain: L('Right: PMR446 uses narrow FM on 12.5 kHz channels.', 'Juist: PMR446 gebruikt smal FM op kanalen van 12,5 kHz.') },
            { text: L('WFM', 'WFM'), explain: L('WFM is only for broadcast stations; walkie-talkies would sound weak.', 'WFM is alleen voor omroepzenders; walkietalkies zouden zwak klinken.') },
            { text: L('AM', 'AM'), explain: L('PMR446 is FM; in AM you\'d hear only distortion.', 'PMR446 is FM; in AM hoor je alleen vervorming.') },
          ],
        },
      },
      {
        title: L('Shortwave', 'Kortegolf'),
        body: L('Shortwave broadcasters around 6 MHz transmit in…', 'Kortegolfzenders rond 6 MHz zenden uit in…'),
        quiz: {
          options: [
            { text: L('AM', 'AM'), correct: true, explain: L('Right: shortwave and medium-wave broadcasting use AM.', 'Juist: kortegolf- en middengolfomroep gebruiken AM.') },
            { text: L('FM', 'FM'), explain: L('Not for broadcasting on shortwave; that is AM.', 'Niet voor omroep op kortegolf; dat is AM.') },
            { text: L('WFM', 'WFM'), explain: L('WFM only exists in the FM broadcast band.', 'WFM bestaat alleen in de FM-omroepband.') },
          ],
        },
      },
    ],
    outro: L('The radio remembers the mode per band and per memory channel. Next: what you may listen to in Belgium.', 'De radio onthoudt de modus per band en per geheugenkanaal. Hierna: waar je in België naar mag luisteren.'),
  },

  {
    slug: 'listening-rules',
    icon: 'i-lucide-scale',
    minutes: 4,
    title: L('What you may listen to in Belgium', 'Waar je in België naar mag luisteren'),
    summary: L('Free to listen to, off-limits, and what to do by accident.', 'Vrij te beluisteren, verboden terrein, en wat je doet bij toeval.'),
    intro: L(
      'In Belgium you may buy and own a receiver like the IC-R5. What you may **listen to** is limited: BIPT, the Belgian telecom regulator, says you may only listen to frequencies that are free to listen to, or that the user has given you permission for.',
      'In België mag je een ontvanger zoals de IC-R5 kopen en bezitten. Waar je naar mag **luisteren** is beperkt: het BIPT, de Belgische telecomregulator, zegt dat je alleen mag luisteren naar frequenties die vrij te beluisteren zijn, of waarvoor de gebruiker je toestemming gaf.',
    ),
    setup: () => tuned(MHz(100.6), 'WFM'),
    steps: [
      {
        title: L('Free to listen to', 'Vrij te beluisteren'),
        body: L(
          'BIPT\'s own examples of frequencies anyone may listen to:\n\n- **broadcasting**: FM, AM and shortwave radio stations\n- **radio amateurs**\n- **CB** on 27 MHz\n- **PMR446** walkie-talkies',
          'De voorbeelden van het BIPT zelf van frequenties waar iedereen naar mag luisteren:\n\n- **omroep**: FM-, AM- en kortegolfzenders\n- **radioamateurs**\n- **CB** op 27 MHz\n- **PMR446**-walkietalkies',
        ),
      },
      {
        title: L('Not without permission', 'Niet zonder toestemming'),
        body: L(
          'Police and emergency services, aviation, maritime radio, cordless and mobile phones and companies\' private radio are not meant for you. Listening to them without permission breaks the Electronic Communications Act (articles 41 and 124) and, for private communication, the Criminal Code (article 314bis).\n\nBelgium\'s emergency services use ASTRID, an encrypted digital network. A receiver that can decode encrypted traffic is illegal in itself; the IC-R5 can\'t.',
          'Politie en hulpdiensten, luchtvaart, maritieme radio, draadloze en mobiele telefoons en bedrijfsradio zijn niet voor jou bedoeld. Zonder toestemming meeluisteren is in strijd met de wet betreffende de elektronische communicatie (artikelen 41 en 124) en, voor privécommunicatie, met het Strafwetboek (artikel 314bis).\n\nDe Belgische hulpdiensten gebruiken ASTRID, een versleuteld digitaal netwerk. Een ontvanger die versleuteld verkeer kan decoderen is op zich al illegaal; de IC-R5 kan dat niet.',
        ),
      },
      {
        title: L('If it happens by accident', 'Als het per toeval gebeurt'),
        body: L(
          'Come across such a transmission by accident? Don\'t record it, repeat it, share it or use it: tune away. The IC-R5 has the air band in its band list, but in Belgium listening to it needs permission, so these lessons skip it.',
          'Kom je per toeval zo\'n uitzending tegen? Neem ze niet op, vertel ze niet verder, deel of gebruik ze niet: stem weg. De IC-R5 heeft de luchtvaartband in zijn bandenlijst, maar in België heb je toestemming nodig om ernaar te luisteren, dus deze lessen slaan ze over.',
        ),
      },
      {
        title: L('Question 1', 'Vraag 1'),
        body: L('Which of these may you listen to freely in Belgium?', 'Waar mag je in België vrij naar luisteren?'),
        quiz: {
          options: [
            { text: L('Radio amateurs on the 2 m band', 'Radioamateurs op de 2m-band'), correct: true, explain: L('Right: amateur radio is one of BIPT\'s examples of freely listenable frequencies.', 'Juist: amateurradio is een van de voorbeelden van het BIPT van vrij te beluisteren frequenties.') },
            { text: L('The tower at Brussels Airport', 'De verkeerstoren van Brussels Airport'), explain: L('Aviation is not freely listenable in Belgium; you need permission.', 'Luchtvaart is in België niet vrij te beluisteren; je hebt toestemming nodig.') },
            { text: L('Police patrols', 'Politiepatrouilles'), explain: L('Police and emergency services are explicitly off-limits without their permission.', 'Politie en hulpdiensten zijn uitdrukkelijk verboden zonder hun toestemming.') },
          ],
        },
      },
      {
        title: L('Question 2', 'Vraag 2'),
        body: L('You hear a conversation that isn\'t meant for you. What do you do?', 'Je hoort een gesprek dat niet voor jou bedoeld is. Wat doe je?'),
        quiz: {
          options: [
            { text: L('Tune away, and don\'t record or pass it on', 'Wegstemmen, en niets opnemen of doorvertellen'), correct: true, explain: L('Right: by law, accidental reception may not be repeated, shared or used.', 'Juist: wat je per toeval ontvangt, mag je wettelijk niet weergeven, delen of gebruiken.') },
            { text: L('Record it for later', 'Het opnemen voor later'), explain: L('Recording it is exactly what the law forbids.', 'Opnemen is precies wat de wet verbiedt.') },
            { text: L('Post it online', 'Het online zetten'), explain: L('Sharing it with others is forbidden.', 'Het delen met anderen is verboden.') },
          ],
        },
      },
      {
        title: L('Question 3', 'Vraag 3'),
        body: L('Can the IC-R5 decode digital signals such as DAB+, ASTRID (TETRA) or DMR?', 'Kan de IC-R5 digitale signalen zoals DAB+, ASTRID (TETRA) of DMR decoderen?'),
        quiz: {
          options: [
            { text: L('No: it only receives analogue AM, FM and WFM', 'Nee: hij ontvangt alleen analoog AM, FM en WFM'), correct: true, explain: L('Right: digital signals just sound like buzzing noise on it.', 'Juist: digitale signalen klinken erop gewoon als zoemende ruis.') },
            { text: L('Yes, all of them', 'Ja, allemaal'), explain: L('It\'s an analogue receiver from the early 2000s.', 'Het is een analoge ontvanger van begin jaren 2000.') },
          ],
        },
      },
    ],
    outro: L(
      'This is a summary, not legal advice. Check [BIPT](https://www.bipt.be/consumers/forbidden-andor-special-equipment) for the current rules. Next: memory channels.',
      'Dit is een samenvatting, geen juridisch advies. Kijk bij het [BIPT](https://www.bipt.be/consumers/forbidden-andor-special-equipment) voor de geldende regels. Hierna: geheugenkanalen.',
    ),
  },

  {
    slug: 'memory-channels',
    icon: 'i-lucide-bookmark',
    minutes: 6,
    title: L('Memory channels', 'Geheugenkanalen'),
    summary: L('Store stations and call them back instantly.', 'Bewaar zenders en roep ze meteen terug op.'),
    intro: L(
      'Memory channels store a frequency with its receive mode (and more), so you can call a station back instantly. The IC-R5 has 1000 regular channels (000–999), plus 50 scan-edge and 200 auto-write channels.',
      'Geheugenkanalen bewaren een frequentie met haar ontvangstmodus (en meer), zodat je een zender meteen terugvindt. De IC-R5 heeft 1000 gewone kanalen (000–999), plus 50 kanalen voor scangrenzen en 200 automatische kanalen.',
    ),
    setup: () => tuned(MHz(100.6), 'WFM'),
    steps: [
      {
        title: L('Start storing', 'Begin met opslaan'), target: ['VM'], gesture: 'hold', view: 'front', tip: TIP_HOLD,
        body: L('Hold {VM} for 1 second. The memory icon and channel number blink: you\'re choosing where to store 100.6 MHz.', 'Houd {VM} 1 seconde in. Het geheugenicoon en het kanaalnummer knipperen: je kiest waar je 100,6 MHz opslaat.'),
        check: (r) => r.state.screen === 'write', demo: [{ hold: 'VM', ms: 1200 }],
      },
      {
        title: L('Pick channel 001', 'Kies kanaal 001'), target: ['DIAL'], gesture: 'rotate', view: 'angle', tip: TIP_DIAL,
        body: L('Turn {DIAL} to channel **001**.', 'Draai {DIAL} naar kanaal **001**.'),
        check: (r) => r.state.screen === 'write' && r.state.writeCh === 1, demo: [{ writeCh: 1 }],
      },
      {
        title: L('Store it', 'Sla op'), target: ['VM'], gesture: 'hold', view: 'front', tip: TIP_HOLD,
        body: L('Hold {VM} for 1 second again. Three beeps: it\'s stored.', 'Houd {VM} opnieuw 1 seconde in. Drie piepjes: opgeslagen.'),
        check: (r) => !!r.state.mem[1] && Math.abs(r.state.mem[1]!.freq - MHz(100.6)) < 1, demo: [{ hold: 'VM', ms: 1200 }],
      },
      {
        title: L('Tune another station', 'Stem af op een andere zender'), target: ['DIAL'], gesture: 'rotate', view: 'front', tip: TIP_DIAL,
        body: L('Tune to **91.7 MHz** (Radio 1).', 'Stem af op **91,7 MHz** (Radio 1).'),
        check: (r) => at(r, 91.7) && !r.state.memMode, demo: [{ tune: MHz(91.7) }],
      },
      {
        title: L('Store it in 002', 'Sla op in 002'), target: ['VM', 'DIAL'], gesture: 'hold',
        body: L('Store it in channel **002**: hold {VM}, turn to 002, hold {VM} again.', 'Bewaar het in kanaal **002**: houd {VM} in, draai naar 002, houd {VM} opnieuw in.'),
        check: (r) => !!r.state.mem[2] && Math.abs(r.state.mem[2]!.freq - MHz(91.7)) < 1,
        demo: [{ hold: 'VM', ms: 1200 }, { writeCh: 2 }, { hold: 'VM', ms: 1200 }],
      },
      {
        title: L('Memory mode', 'Geheugenmodus'), target: ['VM'], gesture: 'press',
        body: L('Press {VM} briefly to switch to **memory mode**. The **M** icon and the channel number appear.', 'Druk kort op {VM} om naar de **geheugenmodus** te gaan. Het **M**-icoon en het kanaalnummer verschijnen.'),
        check: (r) => r.state.memMode, demo: [{ press: 'VM' }],
      },
      {
        title: L('Step through your channels', 'Blader door je kanalen'), target: ['DIAL'], gesture: 'rotate', tip: TIP_DIAL,
        body: L('Turn {DIAL}: in memory mode it steps through your stored channels only.', 'Draai aan {DIAL}: in geheugenmodus gaat ze alleen langs je opgeslagen kanalen.'),
        check: (r, e) => e?.type === 'dial' && r.state.memMode, demo: [{ dial: 1 }],
      },
      {
        title: L('Back to VFO', 'Terug naar VFO'), target: ['VM'], gesture: 'press',
        body: L('Press {VM} to go back to VFO mode and tune freely again.', 'Druk op {VM} om terug te gaan naar de VFO-modus en weer vrij af te stemmen.'),
        check: (r) => !r.state.memMode, demo: [{ press: 'VM' }],
      },
    ],
    outro: L(
      'Keep holding {VM} after storing and the channel number moves on, handy for storing a list. Channel names and banks are easiest with Icom\'s CS-R5 cloning software. Next: scanning.',
      'Blijf je {VM} na het opslaan inhouden, dan schuift het kanaalnummer op, handig om een lijst op te slaan. Kanaalnamen en banken gaan het makkelijkst met Icoms CS-R5-kloonsoftware. Hierna: scannen.',
    ),
  },

  {
    slug: 'scanning',
    icon: 'i-lucide-radar',
    minutes: 7,
    title: L('Scanning', 'Scannen'),
    summary: L('Let the radio search a band or your memories.', 'Laat de radio een band of je geheugens afzoeken.'),
    intro: L(
      'Scanning makes the radio search for you and stop on signals. The IC-R5 has full scan (ALL), band scan (BAND), programmed scan between two edges (PROG) and memory and bank scans. The squelch decides what counts as a signal: set it just past the noise, or the scan stops everywhere.',
      'Bij scannen zoekt de radio voor jou en stopt hij op signalen. De IC-R5 heeft een volledige scan (ALL), een bandscan (BAND), een geprogrammeerde scan tussen twee grenzen (PROG) en geheugen- en bankscans. De squelch bepaalt wat als signaal telt: zet ze net voorbij de ruis, anders stopt de scan overal.',
    ),
    setup: () => tuned(MHz(87.5), 'WFM', { sql: 2, mem: withMem([[1, 88.3, 'WFM'], [2, 89.5, 'WFM'], [3, 91.7, 'WFM'], [4, 93.7, 'WFM'], [5, 100.6, 'WFM']]) }),
    steps: [
      {
        title: L('Choose a scan type', 'Kies een scantype'), target: ['MODE'], gesture: 'hold', view: 'front', tip: TIP_HOLD,
        body: L('Hold {MODE} for 1 second. The display shows the scan type.', 'Houd {MODE} 1 seconde in. Het display toont het scantype.'),
        check: (r) => r.state.screen === 'scanType', demo: [{ hold: 'MODE', ms: 1200 }],
      },
      {
        title: L('Band scan', 'Bandscan'), target: ['DIAL'], gesture: 'rotate', view: 'angle', tip: TIP_DIAL,
        body: L('Turn {DIAL} until it says **BAND**: only the FM broadcast band is scanned.', 'Draai {DIAL} tot er **BAND** staat: alleen de FM-omroepband wordt gescand.'),
        check: (r) => r.state.screen === 'scanType' && r.state.scanType === 'BAND',
        demo: [{ scanType: 'BAND' }],
      },
      {
        title: L('Start the scan', 'Start de scan'), target: ['MODE'], gesture: 'press', view: 'front',
        body: L('Press {MODE} to start. The decimal point blinks while the radio scans.', 'Druk op {MODE} om te starten. Het decimaalpunt knippert terwijl de radio scant.'),
        check: (r) => r.state.scan?.kind === 'BAND', demo: [{ press: 'MODE' }],
      },
      {
        title: L('Wait for a station', 'Wacht op een zender'), target: ['LCD'], view: 'front',
        body: L('Wait: the scan stops on a station and stays for 10 seconds (the pause timer), then moves on.', 'Wacht: de scan stopt op een zender en blijft er 10 seconden (de pauzetimer), daarna gaat hij verder.'),
        check: (r, e) => e?.type === 'scanPause' || !!r.state.scan?.pausedAt,
      },
      {
        title: L('Move on yourself', 'Ga zelf verder'), target: ['DIAL'], gesture: 'rotate', tip: TIP_DIAL,
        body: L('Turn {DIAL} to move on right away, or the other way to change direction.', 'Draai aan {DIAL} om meteen verder te gaan, of de andere kant op om van richting te veranderen.'),
        check: (r, e) => e?.type === 'dial' && !!r.state.scan, demo: [{ dial: 1 }],
      },
      {
        title: L('Stop scanning', 'Stop met scannen'), target: ['MODE'], gesture: 'press',
        body: L('Press {MODE} to stop.', 'Druk op {MODE} om te stoppen.'),
        check: (r) => !r.state.scan, demo: [{ press: 'MODE' }],
      },
      {
        title: L('Scan your memories', 'Scan je geheugens'), target: ['VM', 'MODE'], gesture: 'press', tip: TIP_HOLD,
        body: L('Five stations are already stored. Press {VM} for memory mode, then hold {MODE} for 1 second: the memory scan starts.', 'Er staan al vijf zenders in het geheugen. Druk op {VM} voor de geheugenmodus en houd dan {MODE} 1 seconde in: de geheugenscan start.'),
        check: (r) => r.state.scan?.kind === 'MEM', demo: [{ press: 'VM' }, { wait: 300 }, { hold: 'MODE', ms: 1200 }],
      },
      {
        title: L('Stop it', 'Stop hem'), target: ['MODE'], gesture: 'press',
        body: L('Stop it with {MODE}.', 'Stop hem met {MODE}.'),
        check: (r) => !r.state.scan && r.state.memMode, demo: [{ press: 'MODE' }],
      },
      {
        title: L('Skip a channel', 'Sla een kanaal over'), target: ['FUNC', 'VM'], gesture: 'press', view: 'angle', tip: TIP_FUNC,
        body: L('Skip a channel you don\'t want in the scan: pick it with {DIAL}, then hold {FUNC} and press {VM}. **SKIP** appears on the display.', 'Sla een kanaal over dat je niet in de scan wilt: kies het met {DIAL}, houd dan {FUNC} in en druk op {VM}. **SKIP** verschijnt op het display.'),
        check: (r) => r.state.mem.some((c) => c?.skip === 'SKIP'), demo: [{ down: 'FUNC' }, { wait: 200 }, { press: 'VM' }, { wait: 200 }, { up: 'FUNC' }],
      },
    ],
    outro: L(
      '{FUNC} + {VM} once more sets **P SKIP** (also skipped in VFO scans), and again clears it. Next: walkie-talkies and CB.',
      'Nog eens {FUNC} + {VM} geeft **P SKIP** (ook overgeslagen bij VFO-scans), en nog eens wist het. Hierna: walkietalkies en CB.',
    ),
  },

  {
    slug: 'pmr446-and-cb',
    icon: 'i-lucide-messages-square',
    minutes: 7,
    title: L('PMR446 and CB', 'PMR446 en CB'),
    summary: L('Licence-free walkie-talkies and citizens band, and the 6.25 kHz step.', 'Vergunningsvrije walkietalkies en CB, en de stap van 6,25 kHz.'),
    intro: L(
      '**PMR446** walkie-talkies need no licence: 16 channels from 446.00625 to 446.19375 MHz, 12.5 kHz apart, in FM. Channel 1 is 446.00625 MHz. You may listen to them in Belgium.',
      '**PMR446**-walkietalkies hebben geen vergunning nodig: 16 kanalen van 446,00625 tot 446,19375 MHz, 12,5 kHz uit elkaar, in FM. Kanaal 1 is 446,00625 MHz. Je mag er in België naar luisteren.',
    ),
    setup: () => tuned(MHz(433), 'FM'),
    steps: [
      {
        title: L('A 6.25 kHz step', 'Een stap van 6,25 kHz'), target: ['TS', 'DIAL'], gesture: 'press', view: 'angle',
        body: L('Starting from 433.000 in 12.5 kHz steps, you\'d never land on 446.006 25. Press {TS}, turn to **6.25**, press {TS}.', 'Vanaf 433.000 in stappen van 12,5 kHz kom je nooit op 446.006 25 uit. Druk op {TS}, draai naar **6.25**, druk op {TS}.'),
        check: (r) => r.state.steps[r.state.band] === 6250 && r.state.screen === 'normal', demo: [{ step: 6250 }],
      },
      {
        title: L('Jump to 446 MHz', 'Spring naar 446 MHz'), target: ['FUNC', 'DIAL'], gesture: 'rotate', view: 'leftTop', tip: TIP_FUNC,
        body: L('Hold {FUNC} and turn {DIAL} up to **446** MHz.', 'Houd {FUNC} in en draai {DIAL} op naar **446** MHz.'),
        check: (r) => inMHz(r, 446, 446.999), demo: [{ tune: MHz(446) }],
      },
      {
        title: L('Channel 1', 'Kanaal 1'), target: ['DIAL'], gesture: 'rotate', view: 'front', tip: TIP_DIAL,
        body: L('Let go of {FUNC} and tune to **446.006** with a small **25** beside it: that\'s 446.006 25 MHz, channel 1.', 'Laat {FUNC} los en stem af op **446.006** met een kleine **25** ernaast: dat is 446,00625 MHz, kanaal 1.'),
        check: (r) => Math.abs(r.freq - 446006250) < 1 && !r.isHeld('FUNC'), demo: [{ tune: 446006250 }],
      },
      {
        title: L('Listen on channel 3', 'Luister op kanaal 3'), target: ['DIAL'], gesture: 'rotate', tip: TIP_DIAL,
        body: L('Channel 3 is **446.031 25 MHz**. Tune there and wait: a practice conversation comes on every few seconds.', 'Kanaal 3 is **446,03125 MHz**. Stem daarop af en wacht: om de paar seconden is er een oefengesprek.'),
        check: (r) => Math.abs(r.freq - 446031250) < 1 && r.reception().active, demo: [{ tune: 446031250 }],
      },
      {
        title: L('The 16 channels', 'De 16 kanalen'),
        body: L(
          'PMR446 channels (MHz):\n\n- 1 446.00625 · 2 446.01875 · 3 446.03125 · 4 446.04375\n- 5 446.05625 · 6 446.06875 · 7 446.08125 · 8 446.09375\n- 9 446.10625 · 10 446.11875 · 11 446.13125 · 12 446.14375\n- 13 446.15625 · 14 446.16875 · 15 446.18125 · 16 446.19375\n\nMany sets use "privacy codes" (CTCSS tones). They don\'t make a conversation private; they only stop a radio from hearing others. With tone squelch off, the default, the IC-R5 hears everyone on the channel.',
          'PMR446-kanalen (MHz):\n\n- 1 446.00625 · 2 446.01875 · 3 446.03125 · 4 446.04375\n- 5 446.05625 · 6 446.06875 · 7 446.08125 · 8 446.09375\n- 9 446.10625 · 10 446.11875 · 11 446.13125 · 12 446.14375\n- 13 446.15625 · 14 446.16875 · 15 446.18125 · 16 446.19375\n\nVeel toestellen gebruiken "privacycodes" (CTCSS-tonen). Die maken een gesprek niet privé; ze zorgen er alleen voor dat een toestel anderen niet hoort. Met de toonsquelch uit, de standaard, hoort de IC-R5 iedereen op het kanaal.',
        ),
      },
      {
        title: L('CB on 27 MHz', 'CB op 27 MHz'),
        body: L(
          '**CB** (citizens band) has 40 channels from 26.965 to 27.405 MHz, 10 kHz apart with a few historic gaps. Most CB talk in Europe is FM; channel 19 (27.185 MHz) is a popular calling channel.',
          '**CB** (citizens band) heeft 40 kanalen van 26,965 tot 27,405 MHz, 10 kHz uit elkaar met enkele historische gaten. In Europa is de meeste CB-babbel in FM; kanaal 19 (27,185 MHz) is een populair aanroepkanaal.',
        ),
      },
      {
        title: L('Go to the HF band', 'Ga naar de HF-band'), target: ['BAND'], gesture: 'press', view: 'front',
        body: L('Press {BAND} until the **HF** band (it starts at 5.000 MHz in AM).', 'Druk op {BAND} tot de **HF**-band (die start op 5.000 MHz in AM).'),
        check: (r) => r.bandId === 'HF', demo: [{ band: 'HF' }],
      },
      {
        title: L('Channel 19 in FM', 'Kanaal 19 in FM'), target: ['FUNC', 'DIAL', 'MODE'], gesture: 'rotate', view: 'angle', tip: TIP_FUNC,
        body: L('Use {FUNC} + {DIAL} to get to 27 MHz, the dial alone to **27.185**, and press {MODE} until **FM**.', 'Gebruik {FUNC} + {DIAL} om naar 27 MHz te gaan, de knop alleen voor **27.185**, en druk op {MODE} tot **FM**.'),
        check: (r) => at(r, 27.185) && r.mode === 'FM', demo: [{ tune: MHz(27.185) }, { mode: 'FM' }],
      },
    ],
    outro: L('Next: radio amateurs and the International Space Station.', 'Hierna: radioamateurs en het internationale ruimtestation.'),
  },

  {
    slug: 'amateurs-and-iss',
    icon: 'i-lucide-satellite',
    minutes: 6,
    title: L('Radio amateurs and the ISS', 'Radioamateurs en het ISS'),
    summary: L('The 2 m band, repeaters and the space station\'s downlink.', 'De 2m-band, relais en de verbinding van het ruimtestation.'),
    intro: L(
      '**Radio amateurs** are licensed hobbyists who talk across town and around the world, and anyone may listen to them. In Belgium their association is the UBA. The busiest local bands are **2 m** (144–146 MHz) and **70 cm** (430–440 MHz), in FM.',
      '**Radioamateurs** zijn hobbyisten met een vergunning die over de stad en de hele wereld praten, en iedereen mag naar hen luisteren. In België is hun vereniging de UBA. De drukste lokale banden zijn **2 m** (144–146 MHz) en **70 cm** (430–440 MHz), in FM.',
    ),
    setup: () => tuned(MHz(145), 'FM'),
    steps: [
      {
        title: L('The calling channel', 'Het aanroepkanaal'), target: ['DIAL'], gesture: 'rotate', view: 'front', tip: TIP_DIAL,
        body: L('Tune to **145.500 MHz**, the 2 m FM calling channel, and wait for a call.', 'Stem af op **145,500 MHz**, het 2m-FM-aanroepkanaal, en wacht op een oproep.'),
        check: (r) => at(r, 145.5), demo: [{ tune: MHz(145.5) }],
      },
      {
        title: L('Repeaters', 'Relais'),
        body: L(
          '**Repeaters** are automatic stations on towers and hills that retransmit amateurs over a wide area. On 2 m they transmit between 145.600 and 145.7875 MHz and listen 600 kHz lower. Find the ones near you on the [UBA list](https://www.uba.be/en/node/2057) or RepeaterBook.',
          '**Relais** (repeaters) zijn automatische stations op torens en heuvels die amateurs over een groot gebied doorzenden. Op 2 m zenden ze tussen 145,600 en 145,7875 MHz en luisteren ze 600 kHz lager. Zoek die in je buurt op de [UBA-lijst](https://www.uba.be/en/node/2057) of RepeaterBook.',
        ),
      },
      {
        title: L('A repeater output', 'Een relaisuitgang'), target: ['DIAL'], gesture: 'rotate', tip: TIP_DIAL,
        body: L('Tune to **145.650 MHz**, a practice repeater output.', 'Stem af op **145,650 MHz**, een oefenrelais.'),
        check: (r) => at(r, 145.65), demo: [{ tune: MHz(145.65) }],
      },
      {
        title: L('The space station', 'Het ruimtestation'),
        body: L(
          'The **International Space Station** carries an amateur station. School contacts (ARISS) and crew members use **145.800 MHz FM**, and there are occasional slow-scan TV (SSTV) events on the same frequency. A pass lasts about 10 minutes: look up the times on a pass predictor such as Heavens-Above or N2YO, and go outside with a clear view of the sky.',
          'Het **internationale ruimtestation** heeft een amateurstation aan boord. Schoolcontacten (ARISS) en bemanningsleden gebruiken **145,800 MHz FM**, en af en toe zijn er SSTV-uitzendingen (beelden) op dezelfde frequentie. Een overgang duurt ongeveer 10 minuten: zoek de tijden op bij een voorspeller zoals Heavens-Above of N2YO, en ga naar buiten met vrij zicht op de lucht.',
        ),
      },
      {
        title: L('Tune to the ISS', 'Stem af op het ISS'), target: ['DIAL'], gesture: 'rotate', tip: TIP_DIAL,
        body: L('Tune to **145.800 MHz**: a practice ISS pass is going on.', 'Stem af op **145,800 MHz**: er is een oefenoverkomst van het ISS bezig.'),
        check: (r) => at(r, 145.8), demo: [{ tune: MHz(145.8) }],
      },
      {
        title: L('Keep it in memory', 'Bewaar het'), target: ['VM', 'DIAL'], gesture: 'hold', tip: TIP_HOLD,
        body: L('Store it in memory channel **010**, ready for the next pass: hold {VM}, turn to 010, hold {VM}.', 'Bewaar het in geheugenkanaal **010**, klaar voor de volgende overkomst: houd {VM} in, draai naar 010, houd {VM} in.'),
        check: (r) => !!r.state.mem[10] && Math.abs(r.state.mem[10]!.freq - MHz(145.8)) < 1,
        demo: [{ hold: 'VM', ms: 1200 }, { writeCh: 10 }, { hold: 'VM', ms: 1200 }],
      },
    ],
    outro: L(
      'The station moves fast, so its frequency shifts a few kHz (Doppler). FM usually covers it; if the sound distorts at the start or end of a pass, try 145.805 or 145.795 MHz. Next: better reception.',
      'Het station beweegt snel, dus de frequentie verschuift enkele kHz (Doppler). FM vangt dat meestal op; vervormt het geluid aan het begin of einde van een overkomst, probeer dan 145,805 of 145,795 MHz. Hierna: betere ontvangst.',
    ),
  },

  {
    slug: 'better-reception',
    icon: 'i-lucide-signal',
    minutes: 8,
    title: L('Better reception', 'Betere ontvangst'),
    summary: L('Antennas, the built-in bar antenna, the attenuator and shortwave.', 'Antennes, de ingebouwde ferrietantenne, de verzwakker en kortegolf.'),
    intro: L(
      'The antenna matters more than anything else. The stock antenna is a compromise for VHF and UHF. Indoors, go near a window or upstairs; outdoors, hold the radio up and away from your body. A longer telescopic or outdoor antenna fits the SMA connector (antennas with a BNC plug need an AD-92SMA adapter).',
      'De antenne is belangrijker dan wat ook. De standaardantenne is een compromis voor VHF en UHF. Binnen ga je bij een raam of naar boven; buiten hou je de radio omhoog en weg van je lichaam. Een langere telescoop- of buitenantenne past op de SMA-aansluiting (antennes met een BNC-stekker hebben een AD-92SMA-adapter nodig).',
    ),
    setup: () => tuned(kHz(531), 'AM'),
    steps: [
      {
        title: L('The bar antenna', 'De ferrietantenne'),
        body: L(
          'For **AM broadcast** (medium wave, 0.495–1.620 MHz) the IC-R5 has a built-in **bar antenna**, much better than the short rubber antenna at these low frequencies. You switch to it in set mode, from the AM broadcast band.',
          'Voor **AM-omroep** (middengolf, 0,495–1,620 MHz) heeft de IC-R5 een ingebouwde **ferrietantenne**, veel beter dan de korte rubberen antenne op deze lage frequenties. Je schakelt ze in via de instelmodus, vanuit de AM-omroepband.',
        ),
      },
      {
        title: L('Enter set mode', 'Open de instelmodus'), target: ['TS'], gesture: 'hold', view: 'front', tip: TIP_HOLD,
        body: L('Hold {TS} for 1 second to enter **set mode**.', 'Houd {TS} 1 seconde in om de **instelmodus** te openen.'),
        check: (r) => r.state.screen === 'set', demo: [{ hold: 'TS', ms: 1200 }],
      },
      {
        title: L('Find ANT', 'Zoek ANT'), target: ['DIAL'], gesture: 'rotate', view: 'angle', tip: TIP_DIAL,
        body: L('Turn {DIAL} to the **ANT** item. The name shows for a second, then its value (EXT) with **An**.', 'Draai {DIAL} naar het item **ANT**. De naam verschijnt een seconde, daarna de waarde (EXT) met **An**.'),
        check: (r) => r.state.screen === 'set' && r.visibleSetItems()[r.state.setItem]?.id === 'ant',
        demo: [{ set: 'ant', value: undefined }],
      },
      {
        title: L('Choose BAR', 'Kies BAR'), target: ['FUNC', 'DIAL'], gesture: 'rotate', view: 'leftTop', tip: TIP_FUNC,
        body: L('Hold {FUNC} and turn {DIAL} to **BAR**.', 'Houd {FUNC} in en draai {DIAL} naar **BAR**.'),
        check: (r) => r.state.set.antAm === 'BAR', demo: [{ set: 'ant', value: 'BAR' }],
      },
      {
        title: L('Leave set mode', 'Verlaat de instelmodus'), target: ['TS'], gesture: 'press', view: 'front',
        body: L('Let go of {FUNC} and press {TS} to leave set mode.', 'Laat {FUNC} los en druk op {TS} om de instelmodus te verlaten.'),
        check: (r) => r.state.screen === 'normal' && r.state.set.antAm === 'BAR', demo: [{ press: 'TS' }],
      },
      {
        title: L('A distant AM station', 'Een verre AM-zender'), target: ['DIAL'], gesture: 'rotate', tip: TIP_DIAL,
        body: L(
          'Belgium\'s own AM stations have closed, but at night you\'ll hear stations from abroad. Tune to the practice signal on **1008 kHz** (1.008 MHz). The bar antenna is directional: in real life, turn the radio for the best sound.',
          'De Belgische AM-zenders zijn gestopt, maar \'s nachts hoor je zenders uit het buitenland. Stem af op het oefensignaal op **1008 kHz** (1,008 MHz). De ferrietantenne is richtinggevoelig: draai in het echt de radio voor het beste geluid.',
        ),
        check: (r) => at(r, 1.008), demo: [{ tune: kHz(1008) }],
      },
      {
        title: L('The attenuator', 'De verzwakker'), target: ['FUNC', 'SQL'], gesture: 'press', view: 'left', tip: TIP_FUNC,
        body: L(
          'Near a strong transmitter the receiver can overload, and you hear stations where they don\'t belong. The **attenuator** weakens all signals. Hold {FUNC} and press {SQL} to switch it on: **ATT** appears.',
          'Dicht bij een sterke zender kan de ontvanger overstuurd raken en hoor je zenders waar ze niet horen. De **verzwakker** maakt alle signalen zwakker. Houd {FUNC} in en druk op {SQL} om hem aan te zetten: **ATT** verschijnt.',
        ),
        check: (r) => r.state.att, demo: [{ down: 'FUNC' }, { wait: 200 }, { press: 'SQL' }, { wait: 200 }, { up: 'FUNC' }],
      },
      {
        title: L('Attenuator off', 'Verzwakker uit'), target: ['FUNC', 'SQL'], gesture: 'press', tip: TIP_FUNC,
        body: L('Switch it off again with {FUNC} + {SQL}. Leave it off unless you need it: it also weakens the signals you want.', 'Zet hem weer uit met {FUNC} + {SQL}. Laat hem uit tenzij je hem nodig hebt: hij verzwakt ook de signalen die je wilt.'),
        check: (r) => !r.state.att, demo: [{ down: 'FUNC' }, { wait: 200 }, { press: 'SQL' }, { wait: 200 }, { up: 'FUNC' }],
      },
      {
        title: L('Shortwave', 'Kortegolf'), target: ['BAND', 'DIAL'], gesture: 'press', view: 'front', tip: TIP_FUNC,
        body: L(
          '**Shortwave** carries international broadcasters in AM, best in the evening: around 5.9–6.2 MHz (49 m band), 7.2–7.45 MHz (41 m) and 9.4–9.9 MHz (31 m). A few metres of wire on the antenna helps a lot. Press {BAND} to the HF band and tune to the practice signal on **6.070 MHz**.',
          '**Kortegolf** brengt internationale omroepen in AM, het best \'s avonds: rond 5,9–6,2 MHz (49m-band), 7,2–7,45 MHz (41 m) en 9,4–9,9 MHz (31 m). Een paar meter draad aan de antenne helpt veel. Druk op {BAND} tot de HF-band en stem af op het oefensignaal op **6,070 MHz**.',
        ),
        check: (r) => at(r, 6.07) && r.mode === 'AM', demo: [{ band: 'HF' }, { tune: kHz(6070) }],
      },
    ],
    outro: L('Next, the last lesson: key lock, settings and resets.', 'Hierna de laatste les: toetsvergrendeling, instellingen en resets.'),
  },

  {
    slug: 'lock-and-settings',
    icon: 'i-lucide-settings-2',
    minutes: 7,
    title: L('Lock, settings and reset', 'Vergrendeling, instellingen en reset'),
    summary: L('Key lock, set mode, the VOL swap and both resets.', 'Toetsvergrendeling, instelmodus, de VOL-wissel en beide resets.'),
    intro: L('A few things that save you from confusion later.', 'Enkele dingen die je later verwarring besparen.'),
    setup: () => tuned(MHz(100.6), 'WFM'),
    steps: [
      {
        title: L('Lock the keys', 'Vergrendel de toetsen'), target: ['FUNC', 'BAND'], gesture: 'hold', view: 'angle', tip: TIP_FUNC,
        body: L('**Key lock** prevents accidental changes in your pocket. Hold {FUNC} and hold {BAND} for 1 second. The padlock icon appears.', '**Toetsvergrendeling** voorkomt per ongeluk wijzigen in je zak. Houd {FUNC} in en houd {BAND} 1 seconde in. Het hangslot verschijnt.'),
        check: (r) => r.state.lock, demo: [{ down: 'FUNC' }, { wait: 200 }, { hold: 'BAND', ms: 1200 }, { up: 'FUNC' }],
      },
      {
        title: L('Locked', 'Vergrendeld'), target: ['DIAL'],
        body: L('While locked, only the volume keys, {SQL} and {PWR} work (set mode can change that). Try the dial: nothing happens.', 'Vergrendeld werken alleen de volumetoetsen, {SQL} en {PWR} (dat kun je wijzigen in de instelmodus). Probeer de knop: er gebeurt niets.'),
      },
      {
        title: L('Unlock', 'Ontgrendel'), target: ['FUNC', 'BAND'], gesture: 'hold', tip: TIP_FUNC,
        body: L('Unlock the same way: {FUNC} + hold {BAND}.', 'Ontgrendel op dezelfde manier: {FUNC} + {BAND} inhouden.'),
        check: (r) => !r.state.lock, demo: [{ down: 'FUNC' }, { wait: 200 }, { hold: 'BAND', ms: 1200 }, { up: 'FUNC' }],
      },
      {
        title: L('Set mode', 'De instelmodus'),
        body: L(
          '**Set mode** holds the settings you rarely change: hold {TS} for 1 second, turn {DIAL} to choose an item, hold {FUNC} and turn {DIAL} to change it, press {TS} to leave.\n\nItems include the dial-select step (D SEL), priority watch, key beep, backlight, power save and **EXPAND**, which reveals more: auto power-off, scan pause and resume timers, the monitor key behaviour and the LCD contrast. (The simulator\'s item names are close to the real ones, but not always exact.)',
          'De **instelmodus** bevat instellingen die je zelden wijzigt: houd {TS} 1 seconde in, draai {DIAL} om een item te kiezen, houd {FUNC} in en draai {DIAL} om het te wijzigen, druk op {TS} om te verlaten.\n\nEr zijn onder meer de stap voor snel afstemmen (D SEL), prioriteitsbewaking, toetspiep, verlichting, energiebesparing en **EXPAND**, dat meer toont: automatisch uitschakelen, pauze- en hervattimers voor de scan, het gedrag van de monitortoets en het LCD-contrast. (De itemnamen in de simulator lijken op de echte, maar zijn niet altijd exact.)',
        ),
      },
      {
        title: L('Backlight always on', 'Verlichting altijd aan'), target: ['TS', 'FUNC', 'DIAL'], gesture: 'hold', view: 'angle', tip: TIP_FUNC,
        body: L('Make the backlight stay on: enter set mode, go to **LIGHT**, choose **ON** with {FUNC} + {DIAL}, then leave with {TS}.', 'Laat de verlichting aan: open de instelmodus, ga naar **LIGHT**, kies **ON** met {FUNC} + {DIAL} en verlaat met {TS}.'),
        check: (r) => r.state.set.light === 'ON' && r.state.screen === 'normal',
        demo: [{ hold: 'TS', ms: 1200 }, { set: 'light', value: 'ON' }, { press: 'TS' }],
      },
      {
        title: L('The VOL swap', 'De VOL-wissel'), target: ['FUNC', 'TS'], gesture: 'press', tip: TIP_FUNC,
        body: L(
          'If the dial ever changes the volume and the arrow keys tune instead, someone pressed {FUNC} + {TS}: it swaps them and shows **VOL**. Try it: hold {FUNC} and press {TS}.',
          'Verandert de knop ooit het volume en stemmen de pijltjestoetsen af, dan drukte iemand op {FUNC} + {TS}: dat wisselt ze om en toont **VOL**. Probeer het: houd {FUNC} in en druk op {TS}.',
        ),
        check: (r) => r.state.dialVol, demo: [{ down: 'FUNC' }, { wait: 200 }, { press: 'TS' }, { wait: 200 }, { up: 'FUNC' }],
      },
      {
        title: L('Swap back', 'Wissel terug'), target: ['FUNC', 'TS'], gesture: 'press', tip: TIP_FUNC,
        body: L('Swap back with {FUNC} + {TS}.', 'Wissel terug met {FUNC} + {TS}.'),
        check: (r) => !r.state.dialVol, demo: [{ down: 'FUNC' }, { wait: 200 }, { press: 'TS' }, { wait: 200 }, { up: 'FUNC' }],
      },
      {
        title: L('Two resets', 'Twee resets'),
        body: L(
          '- **Partial reset**: hold {FUNC} and {TS} while switching on. Restores the VFO and the settings; your memories stay.\n- **All reset**: hold {FUNC} and {VM} while switching on. Clears **everything**, memories included.',
          '- **Gedeeltelijke reset**: houd {FUNC} en {TS} in terwijl je aanzet. Herstelt de VFO en de instellingen; je geheugens blijven.\n- **Volledige reset**: houd {FUNC} en {VM} in terwijl je aanzet. Wist **alles**, ook de geheugens.',
        ),
      },
      {
        title: L('Do a partial reset', 'Doe een gedeeltelijke reset'), target: ['FUNC', 'TS', 'PWR'], gesture: 'hold', view: 'angle',
        tip: L(
          'With a mouse: while the radio is off, a click on {FUNC} or {TS} keeps that key held (it glows). Then hold {PWR}.',
          'Met een muis: terwijl de radio uit staat, blijft een toets ingedrukt (ze licht op) als je op {FUNC} of {TS} klikt. Houd dan {PWR} in.',
        ),
        body: L('Switch off with {PWR}. Then hold {FUNC} and {TS}, and hold {PWR} until the radio comes back on.', 'Zet uit met {PWR}. Houd dan {FUNC} en {TS} in, en houd {PWR} in tot de radio weer aangaat.'),
        check: (r, e) => e?.type === 'reset' && e.kind === 'partial',
        demo: [{ hold: 'PWR', ms: 1200 }, { wait: 500 }, { down: 'FUNC' }, { down: 'TS' }, { wait: 300 }, { hold: 'PWR', ms: 1200 }, { up: 'TS' }, { up: 'FUNC' }],
      },
    ],
    outro: L(
      'You\'ve finished the course! Keep practising in Free play, and see the frequency guide for what to listen to next.',
      'Je hebt de cursus afgewerkt! Oefen verder in Vrij spelen, en bekijk de frequentiegids voor wat je hierna kunt beluisteren.',
    ),
  },
];

export const lessonBySlug = (slug: string) => LESSONS.find((l) => l.slug === slug);
export { BANDS, setIndex };
