import type { useVotingSession } from '../hooks/useVotingSession.js';

type Session = ReturnType<typeof useVotingSession>;

export function ProposalPanel({ session }: { session: Session }) {
  return (
    <section className="card">
      <p className="eyebrow">Proposals</p>
      <h2>On-chain governance queue</h2>
      {session.proposals.length === 0 ? (
        <p className="banner banner--info">
          No proposals loaded yet. Deploy/join a contract and create one to begin.
        </p>
      ) : (
        <ul className="proposal-list">
          {session.proposals.map((proposal) => (
            <li key={proposal.id}>
              <button
                type="button"
                className={
                  session.selectedProposal?.id === proposal.id ? 'choice active' : 'choice'
                }
                onClick={() => session.setSelectedProposalId(proposal.id)}
              >
                <strong>{proposal.id.slice(0, 12)}…</strong>
                <span className="pill">{proposal.status}</span>
              </button>
            </li>
          ))}
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
