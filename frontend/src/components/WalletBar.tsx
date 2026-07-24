import type { useVotingSession } from '../hooks/useVotingSession.js';

type Session = ReturnType<typeof useVotingSession>;

export function WalletBar({ session }: { session: Session }) {
  const { wallet, disconnect, busyStage } = session;
  const busy = busyStage !== null || wallet.phase === 'connecting';
  const connectBlocked = !wallet.selectedInstallId || busy;

  return (
    <div className="wallet">
      <span className="pill">network: {import.meta.env.VITE_NETWORK_ID ?? 'preview'}</span>
      {wallet.phase === 'connected' ? (
        <>
          <span className="pill pill--active">wallet: {wallet.walletName}</span>
          <button type="button" disabled={busy} onClick={() => void wallet.refreshReadiness()}>
            Refresh wallet
          </button>
          <button type="button" disabled={busy} onClick={() => void disconnect()}>
            Disconnect
          </button>
        </>
      ) : (
        <>
          <label className="wallet-field">
            <span className="sr-only">Wallet</span>
            <select
              value={wallet.selectedInstallId ?? ''}
              onChange={(event) => wallet.setSelected(event.target.value)}
              disabled={busy}
              aria-label="Wallet"
            >
              {wallet.wallets.length === 0 ? (
                <option value="">No wallet detected</option>
              ) : (
                wallet.wallets.map((candidate) => (
                  <option
                    key={candidate.installId}
                    value={candidate.installId}
                    disabled={!candidate.compatible}
                  >
                    {candidate.name} · API {candidate.apiVersion}
                  </option>
                ))
              )}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void wallet.connect()}
            disabled={connectBlocked}
            aria-describedby={connectBlocked ? 'wallet-connect-help' : undefined}
          >
            {wallet.phase === 'connecting' ? 'Connecting…' : 'Connect Lace / 1AM'}
          </button>
          {wallet.wallets.length === 0 ? (
            <p className="wallet-help" id="wallet-connect-help">
              Install Lace or 1AM, enable Midnight, then refresh.
            </p>
          ) : connectBlocked && !busy ? (
            <p className="wallet-help" id="wallet-connect-help">
              Select a compatible wallet before connecting.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
