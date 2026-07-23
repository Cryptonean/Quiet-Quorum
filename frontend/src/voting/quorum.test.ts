import { describe, expect, it } from 'vitest';
import { evaluateQuorum } from './quorum.js';

describe('evaluateQuorum', () => {
  it('accepts an exact absolute quorum boundary', () => {
    const result = evaluateQuorum(
      { yes: 3n, no: 1n, abstain: 1n },
      8n,
      { kind: 'absolute', minimum: 5n },
    );
    expect(result).toEqual({ participation: 5n, met: true });
  });

  it('evaluates percentage quorum with integer arithmetic', () => {
    const result = evaluateQuorum(
      { yes: 3n, no: 1n, abstain: 0n },
      10n,
      { kind: 'percentage', numerator: 1n, denominator: 2n },
    );
    expect(result.met).toBe(false);
  });

  it('rejects participation greater than the eligible total', () => {
    expect(() =>
      evaluateQuorum(
        { yes: 4n, no: 4n, abstain: 1n },
        8n,
        { kind: 'absolute', minimum: 5n },
      ),
    ).toThrow('participation cannot exceed eligibleTotal');
  });
});
