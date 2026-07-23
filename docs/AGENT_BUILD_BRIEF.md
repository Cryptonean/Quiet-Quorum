# Agent Build Brief — Private DAO Voting on Midnight

**Give this file to the agent working in `/Volumes/Extreme SSD/PROJEECTS/private-dao-voting-midnight`.**

This is the authoritative handoff for continuing implementation. Read it fully before writing code. Then read:

1. [DESIGN.md](./DESIGN.md) — architecture, privacy, security, Compact support status
2. [FLOWS.md](./FLOWS.md) — end-to-end user/contract flows and state machines
3. [ERROR_HANDLING.md](./ERROR_HANDLING.md) — error catalog, retry policy, recovery
4. [README.md](../README.md) — current status and commands

Related prior work (reference only, do not merge the monorepo into this repo):

- `/Volumes/Extreme SSD/PROJEECTS/midnight-project/packages/por-browser` — proven Lace/1AM + browser ZK + Vite patterns
- `/Volumes/Extreme SSD/PROJEECTS/midnight-project/docs/level4-private-dao-voting-idea.md` — Level 4 idea submission text

---

## 1. What this product is

Build a **Midnight Preprod browser dApp** for confidential DAO governance:

- Registered / credentialed members cast **Yes / No / Abstain** votes.
- Voters prove **eligibility** in zero knowledge **without revealing identity**.
- A **proposal-specific nullifier** enforces one effective vote and prevents double-voting.
- The **public ledger** shows aggregate tallies and proposal rules so anyone can verify the result.
- Observers must **not** learn who voted, how any individual voted, or the mapping from nullifier → identity.

**Category:** Identity / credentials (private eligibility credential + anonymous participation).

**Hackathon framing (Levels 4–6):**

| Level | Focus |
|---|---|
| 4 | Idea + design + scaffold (largely done) |
| 5 | Working core: membership + nullifier + equal vote + tally + quorum + demo |
| 6 | Advanced: weighted, multi-issuer, proposal rules, auditor disclosure, optional delegation |

Judges reward a **complete, honest, privacy-correct demo** more than half-built advanced features. Ship Core first.

---

## 2. What is already built (do not redo)

Standalone repo already exists and validates:

| Area | Status | Paths |
|---|---|---|
| Project scaffold | Done | root `package.json`, Vite, Vitest, Netlify, `.env.example` |
| Design docs | Done | `docs/DESIGN.md`, `FLOWS.md`, `ERROR_HANDLING.md` |
| Wallet connect (Lace/1AM) | Done (adapted from por-browser) | `src/wallet/*`, `src/hooks/useWalletSession.ts` |
| Midnight providers | Done | `src/providers/buildBrowserProviders.ts` |
| UI shell | Done (demo, not live vote) | `src/App.tsx`, `src/styles.css` |
| Quorum / lifecycle / nullifier preimage TS | Done + tests | `src/voting/{quorum,proposalState,nullifier}*.ts` |
| Client boundary stub | Done | `src/voting/DaoVotingClient.ts` |
| Contract storage helper | Done | `src/contractStorage.ts` |
| Compact nullifier spike | Compiled successfully | `compact/dao-voting.compact` → `spikeConsumeNullifier` |
| Generated bindings / ZK assets | Generated via `pnpm build:zk` | `src/generated/`, `public/keys/`, `public/zkir/` |

Verified locally:

- `pnpm test` → 8 tests pass
- `pnpm typecheck` → clean
- `pnpm build` → Vite production build succeeds
- `pnpm build:zk` → Compact spike compiles

**Important:** The Compact file is a **spike**, not the final voting contract. The UI vote button is intentionally blocked until membership + private ballot circuits exist.

---

## 3. What you must build next (ordered)

### Phase A — Compact verification spikes (before expanding product UI)

Extend / replace the spike contract carefully. Prefer small circuits that compile and prove:

