# Personal Vocab Loop — independent verification

## Verdict: FAIL

Candidate `23b2e61f8f87548c500e9f30f2d9845a22742442` was verified on
2026-08-28 UTC against `https://personal-vocab-loop.sociobot.in/` and the
researched brief/work order. The core local-first vocabulary loop works, and
the live files match the candidate, but the candidate is not release-ready.
The production checkout is unavailable, the billing verification API did not
rate-limit a 200-request burst, and installed copies cannot update from the
previous release to this candidate.

## Identity and clean-build evidence

- Source: clean detached Git worktree at the exact candidate SHA. `origin/main`
  also resolved to the same SHA before verification.
- Runtime: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2` from the lockfile.
- `npm ci`: passed; 57 packages installed, 0 audit vulnerabilities.
- `npm test`: passed. Vitest: 1 file, 2 assertions. Playwright: 3/3 tests
  (capture/recall, offline reload, empty-state axe).
- No lint script exists. Type checking is part of the build.
- `npm run build`: passed (`tsc --noEmit && vite build`) and created `dist/`.
- Production output: JS 23,079 B raw / 8,351 B gzip; CSS 10,456 B raw /
  3,134 B gzip; hero WebP 27,418 B. These pass the 200 KB JS, 50 KB CSS, and
  300 KB hero budgets.
- Candidate hashes matched the live responses exactly:

  | Path | SHA-256 |
  | --- | --- |
  | `/index.html` | `b6bbd064824358ad3beb0891a4340cc7c2ebb21512f8c2d02a38934996c1252a` |
  | `/assets/app.js` | `cf27ad184d9c13a0ac791903e285a944a14a79becba7ceb1ece1e96326f90cda` |
  | `/assets/index.css` | `f5ac715e322eead92efc78d38e19de69598b6b370e9b068bf56b567b632f3ae3` |
  | `/sw.js` | `fd34cd40dd5832bd7666d5242eb186d722f98e9b09c9e9826cd0962b9852942b` |
  | `/manifest.webmanifest` | `daee126be15a7a0e28dae021f5a43f8b0169007dae86cab26944360dc0fcec71` |

  Legal pages and `voice-orbit.webp` also matched byte-for-byte. The live
  deployment therefore is the candidate; this is not a stale-deploy failure.

## Defects

### High

1. **The advertised one-time purchase cannot be started.** A production GET
   to `https://api.sociobot.in/api/v1/products/personal-vocab-loop/checkout`
   returned HTTP 404 with
   `{"error":"enabled factory product","status":404}`. The prominent
   “Unlock Plus for $12” action leads to this endpoint, so purchase is broken.

2. **The required API rate limit is absent or ineffective.** I sent 200 rapid
   GETs to the production product verification endpoint in 20 concurrent
   batches of 10, using an invalid test token. All 200 returned HTTP 200; no
   429 and no `Retry-After` were observed. Threshold observed: **greater than
   200 requests (not reached)**. This fails the explicit acceptance contract.

3. **Existing PWA installations cannot update to this candidate.** The parent
   (`16e7579`) and candidate have different `/assets/app.js` hashes but an
   identical `/sw.js` hash and the same `vocab-loop-v2` cache. In an exact
   parent-to-candidate server-switch simulation, `registration.update()`
   produced 0 `updatefound` events, no installing/waiting worker, and both
   `fetch('/assets/app.js')` and reload continued to return the parent cached
   bundle. The candidate's only change—update feedback—is therefore not
   delivered to existing installations.

### Medium

4. **Whitespace-only required values create an empty phrase.** Native empty
   validation works, but entering spaces for both required fields saves a card
   whose trimmed word and sentence are empty. Required values need validation
   after trimming.

5. **The mobile hero is distorted and hides the job/action below the fold.**
   At 390 px, the square 640×640 image rendered about 321×640 because CSS
   changes width without `height:auto`. Lighthouse flagged incorrect aspect
   ratio and low effective resolution. In the 844 px first viewport, only the
   navigation and artwork are visible; the heading and capture action start
   below it.

