import * as CompiledContract from '@midnight-ntwrk/compact-js/effect/CompiledContract';
import {
  deployContract,
  findDeployedContract,
  getPublicStates,
} from '@midnight-ntwrk/midnight-js-contracts';
import { Contract, ProposalStatus, ledger } from '../generated/index.js';
import {
  createPrivateState,
  emptyPrivateState,
  makeWitnesses,
  type VotingPrivateState,
  type WitnessBundle,
} from '../browser-circuit/witnesses.js';
import { bytesEqual, fromHex, toHex } from '../browser-circuit/canonical.js';
import { deriveNullifier } from '../browser-circuit/canonical.js';
import type { VotingProviders } from '../providers/buildBrowserProviders.js';
import { describeLaceTxError } from '../wallet/walletReadiness.js';
import { mapVotingError, VotingAppError } from './errors.js';
import { projectProposal } from './tally.js';
import type { Proposal, VoteChoice } from './types.js';

export interface DeployResult {
  contractAddress: string;
  deployTxId: string;
  blockHeight: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deployed: any;
}

export interface TxReceipt {
  txId: string;
  blockHeight: number;
}

export interface CreateProposalInput {
  proposalId: Uint8Array;
  contentDigest: Uint8Array;
  opensAt: bigint;
  closesAt: bigint;
  eligibleTotal: bigint;
  quorumMinimum: bigint;
}

export interface CastVoteInput {
  proposalId: Uint8Array;
  choice: VoteChoice;
  slot: bigint;
  credential: {
    secret: Uint8Array;
    salt: Uint8Array;
    pathSiblings: Uint8Array[];
    pathBits: boolean[];
  };
}

const JOIN_TIMEOUT_MS = 60_000;
const CALL_TIMEOUT_MS = 300_000;
const RETRYABLE_SUBMIT_RE = /error 182|intent expired or duplicate|IntentAlreadyExists|IntentTtlExpired/i;
const CALL_RETRY_DELAY_MS = 5_000;
const CALL_MAX_ATTEMPTS = 3;

function buildCompiledContract() {
  return CompiledContract.make('dao-voting', Contract as never).pipe(
    CompiledContract.withWitnesses(makeWitnesses() as never),
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `${label} timed out after ${timeoutMs / 1000}s. Refresh ledger/nullifier state before retrying.`,
            ),
          ),
        timeoutMs,
      );
    }),
  ]);
}

function rethrowMapped(error: unknown, stage: 'deploy' | 'prove' | 'balance' | 'submit'): never {
  const lace = describeLaceTxError(error, stage);
  const normalized = mapVotingError(lace);
  const wrapped = new Error(`${normalized.code}: ${normalized.message}`);
  (wrapped as Error & { normalized: typeof normalized }).normalized = normalized;
  throw wrapped;
}

