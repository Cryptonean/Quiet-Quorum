import { describe, expect, it } from 'vitest';
import { mapVotingError } from './errors.js';

describe('mapVotingError', () => {
  it('maps Compact assert strings to stable codes', () => {
    expect(mapVotingError(new Error('nullifier spent')).code).toBe('NULLIFIER_SPENT');
    expect(mapVotingError(new Error('not eligible')).code).toBe('NOT_ELIGIBLE');
    expect(mapVotingError(new Error('proposal not active')).code).toBe('PROPOSAL_NOT_ACTIVE');
    expect(mapVotingError(new Error('voting closed')).code).toBe('VOTING_CLOSED');
  });

  it('keeps unknown errors sanitized', () => {
    const mapped = mapVotingError(new Error('weird provider failure xyz'));
    expect(mapped.code).toBe('UNKNOWN');
    expect(mapped.message).not.toMatch(/secret|path|ballot/i);
  });
});
