import type { VotingProviders } from '../providers/buildBrowserProviders.js';
import type { Proposal, VoteChoice } from './types.js';

export interface CastVoteInput {
  proposalId: string;
  choice: VoteChoice;
}

export interface VoteReceipt {
  txId: string;
  blockHeight: bigint;
}

/**
 * Contract-facing boundary for the browser application.
 *
 * Generated Compact bindings are intentionally connected after the focused contract
 * spikes pass. Keeping the boundary now prevents wallet/session code from owning
 * governance rules.
 */
export class DaoVotingClient {
  constructor(private readonly providers: VotingProviders) {}

  async listProposals(): Promise<Proposal[]> {
    void this.providers;
    throw new Error('Voting contract bindings are not connected yet.');
  }

  async castVote(_input: CastVoteInput): Promise<VoteReceipt> {
    throw new Error('castVote is blocked until membership and private-ballot circuits pass.');
  }
}
