import { describe, expect, it } from 'vitest';
import { assertProposalTransition, canTransitionProposal } from './proposalState.js';

describe('proposal lifecycle', () => {
  it('allows draft to active and active to closed', () => {
    expect(canTransitionProposal('draft', 'active')).toBe(true);
    expect(canTransitionProposal('active', 'closed')).toBe(true);
  });

  it('does not allow finalized proposals to reopen', () => {
    expect(canTransitionProposal('passed', 'active')).toBe(false);
    expect(() => assertProposalTransition('failed', 'active')).toThrow(
      'invalid proposal transition',
    );
  });
});
