import {
  CompactTypeBytes,
  CompactTypeVector,
  persistentHash,
} from '@midnight-ntwrk/compact-runtime';

/** Browser MVP: 8 leaves → depth 3. */
export const LEAF_COUNT = 8;
export const TREE_DEPTH = 3;

export const DOMAIN = {
  owner: 'dao-vote:owner:v1',
  nullifier: 'dao-vote:nullifier:v1',
  leaf: 'dao-vote:leaf:v1',
  node: 'dao-vote:node:v1',
} as const;

const BYTES32 = new CompactTypeBytes(32);
const HASH2 = new CompactTypeVector(2, BYTES32);
const HASH3 = new CompactTypeVector(3, BYTES32);

export function padDomain(tag: string): Uint8Array {
  const bytes = new TextEncoder().encode(tag);
  if (bytes.length > 32) throw new Error(`domain "${tag}" exceeds 32 bytes`);
  const out = new Uint8Array(32);
  out.set(bytes);
  return out;
}

export function assertBytes32(value: Uint8Array, label: string): void {
  if (value.length !== 32) {
    throw new Error(`${label} must be 32 bytes, got ${value.length}`);
  }
}

export function ownerCommitment(secret: Uint8Array): Uint8Array {
  assertBytes32(secret, 'administratorSecret');
  return persistentHash(HASH2, [padDomain(DOMAIN.owner), secret]);
}

export function deriveNullifier(voterSecret: Uint8Array, proposalId: Uint8Array): Uint8Array {
  assertBytes32(voterSecret, 'voterSecret');
  assertBytes32(proposalId, 'proposalId');
  return persistentHash(HASH3, [padDomain(DOMAIN.nullifier), voterSecret, proposalId]);
}

export function leafCommit(voterSecret: Uint8Array, salt: Uint8Array): Uint8Array {
  assertBytes32(voterSecret, 'voterSecret');
  assertBytes32(salt, 'leafSalt');
  return persistentHash(HASH3, [padDomain(DOMAIN.leaf), voterSecret, salt]);
}

export function nodeHash(left: Uint8Array, right: Uint8Array): Uint8Array {
  assertBytes32(left, 'left');
  assertBytes32(right, 'right');
  return persistentHash(HASH3, [padDomain(DOMAIN.node), left, right]);
}

export function mixPath(goesRight: boolean, current: Uint8Array, sibling: Uint8Array): Uint8Array {
  return goesRight ? nodeHash(sibling, current) : nodeHash(current, sibling);
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('hex length must be even');
  const out = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function randomBytes32(random: () => number = Math.random): Uint8Array {
  const out = new Uint8Array(32);
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.floor(random() * 256);
  }
  return out;
}