1. **Private ballot → public counters**  
   Witness chooses Yes/No/Abstain privately; exactly one public counter increments by 1. Do not leak the choice beyond the counter delta (document that running tallies reveal which counter moved).

2. **Merkle membership**  
   Prove voter leaf ∈ approved root (prefer `HistoricMerkleTree` for live registries). Reuse hashing discipline from por-browser `browser-circuit` / Compact `persistentCommit` / `persistentHash`.

3. **Nested proposal state**  
   `Map<proposalId, …>` holding per-proposal nullifier `Set`, tallies, config, status.

4. **Only after A1–A3 work:** combine into real `createProposal` / `castVote` / `finalizeProposal`.

Do **not** claim private weighted tallies via `Counter.increment(weight)` — that **publishes weight**. Use equal weight `increment(1)` for Core; for weighted later use buckets or sealed-until-close.

Do **not** treat Compact `disclose()` as auditor-only encryption — disclosed values are public. Auditor privacy needs off-chain encrypted bundles + on-chain digest anchor.

### Phase B — Level 5 Core product (priority)

Implement end-to-end:

1. **Compact production circuits**
   - `constructor` → admin owner commitment
   - `registerVoterRoot` / set accepted root(s) (start with **one** root)
   - `createProposal` + `openProposal`
   - `castVote(proposalId, …)` — membership + nullifier + equal-weight tally
   - `closeProposal` / `finalizeProposal` — quorum + Passed/Failed/QuorumFail

2. **TypeScript voting-core**
   - Voter Merkle tree builder + inclusion path (N=8 or N=16 for browser prover size)
   - Witness factory matching Compact witnesses
   - Nullifier derivation aligned byte-for-byte with Compact `persistentHash` domains
   - Proposal eligibility helper (local validation only; circuit is authority)

3. **DaoVotingClient**
   - `deploy`, `join`, `createProposal`, `castVote`, `finalize`, `readProposal`
   - Timeouts, retries, busy mutex patterns from por-browser `PorBrowserClient` / `usePorSession`
   - Map Compact assert strings to codes in `ERROR_HANDLING.md`

4. **Session hook**
   - Expand `useWalletSession` or add `useVotingSession` for deploy/join/vote/refresh
   - Keep wallet op mutex; clear busy in `finally`
   - On submission uncertainty: refresh nullifier state before retry

5. **UI**
   - Admin: deploy, set root, create/open proposal
   - Voter: select proposal, choose ballot, prove+submit, see public tally
   - Privacy panel: can learn / cannot learn
   - Honest empty/disabled states when ZK not ready

6. **Tests**
   - ≥3 unit tests already exist; expand to membership, double-nullifier, quorum finalize, transition guards
   - Prefer pure TS tests first; then Compact/runtime tests when bindings allow

7. **Demo artifacts**
   - Preprod deploy smoke
   - README privacy model + CI
   - Short demo script (connect → vote → refresh tally)

### Phase C — Level 6 Advanced (after Core works on Preprod)

| Feature | Build notes |
|---|---|
| Quorum (if not in B) | Absolute + percentage; finalize only |
| Weighted voting | Merkle-sum leaf weights; **do not** publish unique weights; buckets or sealed mode |
| Proposal-specific eligibility | Immutable `rulesDigest` after Active; circuit enforces |
| Multiple issuers | Fixed ≤4 roots MVP; avoid disclosing which issuer root if privacy requires it |
| Auditor selective disclosure | Off-chain encrypt aggregate bundle; on-chain digest; never identity/ballots |
| Delegated voting (stretch) | Single-level only; separate nullifiers; no chain; no self+delegate double spend |

---

## 4. Hard constraints (do not violate)

### Privacy

- Never `disclose()` voter secret, leaf index, Merkle path, or ballot enum unless product explicitly accepts that leak.
- Nullifiers are **public** by design; unlinkability depends on domain separation + secret entropy.
- Running tallies leak **which counter moved** and **when**; document this; do not pretend absolute ballot secrecy with live public counters.
- Weighted `Counter.increment(w)` leaks `w`.
- Issuer-specific disclosed roots can fingerprint which issuer was used.

