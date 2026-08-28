# Claims run summary

The commands were executed in `.factory/claims.json` order after `npm ci`.

| Claim | Initial command result |
| --- | --- |
| demo-isolation | PASS |
| offline-reload | **FAIL** — exit 1, local `/demo` returned `ERR_CONNECTION_REFUSED` |
| local-only | PASS |
| account-free | PASS |
| no-analytics | PASS |
| microphone-on-action | PASS |
| license-restore | PASS |
| csv-export | PASS |
| encrypted-export | PASS |
| backup-roundtrip | PASS |
| recording-limit | PASS |
| recall-schedule | PASS |
| pwa-update | PASS |

The raw runner's final `CLAIM_FAILURE_COUNT: 0` is a shell accounting error:
the pipeline's final `echo` masked the command status. The preceding raw entry
records `@claim:offline-reload` as `1 failed` and `CLAIM_EXIT: 1`.

The exact offline command passed when rerun alone. The complete `npm test` run
also passed all 25 browser tests. Those results are preserved separately and
do not erase the initial mandatory-gate failure.
