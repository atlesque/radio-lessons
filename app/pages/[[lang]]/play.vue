<script setup lang="ts">
import { MHz, STATIONS, type Mode } from '~/radio/bands';
import type { View } from '~/radio/controls';
import { createSession } from '~/radio/session';
import { tuned } from '~/lessons/helpers';

definePageMeta({
  validate: (route) => !route.params.lang || route.params.lang === 'nl',
  // The same radio in both languages: switching language doesn't reset it.
  key: 'play',
  scrollToTop: false,
});
const { t } = useLang();
const route = useRoute();
usePageSeo({
  path: '/play',
  title: () => t({ en: 'Free play · IC-R5 radio simulator', nl: 'Vrij spelen · IC-R5-radiosimulator' }),
  description: () => t({ en: 'Try every key of the Icom IC-R5 on a 3D simulator, with practice signals to find.', nl: 'Probeer elke toets van de Icom IC-R5 op een 3D-simulator, met oefensignalen om te vinden.' }),
});

const session = createSession();
onBeforeUnmount(() => session.dispose());
const view = ref<View>('angle');
onMounted(() => {
  const f = Number(route.query.f);
  const m = String(route.query.m ?? '') as Mode;
  session.radio.load(tuned(f > 0 ? f : MHz(100.6), ['FM', 'WFM', 'AM'].includes(m) ? m : f > 0 ? undefined : 'WFM'));
  if (f > 0) view.value = 'front';
});

function tune(hz: number, mode: Mode) {
  session.input.releaseAll();
  session.radio.jump(hz, mode);
}
const mhz = (hz: number) => (hz / 1e6).toFixed(5).replace(/0+$/, '').replace(/\.$/, '.0');

const sheet: { title: { en: string; nl: string }; rows: [string, { en: string; nl: string }][] }[] = [
  {
    title: { en: 'Basics', nl: 'Basis' },
    rows: [
      ['{PWR} 1 s', { en: 'Power on or off', nl: 'Aan of uit' }],
      ['{UP} / {DOWN}', { en: 'Volume (32 levels)', nl: 'Volume (32 niveaus)' }],
      ['{SQL} + {DIAL}', { en: 'Squelch level: OPEN, AUTO, LEVEL 1–9', nl: 'Squelchniveau: OPEN, AUTO, LEVEL 1–9' }],
      ['{SQL} hold', { en: 'Monitor (listen past the squelch)', nl: 'Monitor (voorbij de squelch luisteren)' }],
      ['{MODE}', { en: 'Receive mode: FM, WFM, AM', nl: 'Ontvangstmodus: FM, WFM, AM' }],
    ],
  },
  {
    title: { en: 'Tuning', nl: 'Afstemmen' },
    rows: [
      ['{BAND}', { en: 'Next band (or {BAND} + {DIAL})', nl: 'Volgende band (of {BAND} + {DIAL})' }],
      ['{DIAL}', { en: 'Tune one step', nl: 'Eén stap afstemmen' }],
      ['{FUNC} + {DIAL}', { en: 'Tune 1 MHz (D SEL: 100 kHz, 1 MHz or 10 MHz)', nl: 'Afstemmen per 1 MHz (D SEL: 100 kHz, 1 MHz of 10 MHz)' }],
      ['{TS}', { en: 'Tuning step: {DIAL} to choose, {TS} to leave', nl: 'Afstemstap: {DIAL} om te kiezen, {TS} om te verlaten' }],
    ],
  },
  {
    title: { en: 'Memory and scan', nl: 'Geheugen en scannen' },
    rows: [
      ['{VM}', { en: 'VFO or memory mode', nl: 'VFO- of geheugenmodus' }],
      ['{VM} 1 s, {DIAL}, {VM} 1 s', { en: 'Store in a memory channel', nl: 'Opslaan in een geheugenkanaal' }],
      ['{FUNC} + {VM}', { en: 'Skip setting: SKIP, P SKIP, off', nl: 'Overslaan: SKIP, P SKIP, uit' }],
      ['{MODE} 1 s', { en: 'VFO: choose ALL or BAND, then {MODE}. Memory: start the scan', nl: 'VFO: kies ALL of BAND, dan {MODE}. Geheugen: start de scan' }],
      ['{MODE}', { en: 'Stop scanning; {DIAL} changes direction', nl: 'Stop met scannen; {DIAL} keert de richting om' }],
    ],
  },
  {
    title: { en: 'Settings', nl: 'Instellingen' },
    rows: [
      ['{TS} 1 s', { en: 'Set mode: {DIAL} item, {FUNC} + {DIAL} value, {TS} leave', nl: 'Instelmodus: {DIAL} item, {FUNC} + {DIAL} waarde, {TS} verlaten' }],
      ['{FUNC} + {BAND} 1 s', { en: 'Key lock', nl: 'Toetsvergrendeling' }],
      ['{FUNC} + {SQL}', { en: 'Attenuator (ATT)', nl: 'Verzwakker (ATT)' }],
      ['{FUNC} + {TS}', { en: 'Swap dial and volume keys (VOL)', nl: 'Knop en volumetoetsen wisselen (VOL)' }],
      ['{FUNC} + {TS} + {PWR}', { en: 'Partial reset (keeps memories)', nl: 'Gedeeltelijke reset (geheugens blijven)' }],
      ['{FUNC} + {VM} + {PWR}', { en: 'All reset (clears memories!)', nl: 'Volledige reset (wist geheugens!)' }],
    ],
  },
];
</script>

