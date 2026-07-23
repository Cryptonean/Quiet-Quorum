export type VotingErrorCode =
  | 'WALLET_NOT_FOUND'
  | 'WALLET_REJECTED'
  | 'WRONG_NETWORK'
  | 'WALLET_BUSY'
  | 'DUST_INSUFFICIENT'
  | 'PROVER_UNAVAILABLE'
  | 'PROOF_TIMEOUT'
  | 'SUBMISSION_UNKNOWN'
  | 'CONTRACT_NOT_FOUND'
  | 'VERIFIER_MISMATCH'
  | 'PROPOSAL_NOT_ACTIVE'
  | 'VOTING_NOT_OPEN'
  | 'VOTING_CLOSED'
  | 'NOT_ELIGIBLE'
  | 'NULLIFIER_SPENT'
  | 'INVALID_BALLOT'
  | 'INVALID_WEIGHT'
  | 'ISSUER_NOT_ACCEPTED'
  | 'RULES_CHANGED'
  | 'QUORUM_NOT_MET'
  | 'DELEGATION_SPENT'
  | 'DELEGATION_CHAINED'
  | 'AUDIT_BUNDLE_INVALID'
  | 'NOT_ADMIN'
  | 'PROPOSAL_EXISTS'
  | 'PROPOSAL_MISSING'
  | 'UNKNOWN';

export interface NormalizedVotingError {
  code: VotingErrorCode;
  message: string;
  recovery: string;
  retryable: boolean;
}

const CATALOG: Record<
  VotingErrorCode,
  Pick<NormalizedVotingError, 'message' | 'recovery' | 'retryable'>
> = {
  WALLET_NOT_FOUND: {
    message: 'No Midnight wallet was detected.',
    recovery: 'Install or enable Lace/1AM and refresh the page.',
    retryable: false,
  },
  WALLET_REJECTED: {
    message: 'The wallet request was cancelled.',
    recovery: 'Retry the action when you are ready.',
    retryable: true,
  },
  WRONG_NETWORK: {
    message: 'Switch the wallet to the configured Midnight network.',
    recovery: 'Change the wallet network or update VITE_NETWORK_ID, then reconnect.',
    retryable: false,
  },
  WALLET_BUSY: {
    message: 'Another wallet action is still running.',
    recovery: 'Wait for the current action to finish, then retry.',
    retryable: true,
  },
  DUST_INSUFFICIENT: {
    message: 'The wallet does not have enough DUST.',
    recovery: 'Fund DUST or use a sponsored proving path, then retry.',
    retryable: false,
  },
  PROVER_UNAVAILABLE: {
    message: 'No compatible proof provider is available.',
    recovery: 'Use 1AM/ProofStation or configure VITE_PROOF_SERVER_URL.',
    retryable: false,
  },
  PROOF_TIMEOUT: {
    message: 'Proof generation timed out; submission was not confirmed.',
    recovery: 'Refresh ledger/nullifier state before retrying once.',
    retryable: true,
  },
  SUBMISSION_UNKNOWN: {
    message: 'Submission status is unknown.',
    recovery: 'Refresh the proposal and nullifier before any retry.',
    retryable: false,
  },
  CONTRACT_NOT_FOUND: {
    message: 'The voting contract could not be found.',
    recovery: 'Check the address/network or deploy a new contract.',
    retryable: false,
  },
  VERIFIER_MISMATCH: {
    message: 'This contract uses different circuit keys.',
    recovery: 'Clear the stored contract and deploy or join a compatible address.',
    retryable: false,
  },
  PROPOSAL_NOT_ACTIVE: {
    message: 'This proposal is not accepting votes.',
    recovery: 'Refresh proposals and choose an active proposal.',
    retryable: false,
  },
  VOTING_NOT_OPEN: {
    message: 'Voting has not opened yet.',
    recovery: 'Wait until the opening slot and refresh.',
    retryable: false,
  },
  VOTING_CLOSED: {
    message: 'Voting for this proposal has closed.',
    recovery: 'Refresh and proceed to finalization if needed.',
    retryable: false,
  },
  NOT_ELIGIBLE: {
    message: 'Your credential does not satisfy this proposal\'s rules.',
    recovery: 'Use an approved local credential or contact its issuer.',
    retryable: false,
  },
  NULLIFIER_SPENT: {
    message: 'This credential has already been used for this proposal.',
    recovery: 'Refresh the tally; never generate a replacement nullifier.',
    retryable: false,
  },
  INVALID_BALLOT: {
    message: 'Select Yes, No, or Abstain.',
    recovery: 'Correct the ballot choice and try again.',
    retryable: true,
  },
  INVALID_WEIGHT: {
    message: 'The voting-weight credential is invalid for this proposal.',
    recovery: 'Reload credential data from the issuer.',
    retryable: false,
  },
  ISSUER_NOT_ACCEPTED: {
    message: 'This credential issuer is not accepted.',
    recovery: 'Use an accepted credential for this proposal.',
    retryable: false,
  },
  RULES_CHANGED: {
    message: 'Proposal rules changed or local data is stale.',
    recovery: 'Reload the proposal and rebuild the witness.',
    retryable: true,
  },
  QUORUM_NOT_MET: {
    message: 'The proposal did not meet quorum.',
    recovery: 'Treat this as a valid final outcome, not a technical failure.',
    retryable: false,
  },
  DELEGATION_SPENT: {
    message: 'This delegation has already been used.',
    recovery: 'Refresh state; do not retry the same capability.',
    retryable: false,
  },
  DELEGATION_CHAINED: {
    message: 'Delegation chains are not supported.',
    recovery: 'Cast directly as the registered delegate.',
    retryable: false,
  },
  AUDIT_BUNDLE_INVALID: {
    message: 'The audit bundle failed integrity checks.',
    recovery: 'Reject it and regenerate from anchored ledger state.',
    retryable: false,
  },
  NOT_ADMIN: {
    message: 'Only the contract administrator can perform this action.',
    recovery: 'Connect the administrator wallet and retry.',
    retryable: false,
  },
  PROPOSAL_EXISTS: {
    message: 'A proposal with this identifier already exists.',
    recovery: 'Choose a new proposal identifier.',
    retryable: false,
  },
  PROPOSAL_MISSING: {
    message: 'The requested proposal was not found.',
    recovery: 'Refresh proposals or create a new one.',
    retryable: false,
  },
  UNKNOWN: {
    message: 'An unexpected voting error occurred.',
    recovery: 'Refresh state and retry only if the nullifier is still unspent.',
    retryable: false,
  },
};

