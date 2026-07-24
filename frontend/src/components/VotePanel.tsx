import { useState } from 'react';
import type { useVotingSession } from '../hooks/useVotingSession.js';
import type { VoteChoice } from '../voting/types.js';

type Session = ReturnType<typeof useVotingSession>;

const choices: VoteChoice[] = ['yes', 'no', 'abstain'];

export function VotePanel({ session }: { session: Session }) {
  const [choice, setChoice] = useState<VoteChoice>('yes');
  const proposal = session.selectedProposal;
  const ready =
    session.wallet.phase === 'connected' &&
    session.contractPhase === 'ready' &&
    proposal?.status === 'active';
  const busy = session.busyStage !== null;

  const proving =
    session.busyStage === 'build-witness' || session.busyStage === 'prove';

  return (
    <section
      className="card vote-panel"
      aria-labelledby="vote-panel-heading"
      aria-busy={busy}
    >
      <span className="card-stage" aria-hidden="true">04 / Private ballot</span>
      <div className="card__head">
        <div>
          <p className="eyebrow">
            {proposal ? `Proposal ${proposal.id.slice(0, 10)}… · ${proposal.status}` : 'No proposal'}
          </p>
          <h2 id="vote-panel-heading">Private ballot</h2>
        </div>
        <span className={`pill ${ready ? 'pill--active' : ''}`}>
          {ready ? 'Ready to prove' : 'Waiting'}
        </span>
      </div>

      <p>
        Choose a demo credential, select Yes / No / Abstain, then generate a ZK proof that you are an
        approved member without revealing which member you are.
      </p>
      {!ready && session.wallet.phase !== 'connected' ? (
        <p className="wallet-help">Connect a wallet before generating a proof.</p>
      ) : null}

      <label>
        Demo voter credential
        <select
          value={session.selectedVoter.leafIndex}
          disabled={busy}
          onChange={(event) => {
            const next = session.demoVoters.find(
              (voter) => voter.leafIndex === Number(event.target.value),
            );
            if (next) session.setSelectedVoter(next);
          }}
        >
          {session.demoVoters.map((voter) => (
            <option key={voter.leafIndex} value={voter.leafIndex}>
              {voter.label} (leaf {voter.leafIndex})
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Your private ballot</legend>
        <div className="choices">
          {choices.map((candidate) => (
            <label key={candidate} className={choice === candidate ? 'choice active' : 'choice'}>
              <input
                type="radio"
                name="vote"
                value={candidate}
                checked={choice === candidate}
                disabled={busy}
                onChange={() => setChoice(candidate)}
              />
              {candidate}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="primary"
        disabled={!ready || busy}
        onClick={() => void session.castVote(choice)}
      >
        {proving ? 'Proving private vote…' : 'Generate private vote proof'}
      </button>

      {!proposal ? (
        <p className="banner banner--info">Create or select an active proposal before voting.</p>
      ) : null}
    </section>
  );
}
