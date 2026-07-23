import type { ProposalStatus } from './types.js';

const transitions: Readonly<Record<ProposalStatus, readonly ProposalStatus[]>> = {
  draft: ['active', 'cancelled'],
  active: ['closed', 'cancelled'],
  closed: ['passed', 'failed', 'quorum-fail'],
  passed: [],
  failed: [],
  'quorum-fail': [],
  cancelled: [],
};

export function canTransitionProposal(from: ProposalStatus, to: ProposalStatus): boolean {
  return transitions[from].includes(to);
}

export function assertProposalTransition(from: ProposalStatus, to: ProposalStatus): void {
  if (!canTransitionProposal(from, to)) {
    throw new Error(`invalid proposal transition: ${from} -> ${to}`);
  }
}
