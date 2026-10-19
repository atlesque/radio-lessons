<script setup lang="ts">
// The privacy policy (GDPR art. 13). It describes what worker/index.ts, migrations/ and the browser code
// actually store; change it together with them.
import type { L } from '~/radio/bands';

definePageMeta({ validate: (route) => !route.params.lang || route.params.lang === 'nl' });
const { t, to } = useLang();
usePageSeo({
  path: '/privacy',
  title: () => t({ en: 'Privacy policy · IC-R5 radio lessons', nl: 'Privacybeleid · IC-R5-radiolessen' }),
  description: () => t({
    en: 'What the radio lessons store about you, why, where, for how long, and how to see or delete it.',
    nl: 'Wat de radiolessen over je bewaren, waarom, waar, hoe lang, en hoe je het inkijkt of verwijdert.',
  }),
});

// TODO before publishing: fill in who is responsible for the data (the controller) and how to reach them.
const CONTROLLER = { name: '[Name of the controller]', address: '[Postal address]', email: '[privacy contact email]' };
const UPDATED: L = { en: '19 October 2026', nl: '19 oktober 2026' };

interface Section { title: L; paragraphs?: L[]; items?: L[] }

const SECTIONS: Section[] = [
  {
    title: { en: 'Who is responsible', nl: 'Wie is verantwoordelijk' },
    paragraphs: [{
      en: `The controller of your personal data is ${CONTROLLER.name}, ${CONTROLLER.address}. For anything about your data, email ${CONTROLLER.email}.`,
      nl: `De verwerkingsverantwoordelijke voor je persoonsgegevens is ${CONTROLLER.name}, ${CONTROLLER.address}. Voor alles over je gegevens mail je naar ${CONTROLLER.email}.`,
    }],
  },
  {
    title: { en: 'Without an account', nl: 'Zonder account' },
    paragraphs: [
      {
        en: 'You can use every lesson without an account. Your progress (which lessons you finished, where you left off, and the radio\'s settings at that step) and your light or dark theme are kept in your own browser (localStorage). They never leave your device unless you sign in, and you can clear them with your browser\'s site data.',
        nl: 'Je kunt elke les zonder account volgen. Je voortgang (welke lessen klaar zijn, waar je gebleven was en de instellingen van de radio op die stap) en je licht of donker thema blijven in je eigen browser (localStorage). Ze verlaten je toestel niet tenzij je je aanmeldt, en je wist ze met de sitegegevens van je browser.',
      },
      {
        en: 'We don\'t use advertising, tracking cookies or third-party trackers. Fonts and all other files are served from this site itself.',
        nl: 'We gebruiken geen advertenties, trackingcookies of trackers van derden. Lettertypes en alle andere bestanden komen van deze site zelf.',
      },
    ],
  },
  {
    title: { en: 'What we store when you have an account', nl: 'Wat we bewaren als je een account hebt' },
    items: [
      {
        en: 'Your email address, the date your account was created and the time you last signed in. Needed to sign you in and to know which progress is yours.',
        nl: 'Je e-mailadres, de datum waarop je account werd aangemaakt en het tijdstip van je laatste aanmelding. Nodig om je aan te melden en om te weten welke voortgang van jou is.',
      },
      {
        en: 'Your lesson progress, the same data as in your browser, so it follows you to your other devices.',
        nl: 'Je voortgang in de lessen, dezelfde gegevens als in je browser, zodat je ze op je andere toestellen hebt.',
      },
      {
        en: 'Sign-in links: when you request one we store a hash of the link\'s code, your email address, a hash of your IP address, the page to return to and the time. The link works once, for 15 minutes. The IP hash is only used to limit how many links can be requested (10 per hour per IP address, 3 per email address).',
        nl: 'Aanmeldlinks: als je er een aanvraagt, bewaren we een hash van de code in de link, je e-mailadres, een hash van je IP-adres, de pagina om naar terug te keren en het tijdstip. De link werkt één keer, 15 minuten lang. De IP-hash dient alleen om te beperken hoeveel links er aangevraagd kunnen worden (10 per uur per IP-adres, 3 per e-mailadres).',
      },
      {
        en: 'Sessions: one cookie (rl_session) keeps you signed in. It is strictly necessary for signing in, so it needs no consent. We only store a hash of its value, with the date it expires.',
        nl: 'Sessies: één cookie (rl_session) houdt je aangemeld. Hij is strikt noodzakelijk om aan te melden, dus er is geen toestemming voor nodig. We bewaren alleen een hash van de waarde, met de vervaldatum.',
      },
    ],
  },
  {
    title: { en: 'Why, and on what legal basis', nl: 'Waarom, en op welke rechtsgrond' },
    items: [
      {
        en: 'Your account, sign-in and saved progress: to provide the service you ask for when you sign in (GDPR art. 6(1)(b), performance of a contract).',
        nl: 'Je account, aanmelding en opgeslagen voortgang: om de dienst te leveren waar je om vraagt als je je aanmeldt (AVG art. 6(1)(b), uitvoering van een overeenkomst).',
      },
      {
        en: 'Limits on sign-in links, short-lived server logs and anonymous visit statistics: to keep the site secure, prevent abuse and see how it\'s used (art. 6(1)(f), legitimate interest).',
        nl: 'Limieten op aanmeldlinks, kortlevende serverlogs en anonieme bezoekersstatistieken: om de site veilig te houden, misbruik te voorkomen en te zien hoe ze gebruikt wordt (art. 6(1)(f), gerechtvaardigd belang).',
      },
    ],
    paragraphs: [{
      en: 'We only email you sign-in links you asked for. No newsletters, no marketing, and we never sell or share your data.',
      nl: 'We mailen je alleen aanmeldlinks die je zelf aanvroeg. Geen nieuwsbrieven, geen marketing, en we verkopen of delen je gegevens nooit.',
    }],
  },
  {
    title: { en: 'Who processes it, and where', nl: 'Wie het verwerkt, en waar' },
    paragraphs: [
      {
        en: 'The site runs on Cloudflare (Cloudflare, Inc. and Cloudflare Ltd.), our processor under its Data Processing Addendum. Account data is stored in a Cloudflare D1 database restricted to the European Union. Sign-in emails are sent through Cloudflare Email Sending. Cloudflare\'s network handles requests in the data centre closest to you, and Cloudflare may process data in the United States under the EU-US Data Privacy Framework and the EU Standard Contractual Clauses.',
        nl: 'De site draait op Cloudflare (Cloudflare, Inc. en Cloudflare Ltd.), onze verwerker volgens zijn verwerkersovereenkomst (Data Processing Addendum). Accountgegevens staan in een Cloudflare D1-databank die beperkt is tot de Europese Unie. Aanmeldmails worden verstuurd via Cloudflare Email Sending. Het netwerk van Cloudflare behandelt verzoeken in het datacenter het dichtst bij jou, en Cloudflare kan gegevens verwerken in de Verenigde Staten onder het EU-VS-gegevensprivacykader en de modelcontractbepalingen van de EU.',
      },
      {
        en: 'Visit statistics come from Cloudflare Web Analytics, which sets no cookies and stores nothing on your device. It counts page views with the page address, referrer, browser and country, without identifying you.',
        nl: 'Bezoekersstatistieken komen van Cloudflare Web Analytics, dat geen cookies plaatst en niets op je toestel bewaart. Het telt paginaweergaven met het paginaadres, de verwijzende site, de browser en het land, zonder je te identificeren.',
      },
    ],
  },
  {
    title: { en: 'How long we keep it', nl: 'Hoe lang we het bewaren' },
    items: [
      { en: 'Account and progress: until you delete your account.', nl: 'Account en voortgang: tot je je account verwijdert.' },
      { en: 'Sign-in links: removed 24 hours after they were requested.', nl: 'Aanmeldlinks: verwijderd 24 uur nadat ze aangevraagd werden.' },
      { en: 'Sessions: 90 days, or until you sign out.', nl: 'Sessies: 90 dagen, of tot je je afmeldt.' },
      { en: 'Server logs (errors and request details, which can include your IP address): a few days, then deleted by Cloudflare.', nl: 'Serverlogs (fouten en verzoekgegevens, waaronder mogelijk je IP-adres): enkele dagen, daarna verwijderd door Cloudflare.' },
    ],
  },
  {
    title: { en: 'Your rights', nl: 'Je rechten' },
    paragraphs: [
      {
        en: 'You have the right to access, correct, delete and take a copy of your data, to restrict or object to its processing, and to complain to a supervisory authority. In Account settings you can download your data and delete your account yourself: deletion removes your email address, your progress, your sessions and your sign-in links straight away. For anything else, email us and we\'ll answer within one month.',
        nl: 'Je hebt het recht op inzage, verbetering, verwijdering en een kopie van je gegevens, om de verwerking te beperken of er bezwaar tegen te maken, en om klacht in te dienen bij een toezichthouder. In Accountinstellingen download je je gegevens en verwijder je zelf je account: dat wist meteen je e-mailadres, je voortgang, je sessies en je aanmeldlinks. Voor al het andere mail je ons en we antwoorden binnen een maand.',
      },
      {
        en: 'In Belgium the supervisory authority is the Data Protection Authority (Gegevensbeschermingsautoriteit), Drukpersstraat 35, 1000 Brussels, dataprotectionauthority.be.',
        nl: 'In België is de toezichthouder de Gegevensbeschermingsautoriteit, Drukpersstraat 35, 1000 Brussel, gegevensbeschermingsautoriteit.be.',
      },
    ],
  },
  {
    title: { en: 'Changes', nl: 'Wijzigingen' },
    paragraphs: [{
      en: 'If we change what we store or why, we update this page and its date.',
      nl: 'Als we veranderen wat we bewaren of waarom, passen we deze pagina en haar datum aan.',
    }],
  },
];
</script>

