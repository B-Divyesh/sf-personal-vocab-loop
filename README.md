# Personal Vocab Loop

Personal Vocab Loop is a language-practice PWA for learners. Capture a word and
a sentence from your life. Add a voice cue of up to 10 seconds, then recall it
after 1, 3, 7, 14 and 30 days. The core loop works without an account.

Phrases and recordings stay in the browser's IndexedDB. JSON backups can restore
the library. CSV and passphrase-encrypted exports are also available. Existing
Plus license holders can still restore private shuffle. New purchases are paused.

## Try the isolated demo

Open `http://localhost:5173/demo` in development, or visit
<https://personal-vocab-loop.sociobot.in/demo>. It starts with three realistic
sample phrases. Demo changes use the separate `demo:personal-vocab-loop`
database. **Reset demo** restores the sample, and **Start for real** clears the
demo database before opening the real library.

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
worker provide cached offline use after the first visit. The
build emits content-hashed app assets and a matching content-versioned service
worker, so an installed copy discovers every new release instead of remaining
on a stale shell. `public/staticwebapp.config.json` carries the production
security, MIME, and cache policy for Azure Static Web Apps.

## Privacy and product notes

No analytics, advertising, trackers, remote fonts, or third-party runtime
scripts are used. Microphone permission is requested only when recording.
See [Privacy](public/privacy/index.html) and [Terms](public/terms/index.html).
The claim tests are listed in [.factory/claims.json](.factory/claims.json).
The researched scope and visual system are recorded in `.factory/`.
