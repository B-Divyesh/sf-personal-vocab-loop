# Personal Vocab Loop

Personal Vocab Loop is a phone-friendly practice app for language learners.
Capture a phrase and a sentence from your life. Add a voice cue of up to 10
seconds, then recall it after 1, 3, 7, 14 and 30 days. The core loop works
without an account.

Phrases and recordings stay in private storage in this browser. Download a
backup you can restore, a CSV for spreadsheets, or a backup protected by a
passphrase. Existing Plus license holders can restore private shuffle.

## Try the isolated demo

Open `http://localhost:5173/?demo=1` in development, or visit
<https://personal-vocab-loop.sociobot.in/?demo=1>. It starts with three realistic
sample phrases and a replayable voice cue. Demo changes stay in a separate
browser database, so they cannot alter your library. Its technical name is
`demo:personal-vocab-loop`. **Reset demo** restores the sample, and **Start for
real** clears the demo database before opening the real library.

## Run and verify

```sh
npm ci
npm run dev          # local development server
npm test             # unit, browser flow, offline, and axe checks
npm run test:claims  # run every declared product-claim check
npm run typecheck    # strict TypeScript check
npm run lint         # repository static-analysis gate
npm run build        # reproducible static output in dist/
npm run preview      # serve dist/ locally
```

Deploy `dist/` to a static host configured for the included SPA routes and
headers. Azure Static Web Apps is the verified configuration. After the first
online visit, the app can open without a connection.

## Privacy and product notes

The app uses no analytics, ads, trackers, downloaded fonts, or code from other
sites. Microphone permission is requested only when recording.
See [Privacy](public/privacy/index.html) and [Terms](public/terms/index.html).
The claim tests are listed in [.factory/claims.json](.factory/claims.json).
The researched scope and visual system are recorded in `.factory/`.
