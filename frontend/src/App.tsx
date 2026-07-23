import { AdminPanel } from './components/AdminPanel.js';
import { PrivacyPanel } from './components/PrivacyPanel.js';
import { ProposalPanel } from './components/ProposalPanel.js';
import { TallyPanel } from './components/TallyPanel.js';
import { VotePanel } from './components/VotePanel.js';
import { WalletBar } from './components/WalletBar.js';
import { useVotingSession } from './hooks/useVotingSession.js';

export function App() {
  const session = useVotingSession();

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Midnight · Confidential governance</p>
          <h1>Private DAO Voting</h1>
          <p className="subtitle">
            Prove eligibility, prevent double voting, and publish an auditable result without linking
            a ballot to a member.
          </p>
        </div>
        <WalletBar session={session} />
      </header>

      {session.error ? (
        <p className="banner banner--error">
          {session.error.code}: {session.error.message} — {session.error.recovery}
        </p>
      ) : null}
      {session.wallet.readiness?.warning ? (
        <p className="banner banner--warning">{session.wallet.readiness.warning}</p>
      ) : null}
      {session.notice ? <p className="banner banner--info">{session.notice}</p> : null}
      {session.busyStage ? (
        <p className="banner banner--info">Working: {session.busyStage.replaceAll('-', ' ')}…</p>
      ) : null}

      <main className="grid">
        <VotePanel session={session} />
        <TallyPanel session={session} />
        <PrivacyPanel />
        <AdminPanel session={session} />
        <ProposalPanel session={session} />
      </main>
    </div>
  );
}
