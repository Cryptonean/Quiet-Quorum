import { AdminPanel } from './components/AdminPanel.js';
import { PrivacyPanel } from './components/PrivacyPanel.js';
import { ProposalPanel } from './components/ProposalPanel.js';
import { TallyPanel } from './components/TallyPanel.js';
import { VotePanel } from './components/VotePanel.js';
import { WalletBar } from './components/WalletBar.js';
import { DecryptedText } from './components/effects/DecryptedText.js';
import { ShinyText } from './components/effects/ShinyText.js';
import { SpotlightCard } from './components/effects/SpotlightCard.js';
import { useVotingSession } from './hooks/useVotingSession.js';

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M4 10h11M11 5l5 5-5 5" />
  </svg>
);

const Shield = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32">
    <path d="M16 3 27 7v8c0 7-4.5 11.5-11 14C9.5 26.5 5 22 5 15V7l11-4Z" />
    <path d="m11.5 16 3 3 6.5-7" />
  </svg>
);

export function App() {
  const session = useVotingSession();

  return (
    <div className="site-shell">
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Midnight Private DAO home">
          <span className="brand-mark">M</span>
          <span>MIDNIGHT / DAO</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#protocol">Protocol</a>
          <a href="#privacy">Privacy</a>
          <a href="#governance">Launch app</a>
        </nav>
        <a className="nav-cta" href="#governance">
          Enter console <Arrow />
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring orbit-ring--one" />
            <div className="orbit-ring orbit-ring--two" />
            <div className="orbit-core">
              <span>YES</span>
              <span>NO</span>
              <span>—</span>
            </div>
          </div>

          <div className="hero-copy">
            <p className="kicker">
              <span className="pulse-dot" />
              Live on Midnight Preprod
            </p>
            <h1>
              Your vote.
              <br />
              <ShinyText className="hero-outline">Nobody’s business.</ShinyText>
            </h1>
            <p className="hero-lede">
              Confidential governance for serious communities. Prove you belong. Cast your ballot.
              Reveal nothing else.
            </p>
            <div className="hero-actions">
              <a className="button button--solid" href="#governance">
                Launch voting console <Arrow />
              </a>
              <a className="button button--ghost" href="#protocol">
                Explore the protocol
              </a>
            </div>
          </div>

          <div className="hero-index" aria-hidden="true">
            <span>PRIVACY / 01</span>
            <span>MIDNIGHT NETWORK</span>
          </div>
          <p className="hero-vertical" aria-hidden="true">
            ZERO KNOWLEDGE GOVERNANCE
          </p>
        </section>

        <section className="proof-strip" aria-label="Protocol guarantees">
          <div>
            <span className="proof-value">01</span>
            <span>One member</span>
          </div>
          <div>
            <span className="proof-value">01</span>
            <span>One effective vote</span>
          </div>
          <div>
            <span className="proof-value">00</span>
            <span>Identity leaks</span>
          </div>
          <div>
            <span className="proof-value">∞</span>
            <span>Public verification</span>
          </div>
        </section>

        <section className="editorial-section" id="protocol">
          <div className="section-heading">
            <p className="kicker">Protocol / How it works</p>
            <h2>
              Trust the proof.
              <br />
              <span>Not the voter list.</span>
            </h2>
            <p>
              Governance that separates the right to participate from the identity of the
              participant.
            </p>
          </div>

          <div className="mechanism-grid">
            <SpotlightCard className="mechanism-card mechanism-card--featured">
              <span className="card-number">01</span>
              <div className="proof-visual" aria-hidden="true">
                <span className="proof-node proof-node--root" />
                <span className="proof-node proof-node--left" />
                <span className="proof-node proof-node--right" />
                <span className="proof-line proof-line--left" />
                <span className="proof-line proof-line--right" />
              </div>
              <p className="kicker">Prove membership</p>
              <h3>Eligible. Anonymous.</h3>
              <p>
                A Merkle proof confirms membership without publishing your name, credential path,
                or position in the registry.
              </p>
            </SpotlightCard>

            <SpotlightCard className="mechanism-card">
              <span className="card-number">02</span>
              <div className="nullifier-mark" aria-hidden="true">
                ∅
              </div>
              <p className="kicker">Prevent duplication</p>
              <h3>Vote once. Stay unlinkable.</h3>
              <p>
                A proposal-specific nullifier blocks repeat ballots while preventing activity from
                being tracked across proposals.
              </p>
            </SpotlightCard>

            <SpotlightCard className="mechanism-card">
              <span className="card-number">03</span>
              <div className="tally-visual" aria-hidden="true">
                <span style={{ height: '54%' }} />
                <span style={{ height: '88%' }} />
                <span style={{ height: '32%' }} />
              </div>
              <p className="kicker">Verify the result</p>
              <h3>Public truth. Private intent.</h3>
              <p>
                Aggregate tallies and quorum outcomes remain public, deterministic, and auditable
                on Midnight.
              </p>
            </SpotlightCard>
          </div>
        </section>

        <section className="privacy-manifesto" id="privacy">
          <div className="manifesto-orb" aria-hidden="true">
            <Shield />
          </div>
          <p className="kicker">The privacy boundary</p>
          <h2>
            <DecryptedText text="Reveal the outcome." />
            <br />
            <span>Conceal the individual.</span>
          </h2>
          <div className="privacy-columns">
            <div>
              <p className="privacy-label">Public by design</p>
              <ul>
                <li>Proposal rules and voting window</li>
                <li>Aggregate Yes / No / Abstain</li>
                <li>Spent proposal nullifiers</li>
                <li>Quorum and final outcome</li>
              </ul>
            </div>
            <div>
              <p className="privacy-label">Private by proof</p>
              <ul>
                <li>Voter identity</li>
                <li>Membership secret and path</li>
                <li>Voter-to-ballot relationship</li>
                <li>Cross-proposal activity</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="console-section" id="governance">
          <div className="console-heading">
            <div>
              <p className="kicker">Interactive / Preprod console</p>
              <h2>Govern without exposure.</h2>
            </div>
            <WalletBar session={session} />
          </div>

          <div className="system-status" role="status">
            <span>
              <i className="status-light" />
              Network: {import.meta.env.VITE_NETWORK_ID ?? 'preprod'}
            </span>
            <span>Wallet: {session.wallet.phase}</span>
            <span>Contract: {session.contractPhase}</span>
            <span>ZK mode: enabled</span>
          </div>

          {session.error ? (
            <p className="banner banner--error" role="alert">
              {session.error.code}: {session.error.message} — {session.error.recovery}
            </p>
          ) : null}
          {session.wallet.readiness?.warning ? (
            <p className="banner banner--warning" role="status">
              {session.wallet.readiness.warning}
            </p>
          ) : null}
          {session.notice ? (
            <p className="banner banner--info" role="status">
              {session.notice}
            </p>
          ) : null}
          {session.busyStage ? (
            <p className="banner banner--info" role="status">
              Working: {session.busyStage.replaceAll('-', ' ')}…
            </p>
          ) : null}

          <div className="app-grid">
            <VotePanel session={session} />
            <TallyPanel session={session} />
            <PrivacyPanel />
            <AdminPanel session={session} />
            <ProposalPanel session={session} />
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark">M</span>
          <span>MIDNIGHT / DAO</span>
        </a>
        <p>Confidential governance. Publicly verifiable.</p>
        <span>LEVEL 4 / 2026</span>
      </footer>
    </div>
  );
}
