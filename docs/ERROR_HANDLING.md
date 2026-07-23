# Error Handling and Recovery

## Principles

1. Fail before wallet approval when local validation can identify the problem.
2. Contract assertions remain the security authority.
3. Never silently retry a vote after submission may have succeeded.
4. Distinguish recoverable wallet/network failures from definitive contract rejection.
5. Clear busy state in `finally`.
6. Log only public identifiers and sanitized error metadata.

## Error catalog

| Code | Situation | User message | Recovery |
|---|---|---|---|
| `WALLET_NOT_FOUND` | Lace/1AM is unavailable | No Midnight wallet was detected. | Install/enable a supported wallet and refresh. |
| `WALLET_REJECTED` | User declines connection or transaction | The wallet request was cancelled. | Retry when ready; do not auto-retry. |
| `WRONG_NETWORK` | Wallet and app networks differ | Switch the wallet to the configured Midnight network. | Switch network or update `.env`, then reconnect. |
| `WALLET_BUSY` | Another operation is active | Another wallet action is still running. | Wait; after timeout disconnect and reconnect. |
| `DUST_INSUFFICIENT` | Transaction cannot be balanced | The wallet does not have enough DUST. | Fund DUST or use an available sponsored proving path. |
| `PROVER_UNAVAILABLE` | No ProofStation/local prover | No compatible proof provider is available. | Use 1AM/ProofStation or configure local Docker proving. |
| `PROOF_TIMEOUT` | Proof generation exceeds limit | Proof generation timed out; submission was not confirmed. | Check prover health, refresh ledger, then retry once. |
| `SUBMISSION_UNKNOWN` | Network failed after submit began | Submission status is unknown. | Refresh ledger/nullifier before retrying to avoid a duplicate. |
| `CONTRACT_NOT_FOUND` | Invalid/stale address | The voting contract could not be found. | Check address/network or deploy a new contract. |
| `VERIFIER_MISMATCH` | Address belongs to older ZK build | This contract uses different circuit keys. | Clear stored contract and deploy/join a compatible address. |
| `PROPOSAL_NOT_ACTIVE` | Draft, closed, or cancelled | This proposal is not accepting votes. | Refresh proposal and choose an active proposal. |
| `VOTING_NOT_OPEN` | Before opening slot | Voting has not opened yet. | Show opening time; do not submit. |
| `VOTING_CLOSED` | Closing slot passed | Voting for this proposal has closed. | Refresh and display finalization state. |
| `NOT_ELIGIBLE` | Membership/rule proof fails | Your credential does not satisfy this proposal's rules. | Select another local credential or contact its issuer. |
| `NULLIFIER_SPENT` | Credential already voted | This credential has already been used for this proposal. | Refresh the tally; never generate a replacement nullifier. |
| `INVALID_BALLOT` | Choice outside enum | Select Yes, No, or Abstain. | Correct local input. |
| `INVALID_WEIGHT` | Weight/path mismatch | The voting-weight credential is invalid for this proposal. | Reload credential data; issuer may need to republish root. |
| `ISSUER_NOT_ACCEPTED` | Root outside policy | This credential issuer is not accepted. | Use an accepted credential. |
| `RULES_CHANGED` | Client cache differs from ledger | Proposal rules changed before activation or local data is stale. | Reload proposal and rebuild witness. |
| `QUORUM_NOT_MET` | Finalized below quorum | The proposal did not meet quorum. | Display as a valid final outcome, not a technical error. |
| `DELEGATION_SPENT` | Capability already consumed | This delegation has already been used. | Refresh state; do not retry with the same capability. |
| `DELEGATION_CHAINED` | Re-delegation attempted | Delegation chains are not supported. | Cast directly as the registered delegate. |
| `AUDIT_BUNDLE_INVALID` | Digest/schema mismatch | The audit bundle failed integrity checks. | Reject it and regenerate from anchored state. |

## Submission uncertainty

The most dangerous recovery case is a transport error after a transaction may have reached the network:

1. Stop automatic retries.
2. Refresh the proposal and query the derived nullifier.
3. If the nullifier is spent, treat the vote as accepted and show updated state.
4. If it is not spent and the wallet reports no transaction, allow one explicit retry.
5. If state remains uncertain, show the transaction identifier and ask the user to wait for indexer convergence.

## Error mapping

Implemented in `frontend/src/voting/errors.ts` as `mapVotingError()` / `VotingAppError`.

Low-level wallet, provider, and Compact errors are normalized into the codes above. Known contract assertion messages map directly:

- `nullifier spent` → `NULLIFIER_SPENT`
- `not eligible` or `membership mismatch` → `NOT_ELIGIBLE`
- `proposal not active` → `PROPOSAL_NOT_ACTIVE`
- `voting closed` or `slot outside window` → `VOTING_CLOSED`
- `weight mismatch` → `INVALID_WEIGHT`
- `issuer not accepted` → `ISSUER_NOT_ACCEPTED`

Unknown errors retain a sanitized message and correlation ID. Raw witness data must never be included in console output or telemetry.

## Retry policy

- Wallet discovery/readiness: manual refresh or bounded polling.
- Contract read/indexer lag: bounded exponential retry.
- Proof generation: no automatic retry after timeout without checking nullifier state.
- Transaction balancing transient error: one bounded retry when no submission occurred.
- Contract assertion: never retry unchanged input.
- Verifier mismatch: never retry; clear incompatible address.

## UI requirements

- Buttons are disabled while the relevant mutex is active.
- Long operations display the current stage: building witness, proving, awaiting wallet approval, submitting, or confirming.
- Every error includes one recommended next action.
- Successful vote display includes a transaction ID and the refreshed aggregate, not the private ballot.
- Disconnect always clears in-memory credential witnesses and providers.
