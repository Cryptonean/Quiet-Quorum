import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum ProposalStatus { None = 0,
                             Draft = 1,
                             Active = 2,
                             Closed = 3,
                             Passed = 4,
                             Failed = 5,
                             QuorumFail = 6,
                             Cancelled = 7
}

export enum Ballot { Yes = 0, No = 1, Abstain = 2 }

export type Witnesses<PS> = {
  administratorSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  voterSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  leafSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  pathSiblings(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array[]];
  pathBits(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean[]];
  ballotChoice(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Ballot];
}

export type ImpureCircuits<PS> = {
  registerVoterRoot(context: __compactRuntime.CircuitContext<PS>,
                    root_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array,
                 digest_0: Uint8Array,
                 openSlot_0: bigint,
                 closeSlot_0: bigint,
                 eligible_0: bigint,
                 quorumMin_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  openProposal(context: __compactRuntime.CircuitContext<PS>,
               proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castVote(context: __compactRuntime.CircuitContext<PS>,
           proposalId_0: Uint8Array,
           slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeProposal(context: __compactRuntime.CircuitContext<PS>,
                proposalId_0: Uint8Array,
                slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>,
                   proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancelProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerVoterRoot(context: __compactRuntime.CircuitContext<PS>,
                    root_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array,
                 digest_0: Uint8Array,
                 openSlot_0: bigint,
                 closeSlot_0: bigint,
                 eligible_0: bigint,
                 quorumMin_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  openProposal(context: __compactRuntime.CircuitContext<PS>,
               proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castVote(context: __compactRuntime.CircuitContext<PS>,
           proposalId_0: Uint8Array,
           slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeProposal(context: __compactRuntime.CircuitContext<PS>,
                proposalId_0: Uint8Array,
                slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>,
                   proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancelProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  registerVoterRoot(context: __compactRuntime.CircuitContext<PS>,
                    root_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array,
                 digest_0: Uint8Array,
                 openSlot_0: bigint,
                 closeSlot_0: bigint,
                 eligible_0: bigint,
                 quorumMin_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  openProposal(context: __compactRuntime.CircuitContext<PS>,
               proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  castVote(context: __compactRuntime.CircuitContext<PS>,
           proposalId_0: Uint8Array,
           slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeProposal(context: __compactRuntime.CircuitContext<PS>,
                proposalId_0: Uint8Array,
                slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>,
                   proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancelProposal(context: __compactRuntime.CircuitContext<PS>,
                 proposalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly owner: Uint8Array;
  readonly voterRoot: Uint8Array;
  proposalStatus: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): ProposalStatus;
    [Symbol.iterator](): Iterator<[Uint8Array, ProposalStatus]>
  };
  contentDigest: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  opensAt: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  closesAt: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  eligibleTotal: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  quorumMinimum: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  yesVotes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { read(): bigint }
  };
  noVotes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { read(): bigint }
  };
  abstainVotes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { read(): bigint }
  };
  spentNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): {
      isEmpty(): boolean;
      size(): bigint;
      member(elem_0: Uint8Array): boolean;
      [Symbol.iterator](): Iterator<Uint8Array>
    }
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
