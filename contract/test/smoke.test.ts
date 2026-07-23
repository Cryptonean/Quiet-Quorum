import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.join(root, '../src/dao-voting.compact');

describe('contract source', () => {
  it('declares Compact language_version >= 0.23', () => {
    const source = readFileSync(contractPath, 'utf8');
    expect(source).toMatch(/pragma language_version\s*>=\s*0\.23/);
  });
});
