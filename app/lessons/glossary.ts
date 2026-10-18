// Plain-language explanations of the acronyms and technical words in the lessons, for people who have
// never used a radio. RichText underlines the first use of each term in a block; clicking explains it.
// `en`/`nl` list the exact spellings to match (case matters, so "BAND" on the display isn't "band").
// Lower-case words also match with a capital first letter.

import type { L } from '~/radio/bands';

export interface GlossaryEntry {
  id: string;
  en: string[];
  nl: string[];
  title: L;
  text: L;
  /** Lesson that covers it in depth. */
  lesson?: string;
}

const L = (en: string, nl: string): L => ({ en, nl });

export const GLOSSARY: GlossaryEntry[] = [
  // ---------- the basics ----------
  {
    id: 'frequency', en: ['frequency', 'frequencies'], nl: ['frequentie', 'frequenties'], lesson: 'bands-and-tuning',
    title: L('Frequency', 'Frequentie'),
    text: L(
      'Where on the dial a signal is. Every transmitter sends on its own frequency, a bit like a house number; tune the radio to that number and you hear it. Frequencies are counted in hertz: MHz or kHz.',
      'Waar op de schaal een signaal zit. Elke zender zendt op zijn eigen frequentie, een beetje zoals een huisnummer; stem de radio af op dat nummer en je hoort hem. Frequenties tel je in hertz: MHz of kHz.',
    ),
  },
  {
    id: 'mhz', en: ['MHz', 'megahertz'], nl: ['MHz', 'megahertz'], lesson: 'bands-and-tuning',
    title: L('MHz (megahertz)', 'MHz (megahertz)'),
    text: L(
      'A unit of frequency: one million vibrations per second. Radio frequencies are usually given in MHz, like 100.6 MHz for a radio station.',
      'Een eenheid van frequentie: een miljoen trillingen per seconde. Radiofrequenties worden meestal in MHz gegeven, zoals 100,6 MHz voor een radiozender.',
    ),
  },
  {
    id: 'khz', en: ['kHz', 'kilohertz'], nl: ['kHz', 'kilohertz'], lesson: 'bands-and-tuning',
    title: L('kHz (kilohertz)', 'kHz (kilohertz)'),
    text: L(
      'One thousand vibrations per second, a thousandth of a MHz. Small distances on the dial, like the 12.5 kHz between two channels, are given in kHz.',
      'Duizend trillingen per seconde, een duizendste van een MHz. Kleine afstanden op de schaal, zoals de 12,5 kHz tussen twee kanalen, worden in kHz gegeven.',
    ),
  },
  {
    id: 'band', en: ['band', 'bands'], nl: ['band', 'banden'], lesson: 'bands-and-tuning',
    title: L('Band', 'Band'),
    text: L(
      'A range of frequencies used for one kind of radio, like the FM broadcast band from 87.5 to 108 MHz. The BAND key jumps from one band to the next.',
      'Een reeks frequenties die voor één soort radio wordt gebruikt, zoals de FM-omroepband van 87,5 tot 108 MHz. De BAND-toets springt van de ene band naar de volgende.',
    ),
  },
  {
    id: 'receiver', en: ['receiver', 'receivers'], nl: ['ontvanger', 'ontvangers'],
    title: L('Receiver', 'Ontvanger'),
    text: L(
      'A device that picks up radio signals and turns them into sound. The IC-R5 is only a receiver: it cannot send anything, so you can\'t disturb anyone with it.',
      'Een toestel dat radiosignalen opvangt en er geluid van maakt. De IC-R5 is alleen een ontvanger: hij kan niets uitzenden, dus je kunt er niemand mee storen.',
    ),
  },
  {
    id: 'transmitter', en: ['transmitter', 'transmitters', 'transmit'], nl: ['zender', 'zenders', 'zenden'],
    title: L('Transmitter', 'Zender'),
    text: L(
      'The device that sends out a radio signal, from a big broadcast tower to a small walkie-talkie. In Dutch the same word, "zender", also means a radio station.',
      'Het toestel dat een radiosignaal uitzendt, van een grote omroepmast tot een kleine walkietalkie. "Zender" betekent ook gewoon radiostation.',
    ),
  },
  {
    id: 'scanner', en: ['scanner', 'scanners', 'scan', 'scans', 'scanning'], nl: ['scanner', 'scanners', 'scan', 'scannen', 'scant'], lesson: 'scanning',
    title: L('Scanner, scanning', 'Scanner, scannen'),
    text: L(
      'Scanning means letting the radio step through frequencies or saved channels on its own, stopping whenever it hears something. A receiver that can do this is often called a scanner.',
      'Scannen betekent dat de radio zelf langs frequenties of opgeslagen kanalen loopt en stopt zodra hij iets hoort. Een ontvanger die dat kan, heet vaak een scanner.',
    ),
  },
  {
    id: 'antenna', en: ['antenna', 'antennas'], nl: ['antenne', 'antennes'], lesson: 'better-reception',
    title: L('Antenna', 'Antenne'),
    text: L(
      'The part that catches radio waves from the air. A better or higher antenna usually makes more difference than anything else.',
      'Het onderdeel dat radiogolven uit de lucht opvangt. Een betere of hogere antenne maakt meestal meer verschil dan wat ook.',
    ),
  },
  {
    id: 'sma', en: ['SMA'], nl: ['SMA'], lesson: 'meet-your-radio',
    title: L('SMA connector', 'SMA-aansluiting'),
    text: L(
      'A small screw-on connector for antennas (SubMiniature version A). The IC-R5\'s antenna screws onto the SMA socket on top, and any other antenna with an SMA plug fits too.',
      'Een kleine schroefaansluiting voor antennes (SubMiniature versie A). De antenne van de IC-R5 schroef je op de SMA-aansluiting bovenaan, en elke andere antenne met een SMA-stekker past ook.',
    ),
  },
  {
    id: 'bnc', en: ['BNC'], nl: ['BNC'], lesson: 'better-reception',
    title: L('BNC connector', 'BNC-aansluiting'),
    text: L(
      'A larger antenna connector that locks with a push and a twist. It doesn\'t fit the IC-R5 directly; you need an AD-92SMA adapter.',
      'Een grotere antenneaansluiting die vastklikt met duwen en draaien. Ze past niet rechtstreeks op de IC-R5; je hebt een AD-92SMA-adapter nodig.',
    ),
  },
  {
    id: 'lcd', en: ['LCD'], nl: ['LCD'], lesson: 'meet-your-radio',
    title: L('LCD (liquid crystal display)', 'LCD (lcd-scherm)'),
    text: L('The radio\'s small screen, showing the frequency, the mode and status icons.', 'Het kleine scherm van de radio, met de frequentie, de modus en statusiconen.'),
  },
  {
    id: 'smeter', en: ['signal bars', 'signal strength', 'S-meter'], nl: ['signaalbalkjes', 'signaalsterkte', 'S-meter'], lesson: 'fm-radio',
    title: L('Signal bars (S-meter)', 'Signaalbalkjes (S-meter)'),
    text: L(
      'The bars at the bottom of the display show how strong the signal you\'re receiving is. More bars, stronger signal.',
      'De balkjes onderaan het display tonen hoe sterk het signaal is dat je ontvangt. Meer balkjes, sterker signaal.',
    ),
  },

  // ---------- tuning and listening ----------
  {
    id: 'vfo', en: ['VFO'], nl: ['VFO'], lesson: 'memory-channels',
    title: L('VFO (variable frequency oscillator)', 'VFO (variabele frequentieoscillator)'),
    text: L(
      'The normal mode, where you tune freely with the dial. The other mode is memory mode, where the dial steps through your saved channels.',
      'De gewone modus, waarin je vrij afstemt met de knop. De andere modus is de geheugenmodus, waarin de knop langs je opgeslagen kanalen gaat.',
    ),
  },
  {
    id: 'step', en: ['tuning step', 'tuning steps'], nl: ['afstemstap', 'afstemstappen'], lesson: 'bands-and-tuning',
    title: L('Tuning step', 'Afstemstap'),
    text: L(
      'How far the frequency moves with one click of the dial, for example 12.5 kHz. Set it to the distance between channels, so every click lands exactly on the next one.',
      'Hoe ver de frequentie verschuift met één klik aan de knop, bijvoorbeeld 12,5 kHz. Zet ze op de afstand tussen kanalen, zodat elke klik precies op het volgende uitkomt.',
    ),
  },
  {
    id: 'dsel', en: ['dial-select step', 'D SEL'], nl: ['D SEL'], lesson: 'lock-and-settings',
    title: L('Dial-select step (D SEL)', 'Snelle afstemstap (D SEL)'),
    text: L(
      'The size of the big jumps when you turn the dial while holding FUNC: 100 kHz, 1 MHz (the default) or 10 MHz.',
      'De grootte van de grote sprongen als je aan de knop draait terwijl je FUNC inhoudt: 100 kHz, 1 MHz (standaard) of 10 MHz.',
    ),
  },
  {
    id: 'squelch', en: ['squelch'], nl: ['squelch'], lesson: 'volume-and-squelch',
    title: L('Squelch', 'Squelch'),
    text: L(
      'A gate that keeps the speaker quiet while nobody is transmitting. Without it you would hear constant hiss; it opens by itself when a signal comes in.',
      'Een poort die de luidspreker stil houdt zolang niemand uitzendt. Zonder squelch hoor je voortdurend gesis; ze gaat vanzelf open als er een signaal binnenkomt.',
    ),
  },
  {
    id: 'monitor', en: ['monitor'], nl: ['monitor'], lesson: 'volume-and-squelch',
    title: L('Monitor', 'Monitor'),
    text: L(
      'Opening the squelch for a moment (hold SQL) to hear weak signals or check whether a frequency is really quiet.',
      'De squelch even openzetten (SQL inhouden) om zwakke signalen te horen of te controleren of een frequentie echt stil is.',
    ),
  },
  {
    id: 'mode', en: ['receive mode', 'receive modes'], nl: ['ontvangstmodus', 'ontvangstmodi'], lesson: 'receive-modes',
    title: L('Receive mode', 'Ontvangstmodus'),
    text: L(
      'The way the sound is carried on the radio wave: AM, FM or WFM. The radio must use the same mode as the transmitter, or it sounds distorted or nearly silent.',
      'De manier waarop het geluid op de radiogolf zit: AM, FM of WFM. De radio moet dezelfde modus gebruiken als de zender, anders klinkt het vervormd of bijna stil.',
    ),
  },
  {
    id: 'modulation', en: ['modulation'], nl: ['modulatie', 'amplitudemodulatie'], lesson: 'receive-modes',
    title: L('Modulation', 'Modulatie'),
    text: L(
      'How sound is put onto a radio wave so it can travel. AM and FM are the two kinds the IC-R5 understands.',
      'Hoe geluid op een radiogolf wordt gezet zodat het kan reizen. AM en FM zijn de twee soorten die de IC-R5 begrijpt.',
    ),
  },
  {
    id: 'am', en: ['AM'], nl: ['AM'], lesson: 'receive-modes',
    title: L('AM (amplitude modulation)', 'AM (amplitudemodulatie)'),
    text: L(
      'The sound changes the strength of the radio wave. Used for medium-wave and shortwave broadcasting and for aviation.',
      'Het geluid verandert de sterkte van de radiogolf. Gebruikt voor middengolf- en kortegolfomroep en voor de luchtvaart.',
    ),
  },
  {
    id: 'fm', en: ['FM'], nl: ['FM'], lesson: 'receive-modes',
    title: L('FM (frequency modulation)', 'FM (frequentiemodulatie)'),
    text: L(
      'The sound makes the frequency wobble slightly. On the IC-R5, "FM" means narrow FM: walkie-talkies, radio amateurs and CB. "FM radio" in everyday speech means the broadcast stations, which use WFM.',
      'Het geluid laat de frequentie een beetje wiebelen. Op de IC-R5 betekent "FM" smal FM: walkietalkies, radioamateurs en CB. "FM-radio" in het dagelijks leven bedoelt de omroepzenders, en die gebruiken WFM.',
    ),
  },
  {
    id: 'wfm', en: ['WFM', 'W FM', 'wide FM'], nl: ['WFM', 'W FM', 'breed FM'], lesson: 'receive-modes',
    title: L('WFM (wide FM)', 'WFM (breed FM)'),
    text: L(
      'The wide version of FM used by FM radio stations between 87.5 and 108 MHz. It sounds better, but each station takes up more room on the dial.',
      'De brede versie van FM die FM-radiozenders tussen 87,5 en 108 MHz gebruiken. Het klinkt beter, maar elke zender neemt meer plaats in op de schaal.',
    ),
  },
  {
    id: 'memory', en: ['memory channel', 'memory channels', 'memory mode'], nl: ['geheugenkanaal', 'geheugenkanalen', 'geheugenmodus'], lesson: 'memory-channels',
    title: L('Memory channel', 'Geheugenkanaal'),
    text: L(
      'A saved frequency, with its mode, that you can call back instantly, like a preset button on a car radio. The IC-R5 has 1000 of them.',
      'Een opgeslagen frequentie, met haar modus, die je meteen terugvindt, zoals een voorkeuzetoets op een autoradio. De IC-R5 heeft er 1000.',
    ),
  },
  {
    id: 'skip', en: ['skip', 'SKIP'], nl: ['SKIP', 'overslaan'], lesson: 'scanning',
    title: L('Skip', 'Overslaan (SKIP)'),
    text: L('A mark on a memory channel that makes the scan jump over it.', 'Een markering op een geheugenkanaal waardoor de scan het overslaat.'),
  },
  {
    id: 'setmode', en: ['set mode'], nl: ['instelmodus'], lesson: 'lock-and-settings',
    title: L('Set mode', 'Instelmodus'),
    text: L('The IC-R5\'s settings menu. Hold TS for a second to open it.', 'Het instellingenmenu van de IC-R5. Houd TS een seconde in om het te openen.'),
  },
  {
    id: 'prio', en: ['priority watch'], nl: ['prioriteitsbewaking'], lesson: 'lock-and-settings',
    title: L('Priority watch', 'Prioriteitsbewaking'),
    text: L(
      'Checks one saved channel every 5 seconds while you listen somewhere else, so you don\'t miss it.',
      'Controleert om de 5 seconden één opgeslagen kanaal terwijl je elders luistert, zodat je het niet mist.',
    ),
  },
  {
    id: 'att', en: ['attenuator', 'ATT'], nl: ['verzwakker', 'ATT'], lesson: 'better-reception',
    title: L('Attenuator (ATT)', 'Verzwakker (ATT)'),
    text: L(
      'A switch that makes all incoming signals weaker. Useful next to a very strong transmitter that would otherwise overload the receiver and make stations appear where they don\'t belong.',
      'Een schakelaar die alle binnenkomende signalen zwakker maakt. Handig vlak bij een heel sterke zender die de ontvanger anders overstuurt, waardoor zenders opduiken waar ze niet horen.',
    ),
  },
  {
    id: 'bar', en: ['bar antenna'], nl: ['ferrietantenne'], lesson: 'better-reception',
    title: L('Bar antenna', 'Ferrietantenne'),
    text: L(
      'A small antenna inside the radio: a coil of wire on a ferrite rod. It works well for medium wave and is directional, so turning the radio changes the reception.',
      'Een kleine antenne in de radio: een draadspoel op een staafje ferriet. Ze werkt goed voor middengolf en is richtinggevoelig, dus de radio draaien verandert de ontvangst.',
    ),
  },

  // ---------- what's on the air ----------
  {
    id: 'broadcast', en: ['broadcast', 'broadcasting', 'broadcasters'], nl: ['omroep', 'omroepen'], lesson: 'listening-rules',
    title: L('Broadcasting', 'Omroep'),
    text: L(
      'Radio meant for everyone, such as music and news stations. Always free to listen to.',
      'Radio die voor iedereen bedoeld is, zoals muziek- en nieuwszenders. Altijd vrij te beluisteren.',
    ),
  },
  {
    id: 'vhf', en: ['VHF'], nl: ['VHF'],
    title: L('VHF (very high frequency)', 'VHF (zeer hoge frequentie)'),
    text: L(
      'Radio waves from 30 to 300 MHz. FM radio stations, 2 m radio amateurs, aviation and marine radio are all on VHF.',
      'Radiogolven van 30 tot 300 MHz. FM-radiozenders, radioamateurs op 2 m, luchtvaart en maritieme radio zitten allemaal op VHF.',
    ),
  },
  {
    id: 'uhf', en: ['UHF'], nl: ['UHF'],
    title: L('UHF (ultra high frequency)', 'UHF (ultrahoge frequentie)'),
    text: L(
      'Radio waves from 300 to 3000 MHz. PMR446 walkie-talkies, 70 cm radio amateurs and digital TV are on UHF.',
      'Radiogolven van 300 tot 3000 MHz. PMR446-walkietalkies, radioamateurs op 70 cm en digitale tv zitten op UHF.',
    ),
  },
  {
    id: 'hf', en: ['HF', 'shortwave'], nl: ['HF', 'kortegolf'], lesson: 'better-reception',
    title: L('HF, shortwave', 'HF, kortegolf'),
    text: L(
      'Frequencies from about 3 to 30 MHz. Shortwave signals bounce off the upper atmosphere and can travel thousands of kilometres, especially in the evening.',
      'Frequenties van ongeveer 3 tot 30 MHz. Kortegolfsignalen kaatsen terug op de hoge atmosfeer en kunnen duizenden kilometers ver komen, vooral \'s avonds.',
    ),
  },
  {
    id: 'mw', en: ['medium wave'], nl: ['middengolf'], lesson: 'better-reception',
    title: L('Medium wave', 'Middengolf'),
    text: L(
      'The AM broadcast band, 531 to 1602 kHz in Europe. Belgium\'s own stations have gone, but at night you can hear stations from far away.',
      'De AM-omroepband, 531 tot 1602 kHz in Europa. De Belgische zenders zijn verdwenen, maar \'s nachts hoor je zenders van ver.',
    ),
  },
  {
    id: 'cb', en: ['CB'], nl: ['CB'], lesson: 'pmr446-and-cb',
    title: L('CB (citizens band)', 'CB (citizens band)'),
    text: L(
      '40 licence-free channels around 27 MHz, used by truck drivers and hobbyists to chat. Free to listen to.',
      '40 vergunningsvrije kanalen rond 27 MHz, gebruikt door vrachtwagenchauffeurs en hobbyisten om te babbelen. Vrij te beluisteren.',
    ),
  },
  {
    id: 'pmr', en: ['PMR446'], nl: ['PMR446'], lesson: 'pmr446-and-cb',
    title: L('PMR446', 'PMR446'),
    text: L(
      'Licence-free walkie-talkies on 16 channels around 446 MHz, the kind you buy in a toy or outdoor shop. PMR stands for private mobile radio. Free to listen to.',
      'Vergunningsvrije walkietalkies op 16 kanalen rond 446 MHz, het soort dat je in een speelgoed- of buitensportwinkel koopt. PMR staat voor private mobile radio. Vrij te beluisteren.',
    ),
  },
  {
    id: 'ctcss', en: ['CTCSS', 'privacy codes', 'tone squelch'], nl: ['CTCSS', 'privacycodes', 'toonsquelch'], lesson: 'pmr446-and-cb',
    title: L('CTCSS, privacy codes', 'CTCSS, privacycodes'),
    text: L(
      'A tone too low to hear, sent along with a transmission, so only radios set to the same tone open their speaker. Despite the name, it doesn\'t make anything private: other radios can still hear everything.',
      'Een toon die te laag is om te horen en die met een uitzending wordt meegestuurd, zodat alleen toestellen met dezelfde toon hun luidspreker openzetten. Ondanks de naam maakt het niets privé: andere toestellen horen nog alles.',
    ),
  },
  {
    id: 'ham', en: ['radio amateur', 'radio amateurs', 'amateur radio'], nl: ['radioamateur', 'radioamateurs', 'amateurradio', 'zendamateurs'], lesson: 'amateurs-and-iss',
    title: L('Radio amateur', 'Radioamateur'),
    text: L(
      'A hobbyist with a licence to transmit, who talks with others nearby and around the world, often on home-built gear. Everyone may listen to them.',
      'Een hobbyist met een zendvergunning die met anderen in de buurt en over de hele wereld praat, vaak met zelfgebouwde apparatuur. Iedereen mag naar hen luisteren.',
    ),
  },
  {
    id: '2m', en: ['2 m', '70 cm'], nl: ['2 m', '2m', '70 cm', '70cm'], lesson: 'amateurs-and-iss',
    title: L('2 m and 70 cm', '2 m en 70 cm'),
    text: L(
      'Radio amateur bands named after the length of their radio waves: 2 m is 144–146 MHz, 70 cm is 430–440 MHz. Most local amateur talk in FM happens here.',
      'Banden voor radioamateurs, genoemd naar de lengte van hun radiogolven: 2 m is 144–146 MHz, 70 cm is 430–440 MHz. Het meeste lokale amateurverkeer in FM gebeurt hier.',
    ),
  },
  {
    id: 'repeater', en: ['repeater', 'repeaters'], nl: ['relais'], lesson: 'amateurs-and-iss',
    title: L('Repeater', 'Relais (repeater)'),
    text: L(
      'An automatic station on a hill or tower that picks up a signal and sends it out again on another frequency, so small handheld radios reach much further.',
      'Een automatisch station op een heuvel of toren dat een signaal opvangt en opnieuw uitzendt op een andere frequentie, zodat kleine handradio\'s veel verder reiken.',
    ),
  },
  {
    id: 'duplex', en: ['duplex', 'offset'], nl: ['duplex'], lesson: 'amateurs-and-iss',
    title: L('Duplex, offset', 'Duplex'),
    text: L(
      'Using two different frequencies, one to send and one to receive, as repeaters do. The difference between them is the offset: 600 kHz on 2 m.',
      'Twee verschillende frequenties gebruiken, één om te zenden en één om te ontvangen, zoals relais doen. Het verschil ertussen heet de offset: 600 kHz op 2 m.',
    ),
  },
  {
    id: 'calling', en: ['calling channel'], nl: ['aanroepkanaal'], lesson: 'amateurs-and-iss',
    title: L('Calling channel', 'Aanroepkanaal'),
    text: L(
      'An agreed frequency where people call to start a conversation, then move to another frequency to talk. A radio meeting point.',
      'Een afgesproken frequentie waar mensen roepen om een gesprek te beginnen, om daarna naar een andere frequentie te gaan. Een ontmoetingsplek op de radio.',
    ),
  },
  {
    id: 'iss', en: ['ISS'], nl: ['ISS'], lesson: 'amateurs-and-iss',
    title: L('ISS (International Space Station)', 'ISS (internationaal ruimtestation)'),
    text: L(
      'The crewed space station circling the Earth about 400 km up, once every 90 minutes. It has an amateur radio station on board.',
      'Het bemande ruimtestation dat op ongeveer 400 km hoogte rond de aarde draait, eens per 90 minuten. Het heeft een amateurradiostation aan boord.',
    ),
  },
  {
    id: 'ariss', en: ['ARISS'], nl: ['ARISS'], lesson: 'amateurs-and-iss',
    title: L('ARISS', 'ARISS'),
    text: L(
      'Amateur Radio on the International Space Station: the programme that lets school pupils talk with astronauts by radio.',
      'Amateur Radio on the International Space Station: het programma waarmee leerlingen via de radio met astronauten praten.',
    ),
  },
  {
    id: 'sstv', en: ['SSTV', 'slow-scan TV'], nl: ['SSTV'], lesson: 'amateurs-and-iss',
    title: L('SSTV (slow-scan television)', 'SSTV (slow-scan-televisie)'),
    text: L(
      'Pictures sent as sound over the radio. The ISS sometimes sends SSTV images; a free phone app can turn the sound back into the picture.',
      'Beelden die als geluid over de radio worden verstuurd. Het ISS zendt soms SSTV-beelden uit; een gratis app op je telefoon maakt van het geluid weer een beeld.',
    ),
  },
  {
    id: 'downlink', en: ['downlink'], nl: ['downlink'], lesson: 'amateurs-and-iss',
    title: L('Downlink', 'Downlink'),
    text: L('The frequency a satellite or space station uses to transmit down to Earth.', 'De frequentie waarop een satelliet of ruimtestation naar de aarde zendt.'),
  },
  {
    id: 'doppler', en: ['Doppler'], nl: ['Doppler'], lesson: 'amateurs-and-iss',
    title: L('Doppler shift', 'Dopplereffect'),
    text: L(
      'The change in frequency when a transmitter moves towards or away from you, like the pitch of a passing ambulance siren. The fast-moving ISS shifts by a few kHz.',
      'De verandering van frequentie als een zender naar je toe of van je weg beweegt, zoals de toonhoogte van een voorbijrijdende ambulance. Het snelle ISS verschuift enkele kHz.',
    ),
  },

  // ---------- digital and rules ----------
  {
    id: 'dab', en: ['DAB+'], nl: ['DAB+'], lesson: 'listening-rules',
    title: L('DAB+ (digital radio)', 'DAB+ (digitale radio)'),
    text: L('Digital radio broadcasting. The IC-R5 can\'t decode it; it only hears a rough buzz.', 'Digitale radio-omroep. De IC-R5 kan die niet decoderen; hij hoort alleen een ruw gezoem.'),
  },
  {
    id: 'tetra', en: ['TETRA', 'ASTRID'], nl: ['TETRA', 'ASTRID'], lesson: 'listening-rules',
    title: L('TETRA, ASTRID', 'TETRA, ASTRID'),
    text: L(
      'TETRA is a digital radio system for emergency services. ASTRID is Belgium\'s TETRA network for police, fire brigades and ambulances. It is encrypted and listening to it is not allowed.',
      'TETRA is een digitaal radiosysteem voor hulpdiensten. ASTRID is het Belgische TETRA-netwerk voor politie, brandweer en ambulances. Het is versleuteld en meeluisteren mag niet.',
    ),
  },
  {
    id: 'dmr', en: ['DMR'], nl: ['DMR'], lesson: 'listening-rules',
    title: L('DMR (digital mobile radio)', 'DMR (digitale mobiele radio)'),
    text: L('A digital radio system used by companies and some radio amateurs. The IC-R5 can\'t decode it.', 'Een digitaal radiosysteem dat bedrijven en sommige radioamateurs gebruiken. De IC-R5 kan het niet decoderen.'),
  },
  {
    id: 'encrypted', en: ['encrypted'], nl: ['versleuteld', 'versleutelde', 'geëncrypteerd'], lesson: 'listening-rules',
    title: L('Encrypted', 'Versleuteld'),
    text: L('Scrambled with a secret key, so only authorised radios can understand it.', 'Gecodeerd met een geheime sleutel, zodat alleen toestellen met toestemming het begrijpen.'),
  },
  {
    id: 'analogue', en: ['analogue'], nl: ['analoog'], lesson: 'listening-rules',
    title: L('Analogue', 'Analoog'),
    text: L(
      'The classic way of sending sound by radio, where the wave follows the sound directly (AM and FM). The opposite of digital, which sends sound as numbers.',
      'De klassieke manier om geluid via radio te versturen, waarbij de golf het geluid rechtstreeks volgt (AM en FM). Het tegenovergestelde van digitaal, dat geluid als getallen verstuurt.',
    ),
  },
  {
    id: 'ssb', en: ['SSB'], nl: ['SSB'],
    title: L('SSB (single sideband)', 'SSB (enkelzijband)'),
    text: L(
      'A narrow kind of AM used by radio amateurs and on shortwave. The IC-R5 can\'t receive it properly: it sounds like a garbled duck voice.',
      'Een smalle vorm van AM die radioamateurs en kortegolfstations gebruiken. De IC-R5 kan ze niet goed ontvangen: het klinkt als een onverstaanbare eendenstem.',
    ),
  },
  {
    id: 'bipt', en: ['BIPT'], nl: ['BIPT'], lesson: 'listening-rules',
    title: L('BIPT', 'BIPT'),
    text: L(
      'The Belgian Institute for Postal Services and Telecommunications, Belgium\'s telecom regulator. It decides how radio may be used in Belgium.',
      'Het Belgisch Instituut voor postdiensten en telecommunicatie, de Belgische telecomregulator. Het bepaalt hoe radio in België gebruikt mag worden.',
    ),
  },
  {
    id: 'uba', en: ['UBA'], nl: ['UBA'], lesson: 'amateurs-and-iss',
    title: L('UBA', 'UBA'),
    text: L(
      'Belgium\'s national radio amateur association (Koninklijke Unie van de Belgische Zendamateurs). It keeps the official list of Belgian repeaters.',
      'De nationale vereniging van Belgische radioamateurs (Koninklijke Unie van de Belgische Zendamateurs). Ze houdt de officiële lijst van Belgische relais bij.',
    ),
  },

  // ---------- batteries ----------
  {
    id: 'nimh', en: ['NiMH'], nl: ['NiMH'], lesson: 'power-up',
    title: L('NiMH batteries', 'NiMH-batterijen'),
    text: L(
      'Nickel-metal hydride: the common rechargeable AA battery. The best choice for the IC-R5, which can charge them itself.',
      'Nikkel-metaalhydride: de gewone herlaadbare AA-batterij. De beste keuze voor de IC-R5, die ze zelf kan opladen.',
    ),
  },
  {
    id: 'nicd', en: ['NiCd'], nl: ['NiCd'], lesson: 'power-up',
    title: L('NiCd batteries', 'NiCd-batterijen'),
    text: L('Nickel-cadmium: an older kind of rechargeable battery that the IC-R5 can also charge.', 'Nikkel-cadmium: een ouder soort herlaadbare batterij die de IC-R5 ook kan opladen.'),
  },
  {
    id: 'alkaline', en: ['alkaline'], nl: ['alkaline', 'alkalinebatterijen'], lesson: 'power-up',
    title: L('Alkaline batteries', 'Alkalinebatterijen'),
    text: L('Ordinary single-use batteries. They work in the IC-R5, but must never be charged.', 'Gewone wegwerpbatterijen. Ze werken in de IC-R5, maar je mag ze nooit opladen.'),
  },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryEntry> = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Exact spelling → entry, and one regex of all spellings (longest first), per language. */
function build(lang: 'en' | 'nl') {
  const lookup = new Map<string, GlossaryEntry>();
  for (const g of GLOSSARY) {
    for (const term of g[lang]) {
      lookup.set(term, g);
      if (/^[a-z]/.test(term)) lookup.set(capitalise(term), g);
    }
  }
  const alts = [...lookup.keys()].sort((a, b) => b.length - a.length).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = `(?<![\\p{L}\\p{N}+])(?:${alts.join('|')})(?![\\p{L}\\p{N}])`;
  return { lookup, pattern };
}

const BUILT = { en: build('en'), nl: build('nl') };

/** Splits text into plain strings and glossary matches, skipping ids already in `seen`. */
export function findTerms(text: string, lang: 'en' | 'nl', seen: Set<string>) {
  const { lookup, pattern } = BUILT[lang];
  const re = new RegExp(pattern, 'gu');
  const out: (string | { id: string; text: string })[] = [];
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const entry = lookup.get(m[0]);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ id: entry.id, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