6. **Several mobile controls fail the 44×44 px target requirement.** Measured
   examples at 390 px: brand link 98×18, theme buttons 40 px high, and footer /
   legal links about 19 px high. Primary-nav gaps are 4 px, below the required
   8 px. The library play/delete controls are also styled to a 40 px minimum.

### Low

7. **Forms intended to be hidden are visible on Settings.** The
   `.inline-form { display:grid }` rule overrides the browser's `[hidden]`
   rule, so the encrypted
   export passphrase and encrypted-import unlock forms appear before their
   triggering actions/files. This adds confusing, inactive state to the page.

8. **Deployment hardening/caching is incomplete.** Responses have HSTS,
   `nosniff`, a strict-origin referrer policy, Brotli support, ETags, and return
   304 for matching ETags. They do not include CSP, `Permissions-Policy`,
   frame-embedding protection, COOP, or CORP. All assets use the same
   `public, must-revalidate, max-age=30` policy and stable filenames rather
   than immutable hashed asset caching. The manifest is served as
   `application/octet-stream`; Chromium nevertheless parsed it and reported
   no installability errors.

## Functional and boundary coverage

- Passed representative capture with word, personal sentence, and context;
  IndexedDB state survived reload.
- Passed blind recall with keyboard Space reveal, “Need another pass” returning
  tomorrow, and successful recall advancing to three days.
- Passed empty search and recovery, delete cancel/confirm, and HTML/script-like
  input escaping (no injected nodes or execution).
- `maxlength` boundaries were enforced at 90 / 500 / 40 characters.
- With a fake microphone device and explicit permission, recording stopped
  automatically after about 10.36 seconds and persisted with the phrase.
  Permission denial produced a recoverable message and still allowed capture.
- JSON and CSV export passed. AES-GCM encrypted export omitted plaintext.
  Plain and encrypted imports restored cleared data; malformed JSON and wrong
  passphrase errors were shown and recovery succeeded.
- License URL capture stored `sb_license:personal-vocab-loop`, stripped the
  token from the URL, verified once, and reused the under-one-day cached
  verdict on reload. Invalid restore showed the free-loop recovery message.
- Privacy passed at first load: only same-origin requests, no analytics,
  third-party scripts, or remote fonts. Phrase/voice data remained in
  IndexedDB; the Sociobot verification call occurred only after a license was
  supplied.

## PWA, accessibility, responsive, and performance

- Live Chromium reported a valid manifest, no installability errors, an active
  controlling service worker, and a successful offline reload after initial
  installation. Update behavior fails as documented above.
- Desktop and 390×844 mobile had no console errors, page errors, horizontal
  overflow, or unexpected outbound requests. Body text was 16 px and reduced
  motion removed the looping animation.
- Keyboard smoke test passed skip-link order, visible 3 px focus indication,
  capture/review controls, and Space reveal. Semantic checks passed title,
  `lang=en`, one `main`, one `h1`, labels, and image alt text.
- Axe serious/critical: 0 on empty library, capture, and settings in night;
  0 on settings in light; 0 on the live mobile home.
- Lighthouse 12.8.2 mobile on the live URL: Performance **95**,
  Accessibility **100**, Best Practices **93**, SEO **100**. FCP 771 ms,
  LCP 1,054 ms, CLS 0, TBT 249 ms, total transfer 39,917 B. The 93 result
  includes the distorted/resolution-mismatched mobile hero. Lab INP was not
  available; TBT is recorded rather than misreported as INP.
- Sign-in, backend health/concurrency/persistence, and library/CLI consumer
  installation are not applicable: this is a static, account-free PWA. The
  only server endpoint in product scope is the Sociobot license integration,
  tested above.

## Release decision

Do not promote this candidate as complete. At minimum, enable/fix the
production checkout product, enforce and expose rate limiting, and ship a
genuinely versioned service worker/cache that migrates existing clients. Then
fix trimmed validation and the responsive/accessibility issues and rerun this
verification from a new candidate SHA.