### Engineering

- Keep browser prover assets within wallet/ProofStation limits (por-browser used ~18MB N=8; reject huge N=64-style provers).
- Pin Midnight packages to versions already in this `package.json` unless upgrading the whole stack intentionally.
- Compact: `pragma language_version >= 0.23`.
- After every circuit change: `pnpm build:zk`, bump/fingerprint ZK build id, do not rejoin incompatible contracts.
- Domain tags must stay consistent across TS and Compact:
  - `dao-vote:owner:v1`
  - `dao-vote:nullifier:v1`
  - Add new domains for leaves/nodes/delegation/audit — never reuse.

### Product honesty

- Do not mark Advanced/Stretch features as “done” until Preprod-demoable.
- UI must not imply a live ZK vote if only the spike exists.
- Prefer a polished Core demo over incomplete multi-issuer + delegation.

### Reuse vs rewrite

**Reuse patterns from** `midnight-project/packages/por-browser`:

- Wallet connector / readiness / health / retries
- Provider stack (proof: 1AM ProofStation or `VITE_PROOF_SERVER_URL`)
- Contract storage + ZK build id mismatch handling
- Vite WASM plugins
- Merkle/hash machinery shape

**Do not copy as product logic:**

- `proveSolvency`, solvency eligibility, liability demo trees
- PoR-specific PrivacyPanel copy
- Monorepo `@por/core` N=64 production path as the browser circuit

---

## 5. Target Compact surface (Core)

Design target (adjust after spikes; keep names stable if possible):

```text
ledger owner: Bytes<32>
ledger voterRoot: Bytes<32> | HistoricMerkleTree  # start simple
ledger proposals: Map<Bytes<32>, ProposalState>
# ProposalState conceptually includes:
#   status, opensAt, closesAt, quorum config, eligibleTotal
#   yes/no/abstain Counters
#   spentNullifiers: Set<Bytes<32>>

circuits:
  createProposal(...)
  openProposal(...)
  castVote(proposalId)     # witnesses: secret, path, choice
  closeProposal(proposalId)
  finalizeProposal(proposalId)
```

Nullifier formula (already spiked):

```text
nullifier = persistentHash([pad(32,"dao-vote:nullifier:v1"), voterSecret, proposalId])
```

Duplicate → assert `"nullifier spent"`.

---

## 6. Target TypeScript layout

```text
src/
  wallet/                 # keep; harden as needed
  providers/              # keep; circuit keys must match Compact exports
  browser-circuit/        # ADD: canonical hash, voter tree, witnesses
  voting/
    types.ts              # exists
    quorum.ts             # exists
    nullifier.ts          # exists — align with Compact hash when wiring
    proposalState.ts      # exists
    DaoVotingClient.ts    # replace stubs with real deploy/join/callTx
    eligibility.ts        # ADD
    tally.ts              # ADD if needed
  hooks/
    useWalletSession.ts   # exists
    useVotingSession.ts   # ADD
  components/             # ADD: WalletBar, ProposalPanel, VotePanel, PrivacyPanel
  App.tsx                 # wire real session
compact/dao-voting.compact
docs/                     # update when architecture decisions change
```

---

## 7. Error handling requirements

Implement the catalog in `ERROR_HANDLING.md`. Especially:

| Code | Behavior |
|---|---|
| `NULLIFIER_SPENT` | Never invent a new nullifier; show “already voted” |
| `SUBMISSION_UNKNOWN` | Refresh ledger/nullifier before any retry |
| `VERIFIER_MISMATCH` | Clear stored contract; redeploy |
| `WRONG_NETWORK` / `DUST_INSUFFICIENT` | Block before prove |
| `PROPOSAL_NOT_ACTIVE` / `VOTING_CLOSED` | Client-side guard + circuit assert |
| `QUORUM_NOT_MET` | Final outcome, not a crash |

