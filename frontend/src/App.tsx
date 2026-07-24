import { AdminPanel } from './components/AdminPanel.js';
import { PrivacyPanel } from './components/PrivacyPanel.js';
import { ProposalPanel } from './components/ProposalPanel.js';
import { TallyPanel } from './components/TallyPanel.js';
import { VotePanel } from './components/VotePanel.js';
import { WalletBar } from './components/WalletBar.js';
import { CursorGrid } from './components/effects/CursorGrid.js';
import { DecryptedText } from './components/effects/DecryptedText.js';
import { ShinyText } from './components/effects/ShinyText.js';
import { SpotlightCard } from './components/effects/SpotlightCard.js';
import { Strands } from './components/effects/Strands.js';
import { useVotingSession } from './hooks/useVotingSession.js';

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M4 10h11M11 5l5 5-5 5" />
  </svg>
);

export function App() {
  const session = useVotingSession();

  return (
    <div className="site-shell">
      <a className="skip-link" href="#governance">
        Skip to voting console
      </a>
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Quiet Quorum home">
          <span className="brand-mark">Q</span>
          <span>QUIET QUORUM</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#protocol">Protocol</a>
          <a href="#privacy">Privacy</a>
          <a href="#steps">Steps</a>
          <a href="#governance">Launch app</a>
        </nav>
        <a className="nav-cta" href="#governance">
          Enter console <Arrow />
        </a>
      </header>

      <main id="workspace">
        <section className="hero" id="top">
          <CursorGrid
            className="hero-cursor-grid"
            cellSize={80}
            color="#ffffff"
            radius={180}
            falloff="smooth"
            holdTime={160}
            fadeDuration={900}
            lineWidth={1}
            maxOpacity={0.22}
            fillOpacity={0.015}
            gridOpacity={0.035}
            clickPulse
            pulseSpeed={500}
          />
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring orbit-ring--one" />
            <div className="orbit-ring orbit-ring--two" />
            <div className="orbit-core">
              <span className="orbit-choice orbit-choice--yes">YES</span>
              <span className="orbit-choice orbit-choice--no">NO</span>
              <span className="orbit-choice orbit-choice--abstain">ABSTAIN</span>
              <span className="orbit-center">—</span>
            </div>
          </div>

          <div className="hero-copy">
            <p className="kicker">
              <span className="pulse-dot" />
              Quiet Quorum · Live on Midnight Preview
            </p>
            <h1>
              Your vote.
              <br />
              <ShinyText className="hero-outline">Nobody’s business.</ShinyText>
            </h1>
            <p className="hero-lede">
              Private ballots. Public certainty. Prove you belong, cast your ballot, and reveal
              nothing else.
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
            <span>QUIET QUORUM</span>
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
          <div className="manifesto-strands" aria-hidden="true">
            <Strands
              colors={['#ffffff', '#b8b8b8', '#555555']}
              count={7}
              speed={0.35}
              amplitude={0.9}
              waviness={2.4}
              thickness={0.2}
              glow={2.25}
              taper={0.5}
              spread={1.2}
              intensity={0.55}
              saturation={0}
              opacity={0.92}
              scale={1.7}
              glass
              refraction={1.25}
              dispersion={0.35}
              glassSize={0.82}
            />
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

        <section className="steps-section" id="steps" aria-labelledby="steps-heading">
          <div className="section-heading">
            <p className="kicker">Walkthrough / How to test</p>
            <h2 id="steps-heading">
              Test it in
              <br />
              <span>seven clear steps.</span>
            </h2>
            <p>
              Use Lace or 1AM on Midnight Preview. Approve each wallet popup. Proving can take
              30–90 seconds.
            </p>
          </div>

          <ol className="steps-list">
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                01
              </span>
              <div>
                <h3>Connect wallet</h3>
                <p>
                  Scroll to the console. Select Lace or 1AM, set the wallet network to Preview, then
                  click Connect. Status should show Wallet: connected.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                02
              </span>
              <div>
                <h3>Deploy the voting contract</h3>
                <p>
                  In Administrator, click Deploy voting contract and approve in the wallet. Wait
                  until Contract: ready and a contract address appears.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                03
              </span>
              <div>
                <h3>Register demo voters</h3>
                <p>
                  Click Register demo voter root. This publishes the Merkle root for four demo
                  credentials (Voter 1–4) without revealing their secrets.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                04
              </span>
              <div>
                <h3>Create and open a proposal</h3>
                <p>
                  Enter a title, then click Create and open proposal. The proposal must show as
                  active before voting unlocks. Selecting Yes alone is not enough.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                05
              </span>
              <div>
                <h3>Cast a private vote</h3>
                <p>
                  In Private ballot, choose a demo voter, pick Yes / No / Abstain, then Generate
                  private vote proof. Approve the wallet. Running tally should update publicly.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                06
              </span>
              <div>
                <h3>Prove one-vote-per-credential</h3>
                <p>
                  Vote again with the same demo voter. The contract should reject it with
                  NULLIFIER_SPENT. Switch to another voter to cast a second valid ballot.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-number" aria-hidden="true">
                07
              </span>
              <div>
                <h3>Close and finalize</h3>
                <p>
                  Click Close and finalize selected proposal. The contract publishes Passed,
                  Failed, or QuorumFail from public tallies. Create a new proposal to test again.
                </p>
              </div>
            </li>
          </ol>

          <div className="steps-foot">
            <p>
              Tip: if buttons stay disabled, check Wallet: connected, Contract: ready, and that a
              proposal is active. If a wallet popup never appears, unlock the extension and retry.
            </p>
            <a className="button button--solid" href="#governance">
              Open the console <Arrow />
            </a>
          </div>
        </section>

        <section
          className="console-section"
          id="governance"
          tabIndex={-1}
          aria-busy={session.busyStage !== null}
        >
          <div className="console-heading">
            <div className="console-title">
              <p className="kicker">Interactive / Preview console</p>
              <h2>Govern without exposure.</h2>
              <p className="console-lede">
                Set up the contract, open a proposal, then cast a ballot whose eligibility can be
                verified without exposing the voter behind it.
              </p>
            </div>
            <div className="console-access">
              <p className="console-access__label">01 / Wallet access</p>
              <WalletBar session={session} />
            </div>
          </div>

          <div className="console-status">
            <p>System status</p>
            <div className="system-status" role="status">
              <span>
                <span className="status-light" aria-hidden="true" />
                Network: {import.meta.env.VITE_NETWORK_ID ?? 'preview'}
              </span>
              <span>Wallet: {session.wallet.phase}</span>
              <span>Contract: {session.contractPhase}</span>
              <span>ZK mode: enabled</span>
            </div>
          </div>

          {session.error ? (
            <p className="banner banner--error" role="alert">
              {session.error.code}: {session.error.message} — {session.error.recovery}
            </p>
          ) : null}
          <div className="console-alerts">
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
          </div>

          <div className="app-grid">
            <AdminPanel session={session} />
            <ProposalPanel session={session} />
            <VotePanel session={session} />
            <TallyPanel session={session} />
            <PrivacyPanel />
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top" aria-label="Quiet Quorum home">
          <span className="brand-mark">Q</span>
          <span>QUIET QUORUM</span>
        </a>
        <p>Private ballots. Public certainty.</p>
        <span>LEVEL 4 / 2026</span>
      </footer>
    </div>
  );
}
