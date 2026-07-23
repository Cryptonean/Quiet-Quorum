import { describe, expect, it } from 'vitest';
import { bytesEqual } from '../browser-circuit/canonical.js';
import { buildVoteNullifier } from './nullifier.js';

describe('buildVoteNullifier', () => {
  const secret = new Uint8Array(32).fill(7);

  it('is deterministic for one voter and proposal', () => {
    const proposal = new Uint8Array(32).fill(1);
    expect(buildVoteNullifier(secret, proposal)).toEqual(
      buildVoteNullifier(secret, proposal),
    );
  });

  it('is proposal scoped', () => {
    const first = buildVoteNullifier(secret, new Uint8Array(32).fill(1));
    const second = buildVoteNullifier(secret, new Uint8Array(32).fill(2));
    expect(bytesEqual(first, second)).toBe(false);
  });

  it('rejects malformed secret and proposal identifiers', () => {
    expect(() => buildVoteNullifier(new Uint8Array(31), new Uint8Array(32))).toThrow(
      'voterSecret must be 32 bytes',
    );
    expect(() => buildVoteNullifier(secret, new Uint8Array(31))).toThrow(
      'proposalId must be 32 bytes',
    );
  });
});
