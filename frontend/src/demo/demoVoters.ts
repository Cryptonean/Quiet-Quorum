import { randomBytes32 } from '../browser-circuit/canonical.js';
import { buildVoterTree, getMerklePath, type VoterLeaf } from '../browser-circuit/tree.js';

export interface DemoVoter {
  label: string;
  leafIndex: number;
  secret: Uint8Array;
  salt: Uint8Array;
  pathSiblings: Uint8Array[];
  pathBits: boolean[];
}

export interface DemoRegistry {
  administratorSecret: Uint8Array;
  voters: DemoVoter[];
  root: Uint8Array;
  leaves: VoterLeaf[];
}

/** Deterministic demo registry for local/Preprod walkthroughs. */
export function createDemoRegistry(seed = 42): DemoRegistry {
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  const administratorSecret = randomBytes32(random);
  const leaves: VoterLeaf[] = Array.from({ length: 4 }, () => ({
    secret: randomBytes32(random),
    salt: randomBytes32(random),
  }));

  const tree = buildVoterTree(leaves);
  const voters = leaves.map((leaf, leafIndex) => {
    const path = getMerklePath(tree, leafIndex);
    return {
      label: `Voter ${leafIndex + 1}`,
      leafIndex,
      secret: leaf.secret,
      salt: leaf.salt,
      pathSiblings: path.siblings,
      pathBits: path.bits,
    };
  });

  return { administratorSecret, voters, root: tree.root, leaves };
}
