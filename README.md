# Private DAO Voting on Midnight

Anonymous, credential-gated DAO ballots with a publicly verifiable result.

Eligible members prove membership without revealing their identity, cast Yes / No / Abstain, and consume a proposal-specific nullifier that prevents double voting. The product roadmap adds quorum, weighted voting, proposal-specific eligibility, multiple credential issuers, selective auditor disclosure, and constrained single-level delegation.

## Current status

This repository is the standalone Level 4 project scaffold.

- Agent handoff / next build plan: [docs/AGENT_BUILD_BRIEF.md](docs/AGENT_BUILD_BRIEF.md)
- Detailed architecture: [docs/DESIGN.md](docs/DESIGN.md)
- User and contract flows: [docs/FLOWS.md](docs/FLOWS.md)
- Error/recovery model: [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md)
- Browser shell with Lace/1AM detection and provider wiring
- Pure TypeScript quorum, nullifier-preimage, and proposal-state tests
- Compact nullifier-`Set` verification contract

The current Compact file is a **verification spike**, not the final voting contract. It confirms proposal-scoped nullifier consumption first. Membership, private ballot branching, nested proposal state, weighted voting, multi-issuer rules, auditor encryption, and delegation are implemented incrementally after their documented verification gates pass.

## Development

Requirements:

- Node.js 22+
- pnpm 10
- A compatible Compact CLI for `pragma language_version >= 0.23`

```bash
cp .env.example .env
pnpm install
pnpm test
pnpm typecheck
pnpm dev
```

The browser app runs at `http://localhost:5176`.

Generate contract bindings and ZK assets:

```bash
pnpm build:zk
```

## Privacy model

Observers can learn:

- proposal rules and voting window;
- aggregate Yes / No / Abstain totals;
- proposal-specific spent nullifiers;
- quorum and final result.

Observers cannot learn from the circuit state:

- voter identity or Merkle leaf index;
- private membership secret and authentication path;
- the mapping between a member and a ballot;
- which credential issuer was used when issuer-private mode is supported.

Running-tally timing and wallet/network metadata remain outside the ZK privacy boundary. Public weighted increments can reveal weight and therefore require buckets or sealed aggregation.

## Delivery order

1. Equal-weight membership + nullifier + tally
2. Proposal lifecycle and quorum
3. Weighted Merkle-sum voting
4. Proposal-specific and multi-issuer eligibility
5. Selective audit bundles
6. Single-level delegation
