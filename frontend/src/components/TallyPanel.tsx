import { evaluateQuorum } from '../voting/quorum.js';
import type { useVotingSession } from '../hooks/useVotingSession.js';

type Session = ReturnType<typeof useVotingSession>;

export function TallyPanel({ session }: { session: Session }) {
  const proposal = session.selectedProposal;
  const quorum = proposal
    ? evaluateQuorum(proposal.tallies, proposal.eligibleTotal, proposal.quorum)
    : null;

  return (
    <section className="card">
      <p className="eyebrow">Public result</p>
      <h2>Running tally</h2>
      {proposal ? (
        <>
          <dl className="tally">
            <div>
              <dt>Yes</dt>
              <dd>{proposal.tallies.yes.toString()}</dd>
            </div>
            <div>
              <dt>No</dt>
              <dd>{proposal.tallies.no.toString()}</dd>
            </div>
            <div>
              <dt>Abstain</dt>
              <dd>{proposal.tallies.abstain.toString()}</dd>
            </div>
          </dl>
          <p>
            Participation: {quorum?.participation.toString()} / {proposal.eligibleTotal.toString()} ·
            Quorum {quorum?.met ? 'met' : 'not met'} · Status {proposal.status}
          </p>
          <p className="banner banner--warning">
            Running tallies reveal which counter moved and when. They do not reveal voter identity.
          </p>
        </>
      ) : (
        <p className="banner banner--info">Tallies appear after a proposal is loaded.</p>
      )}
      {session.lastTxId ? <p className="banner banner--info">Last tx: {session.lastTxId}</p> : null}
    </section>
  );
}
