import { ProposalStatus } from '../generated/index.js';
import { toHex } from '../browser-circuit/canonical.js';
import type { Proposal, ProposalStatus as UiStatus, Tallies } from './types.js';

export interface LedgerProposalView {
  id: Uint8Array;
  status: ProposalStatus;
  contentDigest: Uint8Array;
  opensAt: bigint;
  closesAt: bigint;
  eligibleTotal: bigint;
  quorumMinimum: bigint;
  yes: bigint;
  no: bigint;
  abstain: bigint;
}

export function mapProposalStatus(status: ProposalStatus): UiStatus {
  switch (status) {
    case ProposalStatus.Draft:
      return 'draft';
    case ProposalStatus.Active:
      return 'active';
    case ProposalStatus.Closed:
      return 'closed';
    case ProposalStatus.Passed:
      return 'passed';
    case ProposalStatus.Failed:
      return 'failed';
    case ProposalStatus.QuorumFail:
      return 'quorum-fail';
    case ProposalStatus.Cancelled:
      return 'cancelled';
    default:
      return 'draft';
  }
}

export function projectProposal(view: LedgerProposalView): Proposal {
  const tallies: Tallies = {
    yes: view.yes,
    no: view.no,
    abstain: view.abstain,
  };

  return {
    id: toHex(view.id),
    contentDigest: toHex(view.contentDigest),
    opensAt: view.opensAt,
    closesAt: view.closesAt,
    mode: 'equal',
    status: mapProposalStatus(view.status),
    quorum: { kind: 'absolute', minimum: view.quorumMinimum },
    eligibleTotal: view.eligibleTotal,
    tallies,
  };
}

export function tallyDelta(before: Tallies, after: Tallies): Tallies {
  return {
    yes: after.yes - before.yes,
    no: after.no - before.no,
    abstain: after.abstain - before.abstain,
  };
}