Never log voter secrets, paths, or ballot choices.

---

## 8. Definition of done for Level 5 (Core)

- [ ] Compact contract with membership + nullifier + Yes/No/Abstain + finalize/quorum compiles via `pnpm build:zk`
- [ ] Browser can connect Lace or 1AM on Preprod
- [ ] Admin can deploy and create/open a proposal
- [ ] Eligible demo voter can cast one vote and see public tally update
- [ ] Second vote with same credential/proposal is rejected
- [ ] Non-member cannot vote
- [ ] README privacy model accurate
- [ ] Unit tests cover quorum, nullifier domain separation, membership, transitions
- [ ] Error paths for wallet busy, wrong network, nullifier spent, verifier mismatch
- [ ] No false claims that weighted/multi-issuer/delegation are live unless they are

---

## 9. Definition of done for Level 6 (Advanced)

- [ ] At least two of: weighted (safe mode), multi-issuer, proposal-specific rules, auditor bundle
- [ ] Delegation only if Core nullifiers are solid; single-level only
- [ ] Privacy caveats documented in README for every advanced mode
- [ ] Demo video / submission checklist updated

---

## 10. Commands

```bash
cd "/Volumes/Extreme SSD/PROJEECTS/private-dao-voting-midnight"
cp .env.example .env   # if needed
pnpm install
pnpm test
pnpm typecheck
pnpm build:zk          # requires Compact CLI
pnpm dev               # http://localhost:5176
pnpm build
```

Env:

- `VITE_NETWORK_ID=preprod`
- Leave `VITE_PROOF_SERVER_URL` unset for 1AM/ProofStation
- Set `VITE_PROOF_SERVER_URL=http://localhost:6300` for local Docker proving with Lace

---

## 11. Compact / Midnight facts already verified

Treat these as true unless a mechanical compile/runtime test contradicts them:

- `Set` + `member` / `insert` is the idiomatic nullifier store (election/zerocash examples).
- Merkle membership via path + `checkRoot`; prefer `HistoricMerkleTree` for registries that grow.
- Public tallies via `Counter`.
- Proposal-scoped state via nested `Map`.
- Selective disclosure in Compact = public `disclose()`, not private auditor channel.
- Multi-issuer OR, private weights, auditor encryption, and delegation are **custom protocols**, not stdlib ADTs.

---

## 12. Suggested first agent tasks (concrete)

1. Read this brief + DESIGN/FLOWS/ERROR_HANDLING.
2. Spike Compact: private choice increments exactly one of three counters; compile with `pnpm build:zk`.
3. Spike Compact: Merkle membership for N=8 voter tree; compile.
4. Merge spikes into proposal-scoped `castVote`.
5. Implement `src/browser-circuit/` tree + witnesses aligned with Compact.
6. Wire `DaoVotingClient` deploy/join/castVote using generated bindings.
7. Build `useVotingSession` + replace demo UI with real flow.
8. Expand tests; run `pnpm test && pnpm typecheck && pnpm build`.
9. Preprod smoke: deploy → open proposal → vote → double-vote fails → finalize.
10. Update README status from “scaffold” to “Level 5 core demo”.

---

## 13. Out of scope / anti-goals

- Do not rebuild the solvency PoR product inside this repo.
- Do not depend on the midnight-project monorepo at runtime.
- Do not ship a fake “anonymous” UI that submits cleartext ballots.
- Do not enable liquid democracy / multi-hop delegation.
- Do not promise sealed-bid auction or payroll features.

---

## 14. Success narrative for demos

> “A DAO member proves they are on the approved voter list without revealing who they are, casts a private Yes/No/Abstain, and is blocked from voting twice by a proposal-specific nullifier. Anyone can verify the public tally and quorum outcome on Midnight Preprod.”

Everything you build should make that sentence true with a live browser + Lace/1AM demo.
