<script setup lang="ts">
import { CB, PMR446 } from '~/radio/bands';

definePageMeta({ validate: (route) => !route.params.lang || route.params.lang === 'nl' });
const { t, to } = useLang();
usePageSeo({
  path: '/frequencies',
  title: () => t({ en: 'Frequency guide for Belgium · IC-R5 radio lessons', nl: 'Frequentiegids voor België · IC-R5-radiolessen' }),
  description: () => t({
    en: 'What you may listen to in Belgium with a receiver: VRT FM frequencies per region, PMR446 and CB channels, radio amateurs, the ISS and shortwave bands.',
    nl: 'Waar je in België met een ontvanger naar mag luisteren: VRT-FM-frequenties per regio, PMR446- en CB-kanalen, radioamateurs, het ISS en kortegolfbanden.',
  }),
});

const play = (mhz: number, mode: string) => `${to('/play')}?f=${Math.round(mhz * 1e6)}&m=${mode}`;

// VRT's published FM frequencies (vrt.be, "FM-antenne").
const STATIONS = ['Radio 1', 'Radio 2', 'Klara', 'Studio Brussel', 'MNM'] as const;
const FM: { region: string; f: (number | null)[] }[] = [
  { region: 'Antwerpen', f: [94.2, 97.5, 96.4, 100.9, 89.0] },
  { region: 'Vlaams-Brabant', f: [91.7, 93.7, 89.5, 100.6, 97.0] },
  { region: 'Brussel', f: [null, null, null, null, 88.3] },
  { region: 'Leuven', f: [98.5, 88.7, null, 88.0, 94.8] },
  { region: 'Diest', f: [null, 92.4, null, null, null] },
  { region: 'Limburg', f: [99.9, 97.9, 89.9, 101.4, 102.0] },
  { region: 'Noord-Limburg', f: [null, null, null, null, 93.0] },
  { region: 'Oost-Vlaanderen', f: [95.7, 98.6, 92.0, 102.1, 101.5] },
  { region: 'Gent', f: [null, null, null, 94.5, null] },
  { region: 'Dendermonde, Aalst, Temse', f: [null, 90.7, null, null, null] },
  { region: 'Waasland', f: [null, 89.8, null, null, null] },
  { region: 'West-Vlaanderen', f: [95.7, 100.1, 90.4, 102.1, 101.5] },
];

const AMATEUR: { f: string; mhz?: number; mode: string; what: { en: string; nl: string } }[] = [
  { f: '144–146', mode: 'FM/SSB', what: { en: '2 m band', nl: '2m-band' } },
  { f: '145.500', mhz: 145.5, mode: 'FM', what: { en: '2 m FM calling channel', nl: '2m-FM-aanroepkanaal' } },
  { f: '145.600–145.7875', mhz: 145.6, mode: 'FM', what: { en: '2 m repeater outputs (inputs 600 kHz lower)', nl: 'Uitgangen 2m-relais (ingangen 600 kHz lager)' } },
  { f: '145.800', mhz: 145.8, mode: 'FM', what: { en: 'ISS voice downlink and SSTV events', nl: 'ISS-spraak en SSTV-uitzendingen' } },
  { f: '430–440', mode: 'FM', what: { en: '70 cm band', nl: '70cm-band' } },
  { f: '433.500', mhz: 433.5, mode: 'FM', what: { en: '70 cm FM calling channel', nl: '70cm-FM-aanroepkanaal' } },
];

const SHORTWAVE: { band: string; range: string; mhz: number }[] = [
  { band: '49 m', range: '5.900–6.200', mhz: 6.0 },
  { band: '41 m', range: '7.200–7.450', mhz: 7.3 },
  { band: '31 m', range: '9.400–9.900', mhz: 9.5 },
  { band: '25 m', range: '11.600–12.100', mhz: 11.7 },
];
const mhz = (hz: number) => (hz / 1e6).toFixed(5).replace(/0+$/, '');
</script>

