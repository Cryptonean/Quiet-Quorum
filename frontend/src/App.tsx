import { useMemo, useState } from 'react';
import { useWalletSession } from './hooks/useWalletSession.js';
import { evaluateQuorum } from './voting/quorum.js';
import type { VoteChoice } from './voting/types.js';

const choices: VoteChoice[] = ['yes', 'no', 'abstain'];

export function App() {
  const wallet = useWalletSession();
  const [choice, setChoice] = useState<VoteChoice>('yes');
  const [notice, setNotice] = useState<string | null>(null);
  const demoQuorum = useMemo(
    () =>
      evaluateQuorum(
        { yes: 3n, no: 1n, abstain: 1n },
        8n,
        { kind: 'percentage', numerator: 1n, denominator: 2n },
      ),
    [],
  );

  const vote = () => {
    setNotice(
      `Selected ${choice}. Contract submission is intentionally disabled until the Compact verification spikes and generated bindings are complete.`,
    );
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Midnight · Confidential governance</p>
          <h1>Private DAO Voting</h1>
          <p className="subtitle">
            Prove eligibility, prevent double voting, and publish an auditable result without
            linking a ballot to a member.
          </p>
        </div>
        <div className="wallet">
          <span className="pill">network: {import.meta.env.VITE_NETWORK_ID ?? 'preprod'}</span>
          {wallet.phase === 'connected' ? (
            <>
              <span className="pill pill--active">wallet: {wallet.walletName}</span>
              <button type="button" onClick={() => void wallet.refreshReadiness()}>
                Refresh
              </button>
              <button type="button" onClick={() => void wallet.disconnect()}>
                Disconnect
              </button>
            </>
          ) : (
            <>
              <select
                value={wallet.selectedInstallId ?? ''}
                onChange={(event) => wallet.setSelected(event.target.value)}
                disabled={wallet.phase === 'connecting'}
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
                disabled={!wallet.selectedInstallId || wallet.phase === 'connecting'}
              >
                {wallet.phase === 'connecting' ? 'Connecting…' : 'Connect wallet'}
              </button>
            </>
          )}
        </div>
      </header>

      {wallet.error ? <p className="banner banner--error">{wallet.error}</p> : null}
      {wallet.readiness?.warning ? (
        <p className="banner banner--warning">{wallet.readiness.warning}</p>
      ) : null}

      <main className="grid">
        <section className="card card--wide">
          <div className="card__head">
            <div>
              <p className="eyebrow">Proposal #001 · Active</p>
              <h2>Adopt the confidential governance charter</h2>
            </div>
            <span className="pill pill--active">Demo state</span>
          </div>
          <p>
            Registered members prove membership against an approved issuer root. A
            proposal-specific nullifier enforces one effective vote without revealing which member
            cast it.
          </p>

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
            disabled={wallet.phase !== 'connected'}
            onClick={vote}
          >
            Generate private vote proof
          </button>
          {notice ? <p className="banner banner--info">{notice}</p> : null}
        </section>

        <section className="card">
          <p className="eyebrow">Public result</p>
          <h2>Running tally</h2>
          <dl className="tally">
            <div><dt>Yes</dt><dd>3</dd></div>
            <div><dt>No</dt><dd>1</dd></div>
            <div><dt>Abstain</dt><dd>1</dd></div>
          </dl>
          <p>
            Participation: {demoQuorum.participation.toString()} / 8 · Quorum{' '}
            {demoQuorum.met ? 'met' : 'not met'}
          </p>
        </section>

        <section className="card">
          <p className="eyebrow">Privacy boundary</p>
          <h2>What observers learn</h2>
          <ul>
            <li>Proposal rules and voting window</li>
            <li>Aggregate Yes / No / Abstain totals</li>
            <li>Spent proposal nullifiers</li>
          </ul>
          <h3>What remains private</h3>
          <ul>
            <li>Voter identity and credential path</li>
            <li>Voter-to-ballot relationship</li>
            <li>Private membership secret</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
