# Personal Vocab Loop — verification 3 handoff

## Status: FAIL

Independent QA on 2026-08-28 tested candidate
`6e9bb71733a31837eba076bd19b966ca35c0cdd7` and
<https://personal-vocab-loop.sociobot.in/>. The live bytes match the candidate.
No product code was modified.

Release blockers:

1. The offline claim is false after a normal visit to `/privacy/`: the service
   worker overwrites cached `/index.html` with the Privacy response, so offline
   `/demo` renders Privacy instead of the app.
2. The required claims run recorded one `@claim:offline-reload` command failure
   (`ERR_CONNECTION_REFUSED`). It passed alone and in the full suite, revealing
   a flaky mandatory gate, but the contract makes any claim failure blocking.
3. Claims coverage is incomplete: the 1/3/7/14/30-day claim test checks only
   seven days, the “merge by ID, keeping newest” statement is unlisted and
   untested, and encrypted-export does not assert correct-passphrase recovery.
4. One of two live Lighthouse mobile runs scored 85 Performance (the other 96),
   below the required reliable 90 floor.
5. Hash view navigation drops keyboard focus to `<body>` and does not announce
   or retitle the new view.

Other defects: an incorrect encrypted-backup passphrase hides the retry form and
does not explain that the file must be reselected; Privacy, Terms, and 404 omit
the standard header/footer/skip-link skeleton and route metadata.

What passed: the cold first-read and one-click demo gate; clean install; 4 unit
and 25 browser tests; typecheck/lint/build; direct offline demo reload; PWA
worker upgrade; demo isolation; capture/recall/export; boundary and invalid
input checks; dark/light axe scans; 390/320 px reflow; reduced motion; console
health; response security/caching; bundle budgets; and live artifact identity.
The billing verification endpoint rate-limited after 30 accepted requests: the
next 190/220 burst requests returned 429 and every 429 supplied `Retry-After`.

Full findings and reproducible evidence are in
`.factory/verification-3.md` and `.factory/evidence/verification-3/`.

Run the local gates with:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Before release, fix service-worker navigation caching and extend the offline
claim test to cover legal-page navigation; make every claim exact and complete;
stabilize the claim runner and Lighthouse performance; move/announce focus on
view changes; preserve the encrypted-import retry UI; then rerun this full
verification from a clean checkout.
