import {
  LEAF_COUNT,
  TREE_DEPTH,
  assertBytes32,
  leafCommit,
  mixPath,
  nodeHash,
} from './canonical.js';

export interface VoterLeaf {
  secret: Uint8Array;
  salt: Uint8Array;
}

export interface MerklePath {
  leafIndex: number;
  siblings: Uint8Array[];
  bits: boolean[];
}

export interface VoterMerkleTree {
  leaves: Uint8Array[];
  root: Uint8Array;
}

function emptyLeaf(): Uint8Array {
  // Deterministic empty placeholder so unused slots still form a stable root.
  return leafCommit(new Uint8Array(32), new Uint8Array(32));
}

export function buildVoterTree(voters: VoterLeaf[]): VoterMerkleTree {
  if (voters.length === 0 || voters.length > LEAF_COUNT) {
    throw new Error(`voter tree supports 1..${LEAF_COUNT} leaves, got ${voters.length}`);
  }

  const leaves = Array.from({ length: LEAF_COUNT }, (_, index) => {
    if (index < voters.length) {
      return leafCommit(voters[index].secret, voters[index].salt);
    }
    return emptyLeaf();
  });

  let level = leaves.map((leaf) => {
    assertBytes32(leaf, 'leaf');
    return leaf;
  });

  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(nodeHash(level[i], level[i + 1]));
    }
    level = next;
  }

  return { leaves, root: level[0] };
}

export function getMerklePath(tree: VoterMerkleTree, leafIndex: number): MerklePath {
  if (!Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex >= LEAF_COUNT) {
    throw new Error(`leafIndex must be in 0..${LEAF_COUNT - 1}`);
  }

  const siblings: Uint8Array[] = [];
  const bits: boolean[] = [];
  let level = [...tree.leaves];
  let index = leafIndex;

  for (let depth = 0; depth < TREE_DEPTH; depth++) {
    const goesRight = (index & 1) === 1;
    const siblingIndex = goesRight ? index - 1 : index + 1;
    siblings.push(level[siblingIndex]);
    bits.push(goesRight);
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(nodeHash(level[i], level[i + 1]));
    }
    level = next;
    index >>= 1;
  }

  return { leafIndex, siblings, bits };
}

export function reconstructRoot(
  leaf: Uint8Array,
  path: Pick<MerklePath, 'siblings' | 'bits'>,
): Uint8Array {
  if (path.siblings.length !== TREE_DEPTH || path.bits.length !== TREE_DEPTH) {
    throw new Error(`Merkle path must have depth ${TREE_DEPTH}`);
  }
  let current = leaf;
  for (let i = 0; i < TREE_DEPTH; i++) {
    current = mixPath(path.bits[i], current, path.siblings[i]);
  }
  return current;
}
