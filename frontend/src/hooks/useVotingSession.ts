import { useCallback, useMemo, useRef, useState } from 'react';
import {
  clearStoredContract,
  isStoredContractCompatible,
  loadStoredContract,
  saveStoredContract,
} from '../contractStorage.js';
import { deriveNullifier, fromHex, toHex } from '../browser-circuit/canonical.js';
import { createDemoRegistry, type DemoVoter } from '../demo/demoVoters.js';
import {
  DaoVotingClient,
  encodeProposalKey,
} from '../voting/DaoVotingClient.js';
import { assertLocallyEligible } from '../voting/eligibility.js';
import { mapVotingError, type NormalizedVotingError } from '../voting/errors.js';
import type { Proposal, VoteChoice } from '../voting/types.js';
import { useWalletSession } from './useWalletSession.js';

export type ContractPhase =
  | 'none'
  | 'joining'
  | 'deploying'
  | 'ready'
  | 'proving'
  | 'submitting'
  | 'error';

export type BusyStage =
  | null
  | 'deploy'
  | 'join'
  | 'register-root'
  | 'create-proposal'
  | 'open-proposal'
  | 'build-witness'
  | 'prove'
  | 'refresh'
  | 'close'
  | 'finalize';

function currentSlot(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function useVotingSession() {
  const wallet = useWalletSession();
  const clientRef = useRef<DaoVotingClient | null>(null);
  const busyMutex = useRef(false);
  const demo = useMemo(() => createDemoRegistry(), []);

  const [adminSecret] = useState(() => demo.administratorSecret);
  const [contractPhase, setContractPhase] = useState<ContractPhase>('none');
  const [busyStage, setBusyStage] = useState<BusyStage>(null);
  const [error, setError] = useState<NormalizedVotingError | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedVoter, setSelectedVoter] = useState<DemoVoter>(demo.voters[0]);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedProposal =
    proposals.find((proposal) => proposal.id === selectedProposalId) ?? proposals[0] ?? null;

  const withBusy = useCallback(async <T,>(stage: BusyStage, fn: () => Promise<T>): Promise<T | undefined> => {
    if (busyMutex.current) {
      setError(mapVotingError(new Error('busy')));
      return undefined;
    }
    busyMutex.current = true;
    setBusyStage(stage);
    setError(null);
    try {
      return await fn();
    } catch (cause) {
      const normalized =
        cause && typeof cause === 'object' && 'normalized' in cause
          ? (cause as { normalized: NormalizedVotingError }).normalized
          : mapVotingError(cause);
      setError(normalized);
      setContractPhase((prev) => (prev === 'ready' ? 'ready' : 'error'));
      return undefined;
    } finally {
      busyMutex.current = false;
      setBusyStage(null);
    }
  }, []);

  const ensureClient = useCallback(() => {
    if (!wallet.providers) {
      throw new Error('Connect a Midnight wallet before using the voting contract.');
    }
    if (!clientRef.current) {
      clientRef.current = new DaoVotingClient(wallet.providers, adminSecret);
    } else {
      clientRef.current.setAdministratorSecret(adminSecret);
    }
    return clientRef.current;
  }, [wallet.providers, adminSecret]);

  const refreshProposals = useCallback(async () => {
    const client = ensureClient();
    const next = await client.listProposals();
    setProposals(next);
    if (!selectedProposalId && next[0]) {
      setSelectedProposalId(next[0].id);
    }
    return next;
  }, [ensureClient, selectedProposalId]);

  const deploy = useCallback(async () => {
    await withBusy('deploy', async () => {
      setContractPhase('deploying');
      const client = ensureClient();
      const result = await client.deploy();
      saveStoredContract(result.contractAddress);
      setContractAddress(result.contractAddress);
      setLastTxId(result.deployTxId);
      setContractPhase('ready');
      setNotice('Contract deployed. Register the demo voter root next.');
      await refreshProposals();
    });
  }, [ensureClient, refreshProposals, withBusy]);

  const join = useCallback(
    async (address?: string) => {
      await withBusy('join', async () => {
        setContractPhase('joining');
        const stored = loadStoredContract();
        const target =
          address?.trim() ||
          stored?.address ||
          import.meta.env.VITE_DEFAULT_CONTRACT?.trim() ||
          '';
        if (!target) {
          throw new Error('No contract address available to join.');
        }
        if (stored && stored.address === target && !isStoredContractCompatible(stored)) {
          clearStoredContract();
          throw new Error('verifier mismatch with stored zk build id');
        }
        const client = ensureClient();
        const result = await client.join(target);
        saveStoredContract(result.contractAddress);
        setContractAddress(result.contractAddress);
        setContractPhase('ready');
        setNotice(`Joined contract ${result.contractAddress}`);
        await refreshProposals();
      });
    },
    [ensureClient, refreshProposals, withBusy],
  );

  const registerDemoRoot = useCallback(async () => {
    await withBusy('register-root', async () => {
      setContractPhase('proving');
      const client = ensureClient();
      const receipt = await client.registerVoterRoot(demo.root);
      setLastTxId(receipt.txId);
      setContractPhase('ready');
      setNotice('Demo voter root registered on-chain.');
    });
  }, [demo.root, ensureClient, withBusy]);

  const createAndOpenProposal = useCallback(
    async (title: string) => {
      await withBusy('create-proposal', async () => {
        setContractPhase('proving');
        const client = ensureClient();
        const now = currentSlot();
        const proposalId = encodeProposalKey(title.slice(0, 24) || `proposal-${now}`);
        const digest = encodeProposalKey(`digest:${title}`);
        await client.createProposal({
          proposalId,
          contentDigest: digest,
          opensAt: now,
          closesAt: now + 3600n,
          eligibleTotal: BigInt(demo.voters.length),
          quorumMinimum: 1n,
        });
        setBusyStage('open-proposal');
        const opened = await client.openProposal(proposalId);
        setLastTxId(opened.txId);
        setSelectedProposalId(toHex(proposalId));
        setContractPhase('ready');
        setNotice('Proposal created and opened for voting.');
        await refreshProposals();
      });
    },
    [demo.voters.length, ensureClient, refreshProposals, withBusy],
  );

  const castVote = useCallback(
    async (choice: VoteChoice) => {
      await withBusy('build-witness', async () => {
        if (!selectedProposal) {
          throw new Error('Select an active proposal first.');
        }
        const client = ensureClient();
        const proposalId = fromHex(selectedProposal.id);
        const derivedNullifier = deriveNullifier(selectedVoter.secret, proposalId);
        const spent = await client.findSpentNullifier(proposalId, selectedVoter.secret);
        const voterRoot = await client.readVoterRoot();
        const slot = currentSlot();

        assertLocallyEligible({
          proposal: selectedProposal,
          credential: {
            secret: selectedVoter.secret,
            salt: selectedVoter.salt,
            path: {
              leafIndex: selectedVoter.leafIndex,
              siblings: selectedVoter.pathSiblings,
              bits: selectedVoter.pathBits,
            },
          },
          voterRoot,
          currentSlot: slot,
          choice,
          derivedNullifier,
          spentNullifier: spent,
        });

        setBusyStage('prove');
        setContractPhase('proving');
        try {
          const receipt = await client.castVote({
            proposalId,
            choice,
            slot,
            credential: {
              secret: selectedVoter.secret,
              salt: selectedVoter.salt,
              pathSiblings: selectedVoter.pathSiblings,
              pathBits: selectedVoter.pathBits,
            },
          });
          setLastTxId(receipt.txId);
          setNotice(`Vote submitted (${choice}). Public tally refreshed below.`);
        } catch (cause) {
          const normalized = mapVotingError(cause);
          if (normalized.code === 'PROOF_TIMEOUT' || /timed out|unknown/i.test(normalized.message)) {
            setBusyStage('refresh');
            const nowSpent = await client.isNullifierSpent(proposalId, derivedNullifier);
            if (nowSpent) {
              setNotice('Submission was uncertain, but the nullifier is spent. Treating vote as accepted.');
              await refreshProposals();
              setContractPhase('ready');
              return;
            }
            throw Object.assign(new Error('SUBMISSION_UNKNOWN: refresh before retry'), {
              normalized: mapVotingError(new Error('submission status is unknown')),
            });
          }
          throw cause;
        }

        setContractPhase('ready');
        await refreshProposals();
      });
    },
    [ensureClient, refreshProposals, selectedProposal, selectedVoter, withBusy],
  );

  const closeAndFinalize = useCallback(async () => {
    await withBusy('close', async () => {
      if (!selectedProposal) throw new Error('Select a proposal first.');
      const client = ensureClient();
      const proposalId = fromHex(selectedProposal.id);
      setContractPhase('proving');
      // Public slot argument may be advanced to the configured close boundary for demos.
      const closeSlot =
        currentSlot() >= selectedProposal.closesAt ? currentSlot() : selectedProposal.closesAt;
      await client.closeProposal(proposalId, closeSlot);
      setBusyStage('finalize');
      const finalized = await client.finalizeProposal(proposalId);
      setLastTxId(finalized.txId);
      setContractPhase('ready');
      setNotice('Proposal closed and finalized from public tallies.');
      await refreshProposals();
    });
  }, [ensureClient, refreshProposals, selectedProposal, withBusy]);

  const clearContract = useCallback(() => {
    clearStoredContract();
    clientRef.current = null;
    setContractAddress(null);
    setProposals([]);
    setSelectedProposalId(null);
    setContractPhase('none');
    setNotice('Cleared stored contract session.');
  }, []);

  const disconnect = useCallback(async () => {
    clientRef.current = null;
    setContractPhase('none');
    setProposals([]);
    setError(null);
    setNotice(null);
    await wallet.disconnect();
  }, [wallet]);

  return {
    wallet,
    demoVoters: demo.voters,
    selectedVoter,
    setSelectedVoter,
    contractPhase,
    busyStage,
    error: error ?? (wallet.error ? mapVotingError(new Error(wallet.error)) : null),
    contractAddress,
    proposals,
    selectedProposal,
    setSelectedProposalId,
    lastTxId,
    notice,
    deploy,
    join,
    registerDemoRoot,
    createAndOpenProposal,
    castVote,
    closeAndFinalize,
    refreshProposals: () => withBusy('refresh', refreshProposals),
    clearContract,
    disconnect,
  };
}
