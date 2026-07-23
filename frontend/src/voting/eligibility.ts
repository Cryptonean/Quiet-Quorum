import { bytesEqual, leafCommit } from '../browser-circuit/canonical.js';
import { reconstructRoot, type MerklePath } from '../browser-circuit/tree.js';
import type { Proposal, VoteChoice } from './types.js';
import { VotingAppError } from './errors.js';

export interface LocalCredential {
  secret: Uint8Array;
  salt: Uint8Array;
  path: MerklePath;
}

export interface EligibilityInput {
  proposal: Proposal;
  credential: LocalCredential;
  voterRoot: Uint8Array;
  currentSlot: bigint;
  choice: VoteChoice;
  spentNullifier?: Uint8Array | null;
  derivedNullifier: Uint8Array;
}

/**
 * Fast local checks only. Compact remains the security authority.
 */
export function assertLocallyEligible(input: EligibilityInput): void {
  if (input.proposal.status !== 'active') {
    throw new VotingAppError('PROPOSAL_NOT_ACTIVE');
  }
  if (input.currentSlot < input.proposal.opensAt) {
    throw new VotingAppError('VOTING_NOT_OPEN');
  }
  if (input.currentSlot >= input.proposal.closesAt) {
    throw new VotingAppError('VOTING_CLOSED');
  }
  if (!['yes', 'no', 'abstain'].includes(input.choice)) {
    throw new VotingAppError('INVALID_BALLOT');
  }

  const leaf = leafCommit(input.credential.secret, input.credential.salt);
  const root = reconstructRoot(leaf, input.credential.path);
  if (!bytesEqual(root, input.voterRoot)) {
    throw new VotingAppError('NOT_ELIGIBLE');
  }

  if (input.spentNullifier && bytesEqual(input.spentNullifier, input.derivedNullifier)) {
    throw new VotingAppError('NULLIFIER_SPENT');
  }
}
