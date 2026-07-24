# Level 4 Submission Checklist

## Repository

- [x] `contract/`, `frontend/`, `docs/`, `.github/` structure
- [x] 15+ meaningful conventional commits (verify with `git log --oneline`)
- [x] Compact Core MVP circuits compile via `pnpm build:zk`
- [x] Unit tests for quorum, nullifier, membership, errors, transitions
- [x] CI workflow present and green locally via `pnpm verify`

## Product

- [x] Lace/1AM connect/disconnect UI
- [x] Loading / error / recovery states
- [x] Privacy panel + README privacy model
- [ ] Preview contract address recorded in README
- [ ] Hosted demo URL recorded in README
- [ ] Product X profile linked in README
- [ ] Demo video linked in README / submission form

## Privacy honesty

- [x] No cleartext ballot submission path
- [x] Nullifier spent path never invents a replacement nullifier
- [x] Running-tally leakage documented
- [x] Advanced features not marked done unless Preview-demoable
