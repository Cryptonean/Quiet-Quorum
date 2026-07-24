# @dao-voting/frontend

Browser dApp for Private DAO Voting on Midnight Preview.

```bash
# from repo root
pnpm install
pnpm sync:generated
pnpm --filter @dao-voting/frontend dev
```

Key modules:

- `src/browser-circuit` — Compact-aligned hashing, N=8 Merkle tree, witnesses
- `src/voting` — governance helpers and `DaoVotingClient`
- `src/hooks/useVotingSession.ts` — deploy/join/vote session mutex
- `src/components` — Wallet, Admin, Proposal, Vote, Tally, Privacy panels
