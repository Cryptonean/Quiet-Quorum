import { describe, expect, it } from 'vitest';
import { buildVoterTree, getMerklePath } from '../browser-circuit/tree.js';
import { deriveNullifier } from '../browser-circuit/canonical.js';
import { assertLocallyEligible } from './eligibility.js';
import type { Proposal } from './types.js';
import { VotingAppError } from './errors.js';

const voters = [
  { secret: new Uint8Array(32).fill(1), salt: new Uint8Array(32).fill(11) },
  { secret: new Uint8Array(32).fill(2), salt: new Uint8Array(32).fill(12) },
];

const proposal: Proposal = {
  id: '01'.repeat(32),
  contentDigest: 'ab'.repeat(32),
  opensAt: 10n,
  closesAt: 100n,
  mode: 'equal',
  status: 'active',
  quorum: { kind: 'absolute', minimum: 1n },
  eligibleTotal: 2n,
  tallies: { yes: 0n, no: 0n, abstain: 0n },
};

describe('assertLocallyEligible', () => {
  it('accepts a member credential inside the voting window', () => {
    const tree = buildVoterTree(voters);
    const path = getMerklePath(tree, 0);
    const proposalId = new Uint8Array(32).fill(1);
    expect(() =>
      assertLocallyEligible({
        proposal,
        credential: { secret: voters[0].secret, salt: voters[0].salt, path },
        voterRoot: tree.root,
        currentSlot: 50n,
        choice: 'yes',
        derivedNullifier: deriveNullifier(voters[0].secret, proposalId),
      }),
    ).not.toThrow();
  });

  it('rejects non-members and spent nullifiers', () => {
    const tree = buildVoterTree(voters);
    const path = getMerklePath(tree, 0);
    const outsider = {
      secret: new Uint8Array(32).fill(9),
      salt: new Uint8Array(32).fill(19),
    };
    const proposalId = new Uint8Array(32).fill(1);
    const nullifier = deriveNullifier(voters[0].secret, proposalId);

    expect(() =>
      assertLocallyEligible({
        proposal,
        credential: { secret: outsider.secret, salt: outsider.salt, path },
        voterRoot: tree.root,
        currentSlot: 50n,
        choice: 'yes',
        derivedNullifier: deriveNullifier(outsider.secret, proposalId),
      }),
    ).toThrow(VotingAppError);

    expect(() =>
      assertLocallyEligible({
        proposal,
        credential: { secret: voters[0].secret, salt: voters[0].salt, path },
        voterRoot: tree.root,
        currentSlot: 50n,
        choice: 'yes',
        derivedNullifier: nullifier,
        spentNullifier: nullifier,
      }),
    ).toThrow(/already been used/i);
  });
});
