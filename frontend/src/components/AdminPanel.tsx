import { useState } from 'react';
import type { useVotingSession } from '../hooks/useVotingSession.js';

type Session = ReturnType<typeof useVotingSession>;

export function AdminPanel({ session }: { session: Session }) {
  const [joinAddress, setJoinAddress] = useState(
    () => import.meta.env.VITE_DEFAULT_CONTRACT?.trim() ?? '',
  );
  const [title, setTitle] = useState('Adopt the confidential governance charter');
  const connected = session.wallet.phase === 'connected';
  const busy = session.busyStage !== null;
  const ready = session.contractPhase === 'ready';

  return (
    <section className="card admin-panel" aria-labelledby="admin-panel-heading">
      <span className="card-stage" aria-hidden="true">02 / Contract setup</span>
      <div className="card__intro">
        <div>
          <p className="eyebrow">Administrator</p>
          <h2 id="admin-panel-heading">Deploy and govern</h2>
        </div>
        <p>
          Start fresh or reconnect to an existing contract. Once joined, register demo voters and
          open the first proposal.
        </p>
      </div>

      <div className="admin-contract">
        <button
          type="button"
          className="primary"
          disabled={!connected || busy}
          onClick={() => void session.deploy()}
        >
          {session.busyStage === 'deploy' ? 'Deploying…' : 'Deploy voting contract'}
        </button>
        {!connected ? (
          <p className="wallet-help">Connect Lace or 1AM on Preview before deploying.</p>
        ) : null}
        {session.busyStage === 'deploy' ? (
          <p className="wallet-help" role="status">
            Deploy started — approve the wallet popup if it appears. This can take 30–90s while
            proving.
          </p>
        ) : null}

        <div className="admin-or" aria-hidden="true">
          <span>or join existing</span>
        </div>

        <div className="admin-join">
          <label>
            Contract address
            <input
              value={joinAddress}
              onChange={(event) => setJoinAddress(event.target.value)}
              placeholder="midnight contract address"
              disabled={busy}
            />
          </label>
          <button
            type="button"
            disabled={!connected || busy}
            onClick={() => void session.join(joinAddress)}
          >
            {session.busyStage === 'join' ? 'Joining…' : 'Join contract'}
          </button>
        </div>
      </div>

      <div className="admin-governance">
        <p className="admin-group-label">Governance actions</p>
        <button type="button" disabled={!ready || busy} onClick={() => void session.registerDemoRoot()}>
          {session.busyStage === 'register-root' ? 'Registering root…' : 'Register demo voter root'}
        </button>

        <label>
          Proposal title
          <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={busy} />
        </label>
        <button
          type="button"
          disabled={!ready || busy}
          onClick={() => void session.createAndOpenProposal(title)}
        >
          {session.busyStage === 'create-proposal' || session.busyStage === 'open-proposal'
            ? 'Creating…'
            : 'Create and open proposal'}
        </button>

        <button type="button" disabled={!ready || busy || !session.selectedProposal} onClick={() => void session.closeAndFinalize()}>
          {session.busyStage === 'close' || session.busyStage === 'finalize'
            ? 'Finalizing…'
            : 'Close and finalize selected proposal'}
        </button>

        <button type="button" disabled={busy} onClick={session.clearContract}>
          Clear stored contract
        </button>
      </div>

      {session.contractAddress ? (
        <p className="banner banner--info">Contract: {session.contractAddress}</p>
      ) : null}
    </section>
  );
}
