const STORAGE_KEY = 'dao-voting-contract-v1';

export interface StoredVotingContract {
  address: string;
  zkBuildId: string;
}

export function loadStoredContract(): StoredVotingContract | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredVotingContract>;
    if (typeof parsed.address !== 'string' || typeof parsed.zkBuildId !== 'string') return null;
    return { address: parsed.address, zkBuildId: parsed.zkBuildId };
  } catch {
    return null;
  }
}

export function saveStoredContract(address: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      address,
      zkBuildId: import.meta.env.VITE_ZK_BUILD_ID ?? 'dev',
    } satisfies StoredVotingContract),
  );
}

export function clearStoredContract(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isStoredContractCompatible(contract: StoredVotingContract): boolean {
  return contract.zkBuildId === (import.meta.env.VITE_ZK_BUILD_ID ?? 'dev');
}
