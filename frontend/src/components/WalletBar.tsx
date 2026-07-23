import type { useVotingSession } from '../hooks/useVotingSession.js';

type Session = ReturnType<typeof useVotingSession>;

export function WalletBar({ session }: { session: Session }) {
  const { wallet, disconnect, busyStage } = session;
  const busy = busyStage !== null || wallet.phase === 'connecting';

  return (
    <div className="wallet">
      <span className="pill">network: {import.meta.env.VITE_NETWORK_ID ?? 'preprod'}</span>
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
          <select
            value={wallet.selectedInstallId ?? ''}
            onChange={(event) => wallet.setSelected(event.target.value)}
            disabled={busy}
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
          <button
            type="button"
            onClick={() => void wallet.connect()}
            disabled={!wallet.selectedInstallId || busy}
          >
            {wallet.phase === 'connecting' ? 'Connecting…' : 'Connect Lace / 1AM'}
          </button>
        </>
      )}
    </div>
  );
}
