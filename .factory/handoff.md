# Personal Vocab Loop — verification handoff

## Current status: FAIL — do not release candidate `52d13a373085104cc457f707709ca61ac73fad02`

Independent verification on 2026-08-28 UTC confirms that
<https://personal-vocab-loop.sociobot.in/> is byte-for-byte the requested
candidate build. This is not a deployment-only failure. No product code was
modified during verification.

Release is blocked by three acceptance-contract defects:

1. `.factory/claims.json` is missing, so required claim tests cannot be run.
2. The landing page has no “Try it with sample data” action and neither `/demo`
   nor `?demo=1` is an isolated sample-data sandbox; `.factory/demo.md` is
   missing too.
3. The advertised live $12 checkout URL returns HTTP 404
   `{"error":"enabled factory product","status":404}`.

The current source of truth is [verification-2.md](verification-2.md), which
contains exact hashes, commands, severity-ranked defects, live rate-limit
evidence, passed functional checks, and required remediation. The historical
repair notes below predate this independent verdict.

## Historical repair notes

## Finding disposition

1. **Checkout — still blocked outside this repository.** Live
   `GET https://api.sociobot.in/api/v1/products/personal-vocab-loop/checkout`
   returns HTTP 404 and `{"error":"enabled factory product","status":404}`.
   A read-only provider inventory check found no product containing “vocab” or
   “phrase”. No provider, database, DNS, or shared-backend state was changed.
2. **Verification rate limit — resolved in the shared API.** A fresh 220-request
   burst at concurrency 20 returned 31× HTTP 200 and 189× HTTP 429; all 189
   throttled responses included `Retry-After`. The client still verifies at most
   once per day and makes no billing request without a license.
3. **PWA upgrades — fixed.** JS/CSS filenames are content-hashed and the build
   emits `sw.js` with a cache name derived from emitted content. The old parent
   and failed candidate both had SW SHA-256 `fd34cd40…2942b`; the deployed worker
   is `dfa0aea7…69e9e` with cache `vocab-loop-ad8e9e399ce1e60e`. An automated
   browser test installs the exact old cache strategy, switches the server to
   the repaired build, observes update activation, reloads, and receives the new
   shell. Same-origin cache lookup ignores `Vary`, and cache writes are awaited,
   preventing the module/CSS miss found during repair.
4. **Trimmed required values — fixed.** Whitespace-only word and sentence values
   get field-specific native validation and cannot reach IndexedDB. Unit and
   browser regressions assert the message, focus, route, and zero saved records.
5. **390 px hero — fixed.** The content leads on phones; artwork renders
   200.06×200.06 px, heading bottom is 243.17 px and primary-action bottom is
   403.94 px in a 390×844 viewport. Scroll width is exactly 390 px.
6. **Touch targets — fixed.** Live 390 px measurements: brand 88.7×44 px;
   primary nav heights 44 px with 8 px gaps; footer links at least 44×44 px;
   theme controls 44 px high; library delete control 44 px high.
7. **Hidden forms — fixed.** `[hidden]` now wins over component display rules.
   Both encrypted forms are `display:none` initially; tests cover export reveal,
   encrypted-file import reveal, and focus transfer.
8. **Response policy/caching — fixed.** The repository now supplies Azure SWA
   policy for CSP, `Permissions-Policy`, `X-Frame-Options: DENY`, COOP, CORP,
   `nosniff`, and referrer policy. Live hashed JS/CSS return
   `public, max-age=31536000, immutable`; HTML and `sw.js` remain revalidated;
   the manifest is `application/manifest+json`. Legal-page inline styles were
   moved to same-origin CSS so the CSP produces no console violations.

## Verification evidence

- Clean install: `npm ci` — 57 packages, 0 audit vulnerabilities.
- Unit: `vitest run` — 4/4 assertions passed.
- Integration/browser: `playwright test` 1.58.2 — 11/11 passed in Chromium.
  Coverage includes capture/recall/persistence, whitespace validation, hidden
  forms, desktop and 390 px layout, touch targets/gaps, keyboard skip link and
  `N`, reduced motion, no-load-time third-party requests, serious/critical axe
  scans in dark and light themes, offline reload, and old-to-new SW upgrade.
- Type/lint: `npm run typecheck` and `npm run lint` passed with strict TypeScript.
- Production: `npm run build` passed and produced `dist/index.html`. Initial JS
  is 23,565 B raw / 8.55 KB gzip; CSS 10,711 B raw / 3.17 KB gzip; hero WebP
  27,418 B. Package/consumer installation is not applicable to this static PWA.
- Factory URL verifier, live desktop and live 390×844: HTTP 200, title, `lang`,
  one h1, one main, image alt, button labels, no console/page errors, and no
  horizontal overflow. Fresh first load contacted only the product origin.
- Live manifest has zero Chromium installability errors. A controlling worker
  and the expected content cache were present; `context.setOffline(true)` plus
  reload retained the complete home screen.
- Live Lighthouse 12.8.2 mobile at 2026-08-28T08:45:09Z: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s,
  TBT 10 ms, CLS 0, Speed Index 0.9 s.
- Live output is byte-identical to `dist/`: index SHA-256
  `d24ab47a…d7bf`, worker `dfa0aea7…69e9e`, JS `8b53bfbf…9f13`, CSS
  `4a954d25…31e0`.

## Run and reverify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
/opt/fleet/lib/verify-url.sh https://personal-vocab-loop.sociobot.in /tmp/pvl-evidence
```

After the factory registers the paid product, require the checkout endpoint to
return a 3xx redirect to the hosted Sociobot/Dodo checkout. Then repeat the
220-request verify burst, live checkout return/license capture, artifact hashes,
offline reload, update simulation, axe scans, and Lighthouse before promotion.
