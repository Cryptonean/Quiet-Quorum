export function PrivacyPanel() {
  return (
    <section className="card privacy-panel">
      <p className="eyebrow">Privacy boundary</p>
      <h2>What observers learn</h2>
      <ul>
        <li>Proposal rules, voting window, and final status</li>
        <li>Aggregate Yes / No / Abstain totals</li>
        <li>Proposal-specific spent nullifiers</li>
        <li>That a ballot branch moved when a public counter changes</li>
      </ul>
      <h3>What remains private</h3>
      <ul>
        <li>Voter identity and Merkle leaf index</li>
        <li>Private membership secret, salt, and authentication path</li>
        <li>The mapping from a member to a ballot or nullifier</li>
      </ul>
    </section>
  );
}
