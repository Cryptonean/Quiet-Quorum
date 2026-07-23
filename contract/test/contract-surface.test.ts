import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.join(root, '../src/dao-voting.compact');

describe('dao-voting compact surface', () => {
  const source = readFileSync(contractPath, 'utf8');

  it('exports the Level 4 governance circuits', () => {
    for (const circuit of [
      'registerVoterRoot',
      'createProposal',
      'openProposal',
      'castVote',
      'closeProposal',
      'finalizeProposal',
      'cancelProposal',
    ]) {
      expect(source).toContain(`export circuit ${circuit}`);
    }
  });

  it('keeps domain-separated hash tags stable', () => {
    expect(source).toContain('dao-vote:owner:v1');
    expect(source).toContain('dao-vote:nullifier:v1');
    expect(source).toContain('dao-vote:leaf:v1');
    expect(source).toContain('dao-vote:node:v1');
  });

  it('rejects spent nullifiers and non-members', () => {
    expect(source).toContain('"nullifier spent"');
    expect(source).toContain('"not eligible"');
    expect(source).toContain('"proposal not active"');
  });
});
