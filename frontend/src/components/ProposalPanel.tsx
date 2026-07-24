import type { useVotingSession } from '../hooks/useVotingSession.js';

type Session = ReturnType<typeof useVotingSession>;

export function ProposalPanel({ session }: { session: Session }) {
  return (
    <section className="card proposal-panel" aria-labelledby="proposal-panel-heading">
      <span className="card-stage" aria-hidden="true">03 / Proposal queue</span>
      <div className="card__intro">
        <div>
          <p className="eyebrow">Proposals</p>
          <h2 id="proposal-panel-heading">On-chain queue</h2>
        </div>
      </div>
      {session.proposals.length === 0 ? (
        <p className="banner banner--info">
          No proposals loaded yet. Deploy/join a contract and create one to begin.
        </p>
      ) : (
        <ul className="proposal-list">
          {session.proposals.map((proposal) => {
            const selected = session.selectedProposal?.id === proposal.id;
            return (
              <li key={proposal.id}>
                <button
                  type="button"
                  className={selected ? 'choice active' : 'choice'}
                  aria-pressed={selected}
                  onClick={() => session.setSelectedProposalId(proposal.id)}
                >
                  <strong>{proposal.id.slice(0, 12)}…</strong>
                  <span className="pill">
                    {proposal.status}
                    {selected ? ' · selected' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        disabled={session.busyStage !== null || session.contractPhase !== 'ready'}
        onClick={() => void session.refreshProposals()}
      >
        {session.busyStage === 'refresh' ? 'Refreshing…' : 'Refresh proposals'}
      </button>
    </section>
  );
}
