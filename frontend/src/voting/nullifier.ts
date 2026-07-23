import { deriveNullifier } from '../browser-circuit/canonical.js';

/**
 * Compact-aligned nullifier:
 * persistentHash([pad(32, "dao-vote:nullifier:v1"), voterSecret, proposalId])
 */
export function buildVoteNullifier(
  voterSecret: Uint8Array,
  proposalId: Uint8Array,
): Uint8Array {
  return deriveNullifier(voterSecret, proposalId);
}

/**
 * @deprecated Prefer {@link buildVoteNullifier}. Kept for transitional tests that
 * only need domain-separated, proposal-scoped uniqueness without Compact hashing.
 */
export function buildNullifierPreimage(
  voterSecret: Uint8Array,
  proposalId: Uint8Array,
): Uint8Array {
  return buildVoteNullifier(voterSecret, proposalId);
}
