# Radio lessons

Interactive getting-started lessons for the **Icom IC-R5** communications receiver, receive only, written for listeners in Belgium. Each lesson runs on a 3D model of the radio with a simulator behind it: the key to press lights up, the step completes when you actually do it, and "Show me" plays it for you. English and Dutch.

Live at https://radio-lessons.atlesque.dev

## Run it

- `pnpm install`, then `pnpm dev` (Nuxt dev server).
- `pnpm build` writes the static site to `.output/public`; `pnpm preview` serves it with Wrangler.
- `pnpm typecheck` runs vue-tsc on the app and tsc on the Worker.

Cloudflare Workers Builds deploys every push to `main` (build `pnpm run build`, deploy `npx wrangler deploy`), on the custom domain `radio-lessons.atlesque.dev`. The site is static (`.output/public`, served by the assets binding); only `/api/*` runs the Worker in `worker/` (`assets.run_worker_first`). `nitro.preset: 'static'` must stay, or Nitro switches to its Cloudflare preset inside Workers Builds and the deploy fails.

### Accounts and saved progress

- Sign-in is a magic link: `POST /api/auth/request` emails a one-time link (15 minutes) through Cloudflare Email Sending (`send_email` binding, from `radio-lessons@atlesque.dev`; `atlesque.dev` is onboarded). The link opens `/auth/verify`, which exchanges the token with `POST /api/auth/verify`, so mail scanners that fetch links can't use them up. Sessions are an HttpOnly cookie; only SHA-256 hashes of tokens and sessions are stored.
- Limits: 3 links per address and 10 per IP per hour. State-changing requests must carry the site's Origin.
- Data lives in D1 `radio-lessons` (EU jurisdiction): `users`, `login_tokens`, `sessions`, `progress` (one JSON blob per user, see `app/progress/model.ts`). Progress is always kept in localStorage too; when signed in it is merged with the server copy (finished lessons add up, newest position wins) and uploaded after changes.
- Schema changes: add a file to `migrations/`, then `pnpm db:migrate` (remote) and `wrangler d1 migrations apply radio-lessons --local` for `pnpm preview`. After changing bindings, `pnpm types`.
- Local test of the API: `pnpm build && pnpm preview`; emails aren't sent, Wrangler logs where it saved them (the link inside points at the live domain; swap in localhost).

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
