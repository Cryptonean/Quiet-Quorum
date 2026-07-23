# Private DAO Voting on Midnight

Anonymous, credential-gated DAO ballots with a publicly verifiable result on **Midnight Preprod**.

Eligible members prove membership without revealing their identity, cast Yes / No / Abstain, and consume a proposal-specific nullifier that prevents double voting. Observers can verify proposal rules, aggregate tallies, and quorum outcomes without learning who voted or how any individual voted.

[![CI](https://github.com/OWNER/private-dao-voting-midnight/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/private-dao-voting-midnight/actions/workflows/ci.yml)

> Replace `OWNER` in the badge URL after the repository is published.

## Current status (Level 4 MVP)

This repository implements the Level 4 Core MVP:

- Compact contract with membership + nullifier + Yes/No/Abstain + finalize/quorum
- Browser dApp with Lace/1AM connect, deploy/join, admin flows, and private vote proving
- Privacy model documented below and in the UI Privacy panel
- CI workflow that typechecks, tests, and builds on every push
- Workspace layout: `contract/`, `frontend/`, `docs/`, `.github/`

Still owned by the operator before submission packaging:

- Live Preprod contract address
- Hosted demo URL (Netlify/Vercel)
- Product X (Twitter) profile link
- Demo video link

## Repository layout

```text
private-dao-voting-midnight/
├── contract/
│   ├── src/dao-voting.compact
│   ├── managed/{keys,zkir,contract}
│   └── test/
├── frontend/
│   ├── src/{browser-circuit,components,hooks,voting,wallet,providers}
│   └── public/{keys,zkir}
├── docs/
├── .github/workflows/ci.yml
└── README.md
```

## Development

Requirements:

- Node.js 22+
- pnpm 10
- Compact CLI (`pragma language_version >= 0.23`) for regenerating ZK artifacts

```bash
cp .env.example .env
pnpm install
pnpm test
pnpm typecheck
pnpm dev
```

App: `http://localhost:5176`

Regenerate Compact bindings and ZK assets after circuit changes:

```bash
pnpm build:zk
```

Production frontend build:

```bash
pnpm build
```

## Demo walkthrough

1. Connect Lace or 1AM on Midnight Preprod.
2. **Deploy voting contract** (admin).
3. **Register demo voter root**.
4. **Create and open proposal**.
5. Select a demo voter credential and cast Yes / No / Abstain.
6. Confirm the public tally updates.
7. Attempt a second vote with the same credential → rejected (`NULLIFIER_SPENT`).
8. Optionally close and finalize to publish Passed / Failed / QuorumFail.

## Privacy model

### Public ledger state

- Contract address and administrator commitment
- Accepted voter Merkle root
- Proposal identifiers, content digests, open/close slots, quorum config
- Aggregate Yes / No / Abstain counters
- Proposal-specific spent nullifiers
- Final status: Passed, Failed, QuorumFail, or Cancelled

### Private witnesses

- Voter secret and leaf salt
- Merkle authentication path and leaf index bits
- Ballot choice before it is applied to a public counter branch

### What is disclosed, and to whom

| Data | Audience | Notes |
|---|---|---|
| Tallies, nullifiers, proposal rules | Everyone | Required for public auditability |
| Which counter moved / when | Everyone | Inherent to live public counters |
| Voter identity ↔ ballot mapping | Nobody | Not present in public state |
| Merkle path / voter secret | Prover only | Never logged or submitted in cleartext |

Wallet and network metadata remain outside the ZK privacy boundary.

## Environment

```bash
VITE_NETWORK_ID=preprod
# Leave unset for 1AM/ProofStation proving:
# VITE_PROOF_SERVER_URL=
# Local Docker proving with Lace:
# VITE_PROOF_SERVER_URL=http://localhost:6300
# VITE_ZK_CONFIG_BASE_URL=
# VITE_DEFAULT_CONTRACT=
```

## Deployment artifacts

| Artifact | Value |
|---|---|
| Preprod contract address | _pending deploy_ |
| Live demo | _pending Netlify/Vercel publish_ |
| CI | `.github/workflows/ci.yml` |
| Product X profile | _pending_ |
| Demo video | _pending_ |

## Documentation

- [docs/AGENT_BUILD_BRIEF.md](docs/AGENT_BUILD_BRIEF.md)
- [docs/DESIGN.md](docs/DESIGN.md)
- [docs/FLOWS.md](docs/FLOWS.md)
- [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md)

## Success narrative

> A DAO member proves they are on the approved voter list without revealing who they are, casts a private Yes/No/Abstain, and is blocked from voting twice by a proposal-specific nullifier. Anyone can verify the public tally and quorum outcome on Midnight Preprod.
