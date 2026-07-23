import { describe, expect, it } from 'vitest';
import {
  bytesEqual,
  deriveNullifier,
  leafCommit,
  ownerCommitment,
  padDomain,
} from './canonical.js';

describe('canonical hashing', () => {
  it('pads domain tags into exactly 32 bytes', () => {
    const padded = padDomain('dao-vote:nullifier:v1');
    expect(padded).toHaveLength(32);
    expect(new TextDecoder().decode(padded.slice(0, 21))).toBe('dao-vote:nullifier:v1');
  });

  it('derives deterministic nullifiers that are proposal-scoped', () => {
    const secret = new Uint8Array(32).fill(9);
    const proposalA = new Uint8Array(32).fill(1);
    const proposalB = new Uint8Array(32).fill(2);
    const first = deriveNullifier(secret, proposalA);
    expect(first).toEqual(deriveNullifier(secret, proposalA));
    expect(bytesEqual(first, deriveNullifier(secret, proposalB))).toBe(false);
  });

  it('keeps owner and leaf commitments distinct under domain separation', () => {
    const secret = new Uint8Array(32).fill(3);
    const salt = new Uint8Array(32).fill(4);
    expect(bytesEqual(ownerCommitment(secret), leafCommit(secret, salt))).toBe(false);
  });
});
