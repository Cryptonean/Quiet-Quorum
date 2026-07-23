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
    <section className="card">
      <p className="eyebrow">Administrator</p>
      <h2>Deploy and govern</h2>
      <p>
        Deploy a fresh Preprod contract, register the demo voter Merkle root, then create and open a
        proposal. Rules freeze when the proposal becomes active.
      </p>

      <div className="stack">
        <button
          type="button"
          className="primary"
          disabled={!connected || busy}
          onClick={() => void session.deploy()}
        >
          {session.busyStage === 'deploy' ? 'Deploying…' : 'Deploy voting contract'}
        </button>

        <label>
          Join existing address
          <input
            value={joinAddress}
            onChange={(event) => setJoinAddress(event.target.value)}
            placeholder="midnight contract address"
            disabled={busy}
          />
        </label>
        <button type="button" disabled={!connected || busy} onClick={() => void session.join(joinAddress)}>
          {session.busyStage === 'join' ? 'Joining…' : 'Join contract'}
        </button>

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