<template>
  <main>
    <div class="mx-auto max-w-4xl px-4 py-8">
      <h1 class="font-display text-3xl text-highlighted sm:text-4xl">{{ t({ en: 'Frequency guide for Belgium', nl: 'Frequentiegids voor België' }) }}</h1>
      <p class="mt-3 leading-relaxed text-toned">
        {{ t({ en: 'Everything on this page is free to listen to in Belgium: broadcasting, radio amateurs, CB and PMR446 (BIPT). Click a frequency to try it in the simulator.', nl: 'Alles op deze pagina is in België vrij te beluisteren: omroep, radioamateurs, CB en PMR446 (BIPT). Klik op een frequentie om ze in de simulator te proberen.' }) }}
      </p>

      <section class="mt-8" aria-labelledby="fm">
        <h2 id="fm" class="text-xl font-semibold text-highlighted">{{ t({ en: 'FM broadcast (WFM)', nl: 'FM-omroep (WFM)' }) }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t({ en: 'VRT\'s frequencies per region, in MHz. RTBF and private stations are on many more frequencies: a band scan finds them.', nl: 'De VRT-frequenties per regio, in MHz. RTBF en private zenders zitten op nog veel meer frequenties: een bandscan vindt ze.' }) }}</p>
        <div class="mt-3 overflow-x-auto rounded-lg border border-default">
          <table class="w-full text-sm">
            <thead class="bg-elevated/60 text-left text-xs text-muted">
              <tr><th class="px-3 py-2 font-semibold">{{ t({ en: 'Region', nl: 'Regio' }) }}</th><th v-for="s in STATIONS" :key="s" class="px-3 py-2 font-semibold">{{ s }}</th></tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="row in FM" :key="row.region">
                <th scope="row" class="px-3 py-1.5 text-left font-medium text-highlighted">{{ row.region }}</th>
                <td v-for="(f, i) in row.f" :key="i" class="px-3 py-1.5 tabular-nums">
                  <NuxtLink v-if="f" :to="play(f, 'WFM')" class="text-primary underline-offset-2 hover:underline">{{ f.toFixed(1) }}</NuxtLink>
                  <span v-else class="text-dimmed">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-xs text-muted">{{ t({ en: 'Source:', nl: 'Bron:' }) }} <a href="https://www.vrt.be/nl/ons-aanbod/fm-antenne" target="_blank" rel="noopener" class="underline underline-offset-2">vrt.be</a></p>
      </section>

      <section class="mt-10" aria-labelledby="pmr">
        <h2 id="pmr" class="text-xl font-semibold text-highlighted">PMR446 (FM)</h2>
        <p class="mt-1 text-sm text-muted">{{ t({ en: 'Licence-free walkie-talkies. Set the tuning step to 6.25 kHz to land on these.', nl: 'Vergunningsvrije walkietalkies. Zet de afstemstap op 6,25 kHz om erop uit te komen.' }) }}</p>
        <ol class="mt-3 grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-4">
          <li v-for="(f, i) in PMR446" :key="f" class="flex items-center justify-between rounded-md border border-default px-3 py-1.5">
            <span class="text-muted">{{ t({ en: 'Ch', nl: 'Kan' }) }} {{ i + 1 }}</span>
            <NuxtLink :to="play(f / 1e6, 'FM')" class="tabular-nums text-primary hover:underline">{{ mhz(f) }}</NuxtLink>
          </li>
        </ol>
      </section>

      <section class="mt-10" aria-labelledby="cb">
        <h2 id="cb" class="text-xl font-semibold text-highlighted">CB (27 MHz)</h2>
        <p class="mt-1 text-sm text-muted">{{ t({ en: '40 channels, mostly FM in Europe (AM also used). Channel 19 is a popular calling channel.', nl: '40 kanalen, in Europa vooral FM (AM wordt ook gebruikt). Kanaal 19 is een populair aanroepkanaal.' }) }}</p>
        <ol class="mt-3 grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-4 lg:grid-cols-5">
          <li v-for="(f, i) in CB" :key="i" class="flex items-center justify-between rounded-md border border-default px-3 py-1.5" :class="i === 18 ? 'border-secondary/60' : ''">
            <span class="text-muted">{{ t({ en: 'Ch', nl: 'Kan' }) }} {{ i + 1 }}</span>
            <NuxtLink :to="play(f / 1e6, 'FM')" class="tabular-nums text-primary hover:underline">{{ (f / 1e6).toFixed(3) }}</NuxtLink>
          </li>
        </ol>
      </section>

      <section class="mt-10" aria-labelledby="ham">
        <h2 id="ham" class="text-xl font-semibold text-highlighted">{{ t({ en: 'Radio amateurs and the ISS', nl: 'Radioamateurs en het ISS' }) }}</h2>
        <div class="mt-3 overflow-x-auto rounded-lg border border-default">
          <table class="w-full text-sm">
            <thead class="bg-elevated/60 text-left text-xs text-muted">
              <tr><th class="px-3 py-2 font-semibold">MHz</th><th class="px-3 py-2 font-semibold">{{ t({ en: 'Mode', nl: 'Modus' }) }}</th><th class="px-3 py-2 font-semibold">{{ t({ en: 'What', nl: 'Wat' }) }}</th></tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="row in AMATEUR" :key="row.f">
                <td class="px-3 py-1.5 tabular-nums">
                  <NuxtLink v-if="row.mhz" :to="play(row.mhz, 'FM')" class="text-primary hover:underline">{{ row.f }}</NuxtLink>
                  <span v-else>{{ row.f }}</span>
                </td>
                <td class="px-3 py-1.5 text-muted">{{ row.mode }}</td>
                <td class="px-3 py-1.5 text-toned">{{ t(row.what) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-xs text-muted">
          {{ t({ en: 'Repeaters near you:', nl: 'Relais in je buurt:' }) }} <a href="https://www.uba.be/en/node/2057" target="_blank" rel="noopener" class="underline underline-offset-2">UBA</a> ·
          {{ t({ en: 'ISS pass times:', nl: 'Overkomsten van het ISS:' }) }} <a href="https://www.heavens-above.com/" target="_blank" rel="noopener" class="underline underline-offset-2">Heavens-Above</a>. {{ t({ en: 'The IC-R5 receives FM, not SSB, so it can\'t demodulate the SSB parts of the bands.', nl: 'De IC-R5 ontvangt FM, geen SSB, dus de SSB-delen van de banden kan hij niet demoduleren.' }) }}
        </p>
      </section>

      <section class="mt-10" aria-labelledby="am">
        <h2 id="am" class="text-xl font-semibold text-highlighted">{{ t({ en: 'Medium wave and shortwave (AM)', nl: 'Middengolf en kortegolf (AM)' }) }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t({ en: 'Medium wave in Europe runs from 531 to 1602 kHz on a 9 kHz grid; use the bar antenna (lesson 12). International broadcasters on shortwave, best in the evening:', nl: 'Middengolf loopt in Europa van 531 tot 1602 kHz in stappen van 9 kHz; gebruik de ferrietantenne (les 12). Internationale omroepen op kortegolf, het best \'s avonds:' }) }}</p>
        <ul class="mt-3 grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-4">
          <li v-for="b in SHORTWAVE" :key="b.band" class="rounded-md border border-default px-3 py-1.5">
            <span class="font-semibold text-highlighted">{{ b.band }}</span>
            <NuxtLink :to="play(b.mhz, 'AM')" class="block tabular-nums text-primary hover:underline">{{ b.range }}</NuxtLink>
          </li>
        </ul>
      </section>

      <section class="mt-10 rounded-lg border border-default bg-elevated/40 p-4" aria-labelledby="no">
        <h2 id="no" class="text-lg font-semibold text-highlighted">{{ t({ en: 'Not without permission', nl: 'Niet zonder toestemming' }) }}</h2>
        <p class="mt-1 text-sm leading-relaxed text-toned">
          {{ t({ en: 'Aviation (around 108–137 MHz), maritime VHF, police and emergency services, cordless and mobile phones and business radio are not meant for you. In Belgium, listening to them needs the user\'s permission. Digital signals (DAB+, TETRA, DMR) can\'t be decoded by the IC-R5 at all.', nl: 'Luchtvaart (rond 108–137 MHz), maritieme VHF, politie en hulpdiensten, draadloze en mobiele telefoons en bedrijfsradio zijn niet voor jou bedoeld. In België heb je de toestemming van de gebruiker nodig om ernaar te luisteren. Digitale signalen (DAB+, TETRA, DMR) kan de IC-R5 helemaal niet decoderen.' }) }}
          <NuxtLink :to="to('/lessons/listening-rules')" class="font-medium text-primary underline underline-offset-2">{{ t({ en: 'Lesson 7 explains why.', nl: 'Les 7 legt uit waarom.' }) }}</NuxtLink>
        </p>
      </section>
    </div>
    <AppFooter />
  </main>
</template>
