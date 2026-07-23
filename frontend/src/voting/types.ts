export type VoteChoice = 'yes' | 'no' | 'abstain';
export type VotingMode = 'equal' | 'weighted';
export type ProposalStatus =
  | 'draft'
  | 'active'
  | 'closed'
  | 'passed'
  | 'failed'
  | 'quorum-fail'
  | 'cancelled';

export interface Tallies {
  yes: bigint;
  no: bigint;
  abstain: bigint;
}

export interface AbsoluteQuorum {
  kind: 'absolute';
  minimum: bigint;
}

export interface PercentageQuorum {
  kind: 'percentage';
  numerator: bigint;
  denominator: bigint;
}

export type QuorumRule = AbsoluteQuorum | PercentageQuorum;

export interface Proposal {
  id: string;
  contentDigest: string;
  opensAt: bigint;
  closesAt: bigint;
  mode: VotingMode;
  status: ProposalStatus;
  quorum: QuorumRule;
  eligibleTotal: bigint;
  tallies: Tallies;
}
