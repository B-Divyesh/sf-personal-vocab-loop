# Personal Vocab Loop — verification handoff

## Status: FAIL

Independent QA tested candidate
`23b2e61f8f87548c500e9f30f2d9845a22742442` and
`https://personal-vocab-loop.sociobot.in/` on 2026-08-28 UTC. The live
deployment is byte-for-byte the candidate, but release acceptance fails.
Full evidence is in `.factory/verification.md`.

## What passed

- Clean `npm ci`, `npm test` (2 unit assertions and 3 browser tests), and
  `npm run build`; no lint script exists.
- Core capture, persistence, blind recall, retry/advance, 10-second voice
  recording, recording denial, JSON/CSV/encrypted export, import, and
  license-token client behavior.
- Live offline reload, installability checks, no load-time third-party
  requests, no console/page errors, reduced motion, keyboard/focus smoke test,
  and 0 serious/critical axe findings.
- Bundle budgets. Mobile Lighthouse: Performance 95, Accessibility 100, Best
  Practices 93, SEO 100; LCP 1.054 s and CLS 0.

## Release blockers

1. Production checkout returns HTTP 404, so “Unlock Plus for $12” is broken.
2. A 200-request verification-API burst returned 200× HTTP 200; no 429 or
   `Retry-After` (observed threshold >200).
3. `sw.js` and cache version are unchanged from the parent while `app.js`
   changed. Exact upgrade testing showed installed clients remain on the old
   JS and receive no update event.

## Other defects

- Whitespace-only required values save an empty phrase (medium).
- At 390 px the square hero renders about 321×640 and pushes the heading/CTA
  below the first viewport (medium).
- Multiple mobile targets are under 44 px and nav spacing is 4 px (medium).
- `hidden` encrypted export/import forms render visibly (low).
- Security policy headers and immutable hashed-asset caching are absent (low).

## Reverification

From a clean checkout, run:

```sh
npm ci
npm test
npm run build
```

Then repeat live byte-hash comparison, parent-to-new service-worker upgrade,
offline reload, desktop/390 px flows, axe in both themes, Lighthouse mobile,
checkout GET, and an API burst that must yield 429 with `Retry-After`.
