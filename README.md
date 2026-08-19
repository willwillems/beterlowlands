# beterlowlands

A nimble, local-first timetable ("blokkenschema") for the [Lowlands](https://lowlands.nl) festival. All schedule data is baked into a fully static site at build time, and a service worker caches the whole thing — schedule, artist bios, and photos — so it keeps working offline on the festival grounds.

Built with [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5) and `adapter-static`. No runtime dependencies.

## Features

- CSS-grid timetable with sticky stage column and time header
- Day buttons (VR/ZA/ZO) plus a "now" line that auto-scrolls into view during the festival
- Favorites (★, stored in localStorage) with a my-schedule filter
- Search by act, genre, or category
- Artist modal with set times, bio, YouTube preview, and social links
- Deep links: `/#act-<id>` opens an act directly
- Works fully offline once visited (service worker precaches everything)

## Develop

Requires Node 20.11+ (see `.nvmrc`).

```bash
npm install
npm run dev
```

## Refresh festival data

```bash
npm run hydrate
```

This pulls every act from the lowlands.nl Wagtail API (`/api/pages/?type=acts.ActPage`) and regenerates:

- `src/lib/data/{events,artists,stages}.json` — committed, imported at build time
- `static/data/images/*.jpg` — artist photos, gitignored, regenerated on demand

When two acts overlap on the same stage (a cancelled act's page can linger in the API), the most recently published act page wins.

The raw JSON is also served by the built site at `/data/{artists,events,stages}.json`.

## Build

```bash
npm run build     # static site in build/
npm run preview
```

## Structure

- `src/routes/+page.svelte` — the timetable grid
- `src/lib/components/` — nav, menu, stage names, day indicator, event cell, artist modal
- `src/service-worker.js` — precaches the entire site for offline use
- `hydrate.js` — data pipeline (plain Node, zero dependencies)
