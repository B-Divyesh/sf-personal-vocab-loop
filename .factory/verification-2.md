# Personal Vocab Loop — independent verification 2

## Verdict: FAIL

Verified on 2026-08-28 UTC from clean checkout commit
`52d13a373085104cc457f707709ca61ac73fad02` against
<https://personal-vocab-loop.sociobot.in/>. The deployed files are the exact
production build of this candidate, so these are candidate defects rather than
a stale/deployment-only failure. No product code was changed by this review.

## Release-blocking findings

### Critical — required claims contract is absent

`.factory/claims.json` does not exist. Consequently there are no declared
claim tests to run from the demo entry point, which is an explicit automatic
release blocker. This is especially material because the live page and README
make testable claims including offline operation, local-only data, encrypted
export, CSV export, no accounts, no analytics, and 10-second recording.
None has the required `@claim:<id>` sandbox test or claim-manifest entry.

### Critical — no one-click isolated sample-data demo

Cold first read of `/` says this is a private phrase-and-voice recall tool and
offers **“Capture your first phrase”**. It does not explicitly say it is for a
language learner, and it has no **“Try it with sample data”** action. Therefore
the first screen fails the plain-words/demo gate even before functionality is
considered.

Direct fresh-context checks confirm that neither `/demo` nor `/?demo=1` has a
sample action or the required persistent “Demo — sample data, nothing is
saved” banner. Both create/use the ordinary IndexedDB database
`personal-vocab-loop`, not a separate `demo:` namespace. `.factory/demo.md` is
also absent. Trying the product necessarily writes to ordinary local storage,
so the independent verifier cannot exercise claims through the required demo
sandbox.

### High — advertised $12 checkout is broken in production

`GET https://api.sociobot.in/api/v1/products/personal-vocab-loop/checkout`
returned HTTP **404**, no `Location`, and:

```json
{"error":"enabled factory product","status":404}
```

The live Settings page advertises “Unlock Plus for $12” and links to this
endpoint. The free product remains usable, but the advertised purchase cannot
begin.

## Other findings

### Medium — no actual 404 route

`/not-a-real-route` returns HTTP 200 and renders the application shell through
the SPA fallback. The required styled 404 route/status is absent.

### Low — malformed-import error is implementation text without recovery guidance

Uploading `{not json` shows the raw message
“Expected property name or '}' in JSON at position 1 (line 1 column 2)”. The
export controls remain available, but the message does not explain in plain
language that the backup file is invalid or what to do next.

### Observation — live Lighthouse performance was not stable at the required floor

Two independent Lighthouse 12.8.2 mobile runs on the live URL produced:

| Run | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 85 | 100 | 100 | 100 | 1.43 s | 586 ms | 0 |
| 2 | 95 | 100 | 100 | 100 | 1.16 s | 272 ms | 0 |

The second run meets the 90 target, while the first does not. The build-size
budgets do pass, but this variance means the live 90+ performance requirement
was not demonstrated reliably in this verification.

## Fresh-build and deployment identity

- Initial clean state was the exact requested SHA and `origin/main` resolved to
  the same SHA. `npm ci` installed 57 packages with 0 reported vulnerabilities.
- `npm test` passed: Vitest **4/4** and Playwright **11/11**. These repository
  tests are not claim tests; none carries the required claims manifest
  coverage.
- `npm run typecheck`, `npm run lint`, and the exact `npm run build` all passed.
  The build created `dist/` with app JS 23,565 B raw / 8,522 B gzip, CSS
  10,711 B raw / 3,187 B gzip, and hero WebP 27,418 B.
- The following local `dist/` SHA-256 values exactly match the live responses:

| Path | SHA-256 |
| --- | --- |
| `/index.html` | `d24ab47a3c49d32c243ffc40af21398fd75a1a9cb7808c1a5b277dc1eb86d7bf` |
| `/sw.js` | `dfa0aea7058d34e7378e51da1a454f0438930ce502fba0fdcd1ca181c9d69e9e` |
| `/assets/app-Ey4W57YB.js` | `8b53bfbf3e7c79520fc84bbc40561d8c6cba52b271ed8c29f0486ddb57fc9f13` |
| `/assets/index-SN2y3ztO.css` | `4a954d259c5a8c2469dc9069934524b7cda0d71051dd2e7e2c06e9373a0f31e0` |
| `/manifest.webmanifest` | `a3da080296d1558a8809778f73e670bf1b4991ae6694ea925f7a8cf57eac1b60` |
| `/voice-orbit.webp` | `d35f96d18828551ea739f0d08e44dcbce769230d932b6d618418a4c492898526` |

## Functional, privacy, PWA, and accessibility evidence

- In fresh browser contexts, normal phrase capture persisted across reload;
  the boundary lengths (90-character phrase, 500-character sentence,
  40-character tag) saved; CSV export had the expected header and one data
  row. Whitespace-only required values were rejected with a focused,
  field-specific message and then recovered by valid input.
- A fake granted microphone produced a saved playable voice cue. A denied
  microphone produced “Microphone access was not available. You can still save
  this phrase without a voice cue.” and left save available. Malformed JSON
  import showed the finding above without a page failure.
- Live PWA: a controlling worker and the
  `vocab-loop-ad8e9e399ce1e60e` cache were present; after first load,
  `context.setOffline(true)` plus reload retained the home screen. The local
  previous-release-to-candidate service-worker upgrade test passed.
- The required URL verifier passed: title, `lang=en`, one `h1`, one `main`,
  image alt text, no console/page errors. Live axe scans at `/`, `/#capture`,
  and `/#settings` found **0 serious/critical** WCAG 2 A/AA violations. At
  390 px the page had no horizontal overflow; all measured nav/footer targets
  were at least 44 px high, the hero remained square, and keyboard Tab reached
  the skip link with a visible 3px focus ring.
- First-load requests were only to `https://personal-vocab-loop.sociobot.in`.
  No third-party scripts, fonts, analytics, or page errors were observed.
  CSP, HSTS, frame protection, `nosniff`, referrer, COOP/CORP, and microphone
  response policies are present. Hashed JS/CSS use `max-age=31536000,
  immutable`; HTML and the service worker revalidate.
- The production license **verify** endpoint now does rate-limit correctly:
  in a 220-request concurrent burst using an invalid token, 30 responses were
  HTTP 200 and the next 190 were HTTP 429, each with `Retry-After: 4`.
  Observed threshold: 30 accepted rapid requests. There is no sign-in flow.

## Required next steps before release

1. Add `.factory/claims.json`, remove or enumerate every user-facing claim,
   and add one isolated demo-entry test per claim using `@claim:<id>` tags.
2. Implement and document `/demo` (or `?demo=1`) with realistic shipped sample
   phrases, a persistent/resettable demo banner, and storage fully isolated
   from real data. Put the first-screen “Try it with sample data” action beside
   the real capture action and make the audience explicit.
3. Register/enable the live Sociobot product so the checkout URL yields the
   hosted-checkout redirect; retest the entire purchase/return/license flow.
4. Add a genuine 404 response/page and turn raw import parser output into a
   concise recovery message. Recheck live performance under repeatable mobile
   conditions.
