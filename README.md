# Radio lessons

Interactive getting-started lessons for the **Icom IC-R5** communications receiver, receive only, written for listeners in Belgium. Each lesson runs on a 3D model of the radio with a simulator behind it: the key to press lights up, the step completes when you actually do it, and "Show me" plays it for you. English and Dutch.

Live at https://radio-lessons.atlesque.dev

## Run it

- `pnpm install`, then `pnpm dev` (Nuxt dev server).
- `pnpm build` writes the static site to `.output/public`; `pnpm preview` serves it with Wrangler.
- `pnpm typecheck` runs vue-tsc.

Cloudflare Workers Builds deploys every push to `main` (build `pnpm run build`, deploy `npx wrangler deploy`). The Worker only serves static assets (`wrangler.jsonc`), on the custom domain `radio-lessons.atlesque.dev`. `nitro.preset: 'static'` must stay, or Nitro switches to its Cloudflare preset inside Workers Builds and the deploy fails.

## How it fits together

- `ui/` is the shared theme layer (Junk Desk design system: Nuxt UI, Plus Jakarta Sans and DM Serif Display, ink neutrals, navy/lime). Colors live in CSS so the strict CSP in `public/_headers` holds; its only outside source is Cloudflare Web Analytics, which the zone injects.
- `app/radio/sim.ts` models the IC-R5's behaviour from the instruction manual: VFO and memory modes, bands and tuning steps, squelch and monitor, receive modes, memory write and skip, band/full/memory scans with pause and resume timers, set mode, key lock, the [DIAL]/volume swap and both resets. It knows nothing about Vue or three.js.
- `app/radio/bands.ts` holds the bands, tuning steps and the signals the simulator can receive: VRT's FM frequencies for Vlaams-Brabant and Brussels, plus invented practice signals (CB 19, PMR446 channel 3, a 2 m repeater, the ISS downlink, a shortwave and a medium-wave station, a DAB+ block).
- `app/radio/model.ts` builds the radio procedurally in millimetres (58 × 86 × 27 mm body), with canvas textures for the printing, the key labels and the display. `app/radio/lcd.ts` draws the display with the DSEG segment fonts.
- `app/radio/audio.ts` synthesises the sound: band noise, squelch, key beeps and stand-in programmes (no recordings).
- `app/radio/input.ts` is the one input path for the 3D model, the key pad, the keyboard and the demos. A quick click on [FUNC] or [SQL] latches it, because a mouse can't hold two things at once.
- `app/lessons/lessons.ts` is the course. A step can be info, an action (a `check` on the radio's state or events), an explore step (click a part) or a quiz, with an optional "Show me" demo. `app/lessons/slugs.ts` must list the same slugs, for the sitemap.

## Sources

- Key sequences: Icom IC-R5 instruction manual (FCC filing, 2002).
- Belgian listening rules: BIPT's position on scanners and its consumer page on forbidden equipment.
- FM frequencies: [vrt.be, FM-antenne](https://www.vrt.be/nl/ons-aanbod/fm-antenne).
- Fonts: Plus Jakarta Sans, DM Serif Display and DSEG (all SIL Open Font License, in `public/fonts/`).

An independent learning project, not affiliated with Icom Inc. Icom and IC-R5 are trademarks of Icom Inc.