<template>
  <main>
    <div class="mx-auto max-w-3xl px-4 py-8">
      <h1 class="font-display text-3xl text-highlighted sm:text-4xl">{{ t({ en: 'Privacy policy', nl: 'Privacybeleid' }) }}</h1>
      <p class="mt-2 text-sm text-muted">{{ t({ en: 'Last updated', nl: 'Laatst bijgewerkt' }) }}: {{ t(UPDATED) }}</p>
      <p class="mt-4 leading-relaxed text-toned">
        {{ t({ en: 'This page explains what personal data the radio lessons process, why, where and for how long, and how you can see or delete it. The short version: without an account nothing about you leaves your browser; with an account we keep your email address and your progress, and you can delete both at any time.', nl: 'Deze pagina legt uit welke persoonsgegevens de radiolessen verwerken, waarom, waar en hoe lang, en hoe je ze inkijkt of verwijdert. Kort gezegd: zonder account verlaat niets over jou je browser; met een account bewaren we je e-mailadres en je voortgang, en je kunt beide altijd verwijderen.' }) }}
      </p>
      <section v-for="(s, i) in SECTIONS" :key="i" class="mt-8">
        <h2 class="font-display text-xl text-highlighted">{{ t(s.title) }}</h2>
        <ul v-if="s.items" class="mt-3 list-disc space-y-2 ps-5 leading-relaxed text-toned">
          <li v-for="(item, j) in s.items" :key="j">{{ t(item) }}</li>
        </ul>
        <p v-for="(p, j) in s.paragraphs" :key="j" class="mt-3 leading-relaxed text-toned">{{ t(p) }}</p>
      </section>
      <p class="mt-8 text-sm text-muted">
        <NuxtLink :to="to('/account')" class="text-primary underline underline-offset-2">{{ t({ en: 'Account settings', nl: 'Accountinstellingen' }) }}</NuxtLink>
      </p>
    </div>
    <AppFooter />
  </main>
</template>