const ASSERT_MAP: Array<{ pattern: RegExp; code: VotingErrorCode }> = [
  { pattern: /nullifier spent/i, code: 'NULLIFIER_SPENT' },
  { pattern: /not eligible|membership mismatch/i, code: 'NOT_ELIGIBLE' },
  { pattern: /proposal not active/i, code: 'PROPOSAL_NOT_ACTIVE' },
  { pattern: /voting not open/i, code: 'VOTING_NOT_OPEN' },
  { pattern: /voting closed|slot outside window/i, code: 'VOTING_CLOSED' },
  { pattern: /voting still open/i, code: 'VOTING_CLOSED' },
  { pattern: /invalid ballot/i, code: 'INVALID_BALLOT' },
  { pattern: /not admin/i, code: 'NOT_ADMIN' },
  { pattern: /proposal exists/i, code: 'PROPOSAL_EXISTS' },
  { pattern: /proposal missing/i, code: 'PROPOSAL_MISSING' },
  { pattern: /proposal not draft/i, code: 'PROPOSAL_NOT_ACTIVE' },
  { pattern: /proposal not closed/i, code: 'PROPOSAL_NOT_ACTIVE' },
  { pattern: /wrong network|network mismatch/i, code: 'WRONG_NETWORK' },
  { pattern: /dust|insufficient funds|cannot balance/i, code: 'DUST_INSUFFICIENT' },
  { pattern: /proof.*(timeout|timed out)/i, code: 'PROOF_TIMEOUT' },
  { pattern: /prover|proof provider|proofstation/i, code: 'PROVER_UNAVAILABLE' },
  { pattern: /verifier|zk build|circuit keys/i, code: 'VERIFIER_MISMATCH' },
  { pattern: /rejected|denied|cancelled by user/i, code: 'WALLET_REJECTED' },
  { pattern: /busy/i, code: 'WALLET_BUSY' },
];

export function createVotingError(code: VotingErrorCode, detail?: string): NormalizedVotingError {
  const base = CATALOG[code];
  return {
    code,
    message: detail ? `${base.message} (${detail})` : base.message,
    recovery: base.recovery,
    retryable: base.retryable,
  };
}

export function mapVotingError(error: unknown): NormalizedVotingError {
  const raw =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : 'unknown error';

  for (const entry of ASSERT_MAP) {
    if (entry.pattern.test(raw)) {
      return createVotingError(entry.code);
    }
  }

  return createVotingError('UNKNOWN', raw.slice(0, 180));
}

export class VotingAppError extends Error {
  readonly normalized: NormalizedVotingError;

  constructor(code: VotingErrorCode, detail?: string) {
    const normalized = createVotingError(code, detail);
    super(normalized.message);
    this.name = 'VotingAppError';
    this.normalized = normalized;
  }
}
