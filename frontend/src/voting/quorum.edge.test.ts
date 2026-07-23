import { describe, expect, it } from 'vitest';
import { evaluateQuorum } from './quorum.js';

describe('evaluateQuorum edge cases', () => {
  it('rejects zero percentage denominator', () => {
    expect(() =>
      evaluateQuorum(
        { yes: 1n, no: 0n, abstain: 0n },
        4n,
        { kind: 'percentage', numerator: 1n, denominator: 0n },
      ),
    ).toThrow(/denominator must be positive/);
  });

  it('treats zero participation below absolute quorum as unmet', () => {
    const result = evaluateQuorum(
      { yes: 0n, no: 0n, abstain: 0n },
      8n,
      { kind: 'absolute', minimum: 1n },
    );
    expect(result).toEqual({ participation: 0n, met: false });
  });

  it('accepts exact percentage boundary with integer math', () => {
    const result = evaluateQuorum(
      { yes: 2n, no: 2n, abstain: 0n },
      8n,
      { kind: 'percentage', numerator: 1n, denominator: 2n },
    );
    expect(result.met).toBe(true);
  });
});