<template>
  <main class="lg:grid lg:h-[calc(100dvh-3.5rem-1px)] lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
    <section class="stage sticky top-14 z-30 flex flex-col border-b border-default lg:static lg:min-h-0 lg:overflow-hidden lg:border-b-0">
      <div class="relative h-[40dvh] min-h-[240px] sm:h-[46dvh] lg:h-auto lg:min-h-0 lg:flex-1">
        <ClientOnly>
          <RadioViewer :session="session" :view="view" />
        </ClientOnly>
      </div>
      <ControlPad v-model:view="view" :session="session" />
    </section>
    <aside class="flex flex-col gap-5 border-default p-4 sm:p-5 lg:overflow-y-auto lg:border-l">
      <div>
        <h1 class="font-display text-2xl text-highlighted sm:text-3xl">{{ t({ en: 'Free play', nl: 'Vrij spelen' }) }}</h1>
        <p class="mt-1 text-sm leading-relaxed text-muted">
          {{ t({ en: 'Every key works as in the manual. Jump to a practice signal below, or find them yourself.', nl: 'Elke toets werkt zoals in de handleiding. Spring naar een oefensignaal hieronder, of zoek ze zelf.' }) }}
        </p>
      </div>
      <section>
        <h2 class="text-sm font-semibold text-highlighted">{{ t({ en: 'Signals in the simulator', nl: 'Signalen in de simulator' }) }}</h2>
        <ul class="mt-2 divide-y divide-default rounded-lg border border-default">
          <li v-for="s in STATIONS" :key="s.id" class="flex items-center gap-3 px-3 py-2 text-sm">
            <span class="w-20 shrink-0 tabular-nums font-semibold text-highlighted">{{ mhz(s.f) }}</span>
            <span class="min-w-0 flex-1 text-muted">{{ t(s.label) }} <span class="text-dimmed">· {{ s.mode }}</span></span>
            <UButton size="xs" color="neutral" variant="outline" :label="t({ en: 'Tune', nl: 'Afstemmen' })" @click="tune(s.f, s.mode)" />
          </li>
        </ul>
      </section>
      <section v-for="g in sheet" :key="g.title.en">
        <h2 class="text-sm font-semibold text-highlighted">{{ t(g.title) }}</h2>
        <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <template v-for="row in g.rows" :key="row[0]">
            <dt class="whitespace-nowrap"><RichText :text="row[0]" /></dt>
            <dd class="text-muted"><RichText :text="t(row[1])" /></dd>
          </template>
        </dl>
      </section>
      <p class="text-xs text-muted">
        {{ t({ en: 'Keyboard: P power · ↑ ↓ volume · ← → dial · F FUNC · S SQL · B BAND · T TS · M MODE · V V/M.', nl: 'Toetsenbord: P aan/uit · ↑ ↓ volume · ← → knop · F FUNC · S SQL · B BAND · T TS · M MODE · V V/M.' }) }}
      </p>
    </aside>
  </main>
</template>
