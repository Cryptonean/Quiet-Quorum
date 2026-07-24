export function PrivacyPanel() {
  return (
    <section className="card privacy-panel" aria-labelledby="privacy-panel-heading">
      <span className="card-stage" aria-hidden="true">Proof boundary</span>
      <div className="privacy-panel__intro">
        <p className="eyebrow">Privacy boundary</p>
        <h2 id="privacy-panel-heading">
          <span>Public truth.</span>
          <span>Private intent.</span>
        </h2>
      </div>
      <div className="privacy-panel__column">
        <h3>Observers learn</h3>
        <ul>
          <li>Proposal rules, voting window, and final status</li>
          <li>Aggregate Yes / No / Abstain totals</li>
          <li>Proposal-specific spent nullifiers</li>
          <li>That a ballot branch moved when a public counter changes</li>
        </ul>
      </div>
      <div className="privacy-panel__column">
        <h3>Observers never learn</h3>
        <ul>
          <li>Voter identity and Merkle leaf index</li>
          <li>Private membership secret, salt, and authentication path</li>
          <li>The mapping from a member to a ballot or nullifier</li>
        </ul>
      </div>
    </section>
  );
}
