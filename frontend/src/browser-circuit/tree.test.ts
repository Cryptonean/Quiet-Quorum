import { describe, expect, it } from 'vitest';
import { bytesEqual, leafCommit } from './canonical.js';
import { buildVoterTree, getMerklePath, reconstructRoot } from './tree.js';

describe('voter Merkle tree', () => {
  const voters = [
    { secret: new Uint8Array(32).fill(1), salt: new Uint8Array(32).fill(11) },
    { secret: new Uint8Array(32).fill(2), salt: new Uint8Array(32).fill(12) },
    { secret: new Uint8Array(32).fill(3), salt: new Uint8Array(32).fill(13) },
  ];

  it('builds a stable root for the same voter set', () => {
    const first = buildVoterTree(voters);
    const second = buildVoterTree(voters);
    expect(first.root).toEqual(second.root);
  });

  it('reconstructs the root from an inclusion path', () => {
    const tree = buildVoterTree(voters);
    const path = getMerklePath(tree, 1);
    const leaf = leafCommit(voters[1].secret, voters[1].salt);
    expect(bytesEqual(reconstructRoot(leaf, path), tree.root)).toBe(true);
  });

  it('rejects a tampered sibling path', () => {
    const tree = buildVoterTree(voters);
    const path = getMerklePath(tree, 0);
    const tampered = {
      ...path,
      siblings: path.siblings.map((sibling, index) =>
        index === 0 ? new Uint8Array(32).fill(255) : sibling,
      ),
    };
    const leaf = leafCommit(voters[0].secret, voters[0].salt);
    expect(bytesEqual(reconstructRoot(leaf, tampered), tree.root)).toBe(false);
  });
});
