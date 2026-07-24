import { useCallback, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { buildBrowserProviders, type VotingProviders } from '../providers/buildBrowserProviders.js';
import {
  connectToWallet,
  disconnectWallet,
  getStoredWalletInstallId,
  storeWalletInstallId,
} from '../wallet/walletConnector.js';
import { loadWalletReadiness, type WalletReadiness } from '../wallet/walletReadiness.js';
import { useDetectedWallets } from './useDetectedWallets.js';

export type WalletPhase = 'idle' | 'connecting' | 'connected' | 'error';

export function useWalletSession() {
  const [phase, setPhase] = useState<WalletPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);
  const [providers, setProviders] = useState<VotingProviders | null>(null);
  const [readiness, setReadiness] = useState<WalletReadiness | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [selected, setSelectedState] = useState<string | null>(() => getStoredWalletInstallId());
  const { wallets, selectedInstallId } = useDetectedWallets(selected);

  const setSelected = useCallback((installId: string) => {
    setSelectedState(installId);
    storeWalletInstallId(installId);
  }, []);

  const connect = useCallback(async () => {
    if (!selectedInstallId) {
      setPhase('error');
      setError('No compatible Midnight wallet was detected.');
      return;
    }

    setPhase('connecting');
    setError(null);
    try {
      const result = await connectToWallet(
        selectedInstallId,
        import.meta.env.VITE_NETWORK_ID ?? 'preview',
      );
      const nextProviders = await buildBrowserProviders(result.api, result.networkId);
      const wallet = wallets.find((candidate) => candidate.installId === selectedInstallId) ?? null;
      const nextReadiness = await loadWalletReadiness(result.api, wallet);
      setConnectedApi(result.api);
      setProviders(nextProviders);
      setReadiness(nextReadiness);
      setWalletName(result.walletName);
      setSelected(selectedInstallId);
      setPhase('connected');
    } catch (cause) {
      setPhase('error');
      setError(cause instanceof Error ? cause.message : 'Wallet connection failed.');
    }
  }, [selectedInstallId, wallets, setSelected]);

  const disconnect = useCallback(async () => {
    if (connectedApi) await disconnectWallet(connectedApi);
    setConnectedApi(null);
    setProviders(null);
    setReadiness(null);
    setWalletName(null);
    setPhase('idle');
    setError(null);
  }, [connectedApi]);

  const refreshReadiness = useCallback(async () => {
    if (!connectedApi) return;
    const wallet = wallets.find((candidate) => candidate.installId === selectedInstallId) ?? null;
    setReadiness(await loadWalletReadiness(connectedApi, wallet));
  }, [connectedApi, wallets, selectedInstallId]);

  return {
    phase,
    error,
    providers,
    readiness,
    walletName,
    wallets,
    selectedInstallId,
    setSelected,
    connect,
    disconnect,
    refreshReadiness,
  };
}
