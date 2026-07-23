import { describe, expect, it } from 'vitest';
import { ProposalStatus } from '../generated/index.js';
import { mapProposalStatus, projectProposal, tallyDelta } from './tally.js';

describe('tally projections', () => {
  it('maps Compact proposal statuses into UI statuses', () => {
    expect(mapProposalStatus(ProposalStatus.Active)).toBe('active');
    expect(mapProposalStatus(ProposalStatus.QuorumFail)).toBe('quorum-fail');
    expect(mapProposalStatus(ProposalStatus.Passed)).toBe('passed');
  });

  it('projects ledger views without private witness fields', () => {
    const proposal = projectProposal({
      id: new Uint8Array(32).fill(1),
      status: ProposalStatus.Active,
      contentDigest: new Uint8Array(32).fill(2),
      opensAt: 10n,
      closesAt: 20n,
      eligibleTotal: 4n,
      quorumMinimum: 2n,
      yes: 1n,
      no: 0n,
      abstain: 1n,
    });
    expect(proposal.mode).toBe('equal');
    expect(proposal.tallies).toEqual({ yes: 1n, no: 0n, abstain: 1n });
    expect(Object.keys(proposal).join(',')).not.toMatch(/secret|path|salt/i);
  });

  it('computes tally deltas for refresh UX', () => {
    expect(
      tallyDelta({ yes: 1n, no: 0n, abstain: 0n }, { yes: 1n, no: 1n, abstain: 0n }),
    ).toEqual({ yes: 0n, no: 1n, abstain: 0n });
  });
});
