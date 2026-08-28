# Demo sandbox

- URL: `https://personal-vocab-loop.sociobot.in/?demo=1` (`/?demo=1` locally).
  `/demo` remains a stable alias for installed-app and offline checks.
- Sample: three due phrases in Spanish, French, and Japanese, each with a
  personal sentence and context tag. The Spanish phrase has a short original,
  replayable sample voice cue stored with the seed record.
- Storage: IndexedDB database `demo:personal-vocab-loop`. The normal database
  is `personal-vocab-loop`; demo mode never opens it.
- Reset: **Reset demo** clears and reseeds only the demo database.
- Exit: **Start for real** clears the demo database before loading `/`.
- Offline: visit once, wait for the service worker, then `/?demo=1` (or `/demo`)
  and its sample database continue to work without a network connection.

All claim checks start from this URL in a fresh browser context. See
`.factory/claims.json` for exact commands and observable assertions.
