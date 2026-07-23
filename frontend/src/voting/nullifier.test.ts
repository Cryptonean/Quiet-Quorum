import { describe, expect, it } from 'vitest';
import { buildNullifierPreimage } from './nullifier.js';

describe('buildNullifierPreimage', () => {
  const secret = new Uint8Array(32).fill(7);

  it('is deterministic for one voter and proposal', () => {
    const proposal = new Uint8Array(32).fill(1);
    expect(buildNullifierPreimage(secret, proposal)).toEqual(
      buildNullifierPreimage(secret, proposal),
    );
  });

  it('is proposal scoped', () => {
    const first = buildNullifierPreimage(secret, new Uint8Array(32).fill(1));
    const second = buildNullifierPreimage(secret, new Uint8Array(32).fill(2));
    expect(first).not.toEqual(second);
  });

  it('rejects malformed secret and proposal identifiers', () => {
    expect(() => buildNullifierPreimage(new Uint8Array(31), new Uint8Array(32))).toThrow(
      'voterSecret must be 32 bytes',
    );
    expect(() => buildNullifierPreimage(secret, new Uint8Array(31))).toThrow(
      'proposalId must be 32 bytes',
    );
  });
});
