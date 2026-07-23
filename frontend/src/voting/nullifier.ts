const NULLIFIER_DOMAIN = 'dao-vote:nullifier:v1';
const encoder = new TextEncoder();

function encodeLength(value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error('field is too large to encode');
  }
  return Uint8Array.of(
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  );
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function field(value: Uint8Array): Uint8Array {
  return concat(encodeLength(value.length), value);
}

/**
 * Canonical preimage shared by browser witness tests and the future Compact circuit.
 * Production nullifiers are the Compact persistentHash of this domain-separated input.
 */
export function buildNullifierPreimage(
  voterSecret: Uint8Array,
  proposalId: Uint8Array,
): Uint8Array {
  if (voterSecret.length !== 32) throw new Error('voterSecret must be 32 bytes');
  if (proposalId.length !== 32) throw new Error('proposalId must be 32 bytes');
  return concat(field(encoder.encode(NULLIFIER_DOMAIN)), field(voterSecret), field(proposalId));
}
