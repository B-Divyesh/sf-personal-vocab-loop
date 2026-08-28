# Personal Vocab Loop

Personal Vocab Loop is an offline-first language-practice PWA for learners who
want their own useful phrases to survive into speech. Capture a word and a
sentence from your life, optionally save a short voice cue, then recall it on
a calm 1 / 3 / 7 / 14 / 30-day loop. There are no accounts or streaks.

All phrases and recordings stay in the browser's IndexedDB storage. JSON, CSV,
and encrypted JSON exports keep the library portable. A $12 one-time Plus
license adds random ordering for recall sessions; the core loop and exports are
always free.

## Run and verify

```sh
npm ci
npm run dev          # local development server
npm test             # unit, browser flow, offline, and axe checks
npm run typecheck    # strict TypeScript check
npm run lint         # repository static-analysis gate
npm run build        # reproducible static output in dist/
npm run preview      # serve dist/ locally
```

Deploy the contents of `dist/` to any static host. The manifest and service
worker allow installation and cached offline use after the first visit. The
build emits content-hashed app assets and a matching content-versioned service
worker, so an installed copy discovers every new release instead of remaining
on a stale shell. `public/staticwebapp.config.json` carries the production
security, MIME, and cache policy for Azure Static Web Apps.

## Privacy and product notes

No analytics, advertising, accounts, remote fonts, or third-party runtime
scripts are used. Microphone permission is requested only when recording.
See [Privacy](public/privacy/index.html) and [Terms](public/terms/index.html).
The researched scope and visual system are recorded in `.factory/`.
