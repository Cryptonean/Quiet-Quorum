import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import {
  Ballot,
  type Ledger,
  type Witnesses,
} from '../generated/index.js';
import type { VoteChoice } from '../voting/types.js';
import { TREE_DEPTH, assertBytes32 } from './canonical.js';

export interface VotingPrivateState {
  administratorSecret: Uint8Array;
  voterSecret: Uint8Array;
  leafSalt: Uint8Array;
  pathSiblings: Uint8Array[];
  pathBits: boolean[];
  ballotChoice: Ballot;
}

export interface WitnessBundle {
  administratorSecret: Uint8Array;
  voterSecret: Uint8Array;
  leafSalt: Uint8Array;
  pathSiblings: Uint8Array[];
  pathBits: boolean[];
  ballotChoice: VoteChoice;
}

export function voteChoiceToBallot(choice: VoteChoice): Ballot {
  switch (choice) {
    case 'yes':
      return Ballot.Yes;
    case 'no':
      return Ballot.No;
    case 'abstain':
      return Ballot.Abstain;
    default: {
      const _exhaustive: never = choice;
      throw new Error(`invalid ballot: ${_exhaustive}`);
    }
  }
}

export function createPrivateState(bundle: WitnessBundle): VotingPrivateState {
  assertBytes32(bundle.administratorSecret, 'administratorSecret');
  assertBytes32(bundle.voterSecret, 'voterSecret');
  assertBytes32(bundle.leafSalt, 'leafSalt');
  if (bundle.pathSiblings.length !== TREE_DEPTH) {
    throw new Error(`pathSiblings must have length ${TREE_DEPTH}`);
  }
  if (bundle.pathBits.length !== TREE_DEPTH) {
    throw new Error(`pathBits must have length ${TREE_DEPTH}`);
  }
  for (const sibling of bundle.pathSiblings) {
    assertBytes32(sibling, 'pathSibling');
  }

  return {
    administratorSecret: bundle.administratorSecret,
    voterSecret: bundle.voterSecret,
    leafSalt: bundle.leafSalt,
    pathSiblings: bundle.pathSiblings,
    pathBits: bundle.pathBits,
    ballotChoice: voteChoiceToBallot(bundle.ballotChoice),
  };
}

export function emptyPrivateState(administratorSecret: Uint8Array = new Uint8Array(32)): VotingPrivateState {
  return createPrivateState({
    administratorSecret: Uint8Array.from(administratorSecret),
    voterSecret: new Uint8Array(32),
    leafSalt: new Uint8Array(32),
    pathSiblings: Array.from({ length: TREE_DEPTH }, () => new Uint8Array(32)),
    pathBits: Array.from({ length: TREE_DEPTH }, () => false),
    ballotChoice: 'yes',
  });
}

export function makeWitnesses(): Witnesses<VotingPrivateState> {
  return {
    administratorSecret: (
      context: WitnessContext<Ledger, VotingPrivateState>,
    ): [VotingPrivateState, Uint8Array] => [
      context.privateState,
      context.privateState.administratorSecret,
    ],
    voterSecret: (
      context: WitnessContext<Ledger, VotingPrivateState>,
    ): [VotingPrivateState, Uint8Array] => [context.privateState, context.privateState.voterSecret],
    leafSalt: (
      context: WitnessContext<Ledger, VotingPrivateState>,
    ): [VotingPrivateState, Uint8Array] => [context.privateState, context.privateState.leafSalt],
    pathSiblings: (
      context: WitnessContext<Ledger, VotingPrivateState>,
    ): [VotingPrivateState, Uint8Array[]] => [
      context.privateState,
      context.privateState.pathSiblings,
    ],
    pathBits: (
      context: WitnessContext<Ledger, VotingPrivateState>,
    ): [VotingPrivateState, boolean[]] => [context.privateState, context.privateState.pathBits],
    ballotChoice: (
      context: WitnessContext<Ledger, VotingPrivateState>,
    ): [VotingPrivateState, Ballot] => [context.privateState, context.privateState.ballotChoice],
  };
}
