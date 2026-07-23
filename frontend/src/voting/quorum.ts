import type { QuorumRule, Tallies } from './types.js';

export interface QuorumEvaluation {
  participation: bigint;
  met: boolean;
}

export function totalParticipation(tallies: Tallies): bigint {
  return tallies.yes + tallies.no + tallies.abstain;
}

export function evaluateQuorum(
  tallies: Tallies,
  eligibleTotal: bigint,
  rule: QuorumRule,
): QuorumEvaluation {
  if (eligibleTotal < 0n) throw new Error('eligibleTotal cannot be negative');

  const participation = totalParticipation(tallies);
  if (participation < 0n) throw new Error('tallies cannot produce negative participation');
  if (participation > eligibleTotal) {
    throw new Error('participation cannot exceed eligibleTotal');
  }

  if (rule.kind === 'absolute') {
    if (rule.minimum < 0n) throw new Error('absolute quorum cannot be negative');
    return { participation, met: participation >= rule.minimum };
  }

  if (rule.denominator <= 0n) {
    throw new Error('percentage quorum denominator must be positive');
  }
  if (rule.numerator < 0n || rule.numerator > rule.denominator) {
    throw new Error('percentage quorum must be between zero and one');
  }

  return {
    participation,
    met: participation * rule.denominator >= eligibleTotal * rule.numerator,
  };
}