export class DaoVotingClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private deployed: any | null = null;
  private contractAddress: string | null = null;

  constructor(
    private readonly providers: VotingProviders,
    private administratorSecret: Uint8Array = new Uint8Array(32),
  ) {}

  setAdministratorSecret(secret: Uint8Array): void {
    this.administratorSecret = secret;
  }

  private async writePrivateState(state: VotingPrivateState): Promise<void> {
    await this.providers.privateStateProvider.set('votingState', state);
  }

  private adminBundle(overrides: Partial<WitnessBundle> = {}): WitnessBundle {
    return {
      administratorSecret: this.administratorSecret,
      voterSecret: overrides.voterSecret ?? new Uint8Array(32),
      leafSalt: overrides.leafSalt ?? new Uint8Array(32),
      pathSiblings:
        overrides.pathSiblings ??
        Array.from({ length: 3 }, () => new Uint8Array(32)),
      pathBits: overrides.pathBits ?? [false, false, false],
      ballotChoice: overrides.ballotChoice ?? 'yes',
    };
  }

  async deploy(): Promise<DeployResult> {
    try {
      const initial = createPrivateState(this.adminBundle());
      // Do not write private state before deploy — the address does not exist yet.
      // deployContract persists initialPrivateState after the address is known.
      const compiledContract = buildCompiledContract();
      console.info('[dao-voting] deploying voting contract…');
      const deployed = await withTimeout(
        deployContract(this.providers as never, {
          compiledContract,
          privateStateId: 'votingState',
          initialPrivateState: initial,
        } as never),
        CALL_TIMEOUT_MS,
        'Deploy',
      );

      this.deployed = deployed;
      this.contractAddress = deployed.deployTxData.public.contractAddress as string;
      this.providers.privateStateProvider.setContractAddress(this.contractAddress);
      await this.writePrivateState(initial);
      console.info(`[dao-voting] deployed at ${this.contractAddress}`);
      return {
        contractAddress: this.contractAddress,
        deployTxId: deployed.deployTxData.public.txId as string,
        blockHeight: deployed.deployTxData.public.blockHeight as number,
        deployed,
      };
    } catch (error) {
      rethrowMapped(error, 'deploy');
    }
  }

  async join(contractAddress: string): Promise<DeployResult> {
    try {
      const initial = emptyPrivateState(this.administratorSecret);
      this.providers.privateStateProvider.setContractAddress(contractAddress);
      await this.writePrivateState(initial);
      const compiledContract = buildCompiledContract();
      console.info(`[dao-voting] joining contract ${contractAddress}…`);
      const deployed = await withTimeout(
        findDeployedContract(this.providers as never, {
          contractAddress,
          compiledContract,
          privateStateId: 'votingState',
          initialPrivateState: initial,
        } as never),
        JOIN_TIMEOUT_MS,
        'Join',
      );
      this.deployed = deployed;
      this.contractAddress = contractAddress;
      return {
        contractAddress,
        deployTxId: '',
        blockHeight: 0,
        deployed,
      };
    } catch (error) {
      rethrowMapped(error, 'deploy');
    }
  }

  private requireDeployed() {
    if (!this.deployed || !this.contractAddress) {
      throw new VotingAppError('CONTRACT_NOT_FOUND');
    }
    return this.deployed;
  }

  private async callWithRetry(
    label: string,
    invoke: () => Promise<{ public: { txId: string; blockHeight: number } }>,
  ): Promise<TxReceipt> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= CALL_MAX_ATTEMPTS; attempt++) {
      try {
        const result = await withTimeout(invoke(), CALL_TIMEOUT_MS, label);
        return {
          txId: result.public.txId,
          blockHeight: result.public.blockHeight,
        };
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (attempt < CALL_MAX_ATTEMPTS && RETRYABLE_SUBMIT_RE.test(message)) {
          await new Promise((resolve) => setTimeout(resolve, CALL_RETRY_DELAY_MS * attempt));
          continue;
        }
        rethrowMapped(error, 'prove');
      }
    }
    rethrowMapped(lastError, 'prove');
  }

  async registerVoterRoot(root: Uint8Array): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(createPrivateState(this.adminBundle()));
    return this.callWithRetry('registerVoterRoot', () =>
      deployed.callTx.registerVoterRoot(root),
    );
  }

  async createProposal(input: CreateProposalInput): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(createPrivateState(this.adminBundle()));
    return this.callWithRetry('createProposal', () =>
      deployed.callTx.createProposal(
        input.proposalId,
        input.contentDigest,
        input.opensAt,
        input.closesAt,
        input.eligibleTotal,
        input.quorumMinimum,
      ),
    );
  }

  async openProposal(proposalId: Uint8Array): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(createPrivateState(this.adminBundle()));
    return this.callWithRetry('openProposal', () => deployed.callTx.openProposal(proposalId));
  }

  async castVote(input: CastVoteInput): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(
      createPrivateState(
        this.adminBundle({
          voterSecret: input.credential.secret,
          leafSalt: input.credential.salt,
          pathSiblings: input.credential.pathSiblings,
          pathBits: input.credential.pathBits,
          ballotChoice: input.choice,
        }),
      ),
    );
    return this.callWithRetry('castVote', () =>
      deployed.callTx.castVote(input.proposalId, input.slot),
    );
  }

  async closeProposal(proposalId: Uint8Array, slot: bigint): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(createPrivateState(this.adminBundle()));
    return this.callWithRetry('closeProposal', () =>
      deployed.callTx.closeProposal(proposalId, slot),
    );
  }

  async finalizeProposal(proposalId: Uint8Array): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(createPrivateState(this.adminBundle()));
    return this.callWithRetry('finalizeProposal', () =>
      deployed.callTx.finalizeProposal(proposalId),
    );
  }

  async cancelProposal(proposalId: Uint8Array): Promise<TxReceipt> {
    const deployed = this.requireDeployed();
    await this.writePrivateState(createPrivateState(this.adminBundle()));
    return this.callWithRetry('cancelProposal', () => deployed.callTx.cancelProposal(proposalId));
  }

  async readLedger() {
    if (!this.contractAddress) throw new VotingAppError('CONTRACT_NOT_FOUND');
    const pub = await getPublicStates(this.providers.publicDataProvider, this.contractAddress);
    return ledger((pub?.contractState as { data: unknown }).data as never);
  }

  async readVoterRoot(): Promise<Uint8Array> {
    const led = await this.readLedger();
    return led.voterRoot;
  }

  async listProposals(): Promise<Proposal[]> {
    const led = await this.readLedger();
    const proposals: Proposal[] = [];
    for (const [id, status] of led.proposalStatus) {
      if (status === ProposalStatus.None) continue;
      proposals.push(
        projectProposal({
          id,
          status,
          contentDigest: led.contentDigest.lookup(id),
          opensAt: led.opensAt.lookup(id),
          closesAt: led.closesAt.lookup(id),
          eligibleTotal: led.eligibleTotal.lookup(id),
          quorumMinimum: led.quorumMinimum.lookup(id),
          yes: led.yesVotes.member(id) ? led.yesVotes.lookup(id).read() : 0n,
          no: led.noVotes.member(id) ? led.noVotes.lookup(id).read() : 0n,
          abstain: led.abstainVotes.member(id) ? led.abstainVotes.lookup(id).read() : 0n,
        }),
      );
    }
    return proposals;
  }

  async readProposal(proposalId: Uint8Array): Promise<Proposal | null> {
    const led = await this.readLedger();
    if (!led.proposalStatus.member(proposalId)) return null;
    const status = led.proposalStatus.lookup(proposalId);
    if (status === ProposalStatus.None) return null;
    return projectProposal({
      id: proposalId,
      status,
      contentDigest: led.contentDigest.lookup(proposalId),
      opensAt: led.opensAt.lookup(proposalId),
      closesAt: led.closesAt.lookup(proposalId),
      eligibleTotal: led.eligibleTotal.lookup(proposalId),
      quorumMinimum: led.quorumMinimum.lookup(proposalId),
      yes: led.yesVotes.lookup(proposalId).read(),
      no: led.noVotes.lookup(proposalId).read(),
      abstain: led.abstainVotes.lookup(proposalId).read(),
    });
  }

  async isNullifierSpent(proposalId: Uint8Array, nullifier: Uint8Array): Promise<boolean> {
    const led = await this.readLedger();
    if (!led.spentNullifiers.member(proposalId)) return false;
    return led.spentNullifiers.lookup(proposalId).member(nullifier);
  }

  async findSpentNullifier(
    proposalId: Uint8Array,
    voterSecret: Uint8Array,
  ): Promise<Uint8Array | null> {
    const nullifier = deriveNullifier(voterSecret, proposalId);
    const spent = await this.isNullifierSpent(proposalId, nullifier);
    return spent ? nullifier : null;
  }

  getAddress(): string | null {
    return this.contractAddress;
  }
}

export function proposalIdFromHex(hex: string): Uint8Array {
  const bytes = fromHex(hex);
  if (bytes.length !== 32) throw new Error('proposalId must be 32 bytes');
  return bytes;
}

export function encodeProposalKey(label: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = new TextEncoder().encode(label);
  out.set(encoded.slice(0, 32));
  return out;
}

export { toHex, fromHex, bytesEqual };
