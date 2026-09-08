export const CONTRACT_ADDRESS = "0x783D0Ac74991408A12ED6ccC2977411984990d28";
export const RPC_URL = "https://rpc-bradbury.genlayer.com";
export const EXPLORER_URL = `https://explorer-bradbury.genlayer.com/address/${CONTRACT_ADDRESS}`;
export const REPOSITORY_URL = "https://github.com/Manablaq/evidencebound-policy-gate";
export const FIXTURE_BASE_URL = "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples";

export const DEMO = {
  policyId: 1n,
  policyVersion: 1n,
  policyName: "Invoice entitlement gate",
  policyDigest: "d44a82e0b29678f854ff4d2b9db3490d3dbdcea7916bee2d8759486333da57e0",
  subject: "invoice-2026-001",
  submittedContent: "Invoice inv-2026-001 entitlement request",
  context: "Bradbury live demo with two independent records",
  evidenceAUri: `${FIXTURE_BASE_URL}/evidence_a.json`,
  evidenceAHash: "127c5e938e2beb01d608e4c3969aae694112d21f1bdb53cb068e86f3d25b8cd2",
  evidenceAIssuer: "publisher-a",
  evidenceARecordId: "invoice-2026-001-a",
  evidenceBUri: `${FIXTURE_BASE_URL}/evidence_b.json`,
  evidenceBHash: "acefdceade22183c67ad13a12740deb49103d9adbdfb36e70cfe71237feedc42",
  evidenceBIssuer: "publisher-b",
  evidenceBRecordId: "invoice-2026-001-b",
  challengeUri: `${FIXTURE_BASE_URL}/challenge.json`,
  challengeHash: "680df56b2e3d38df26a0b9d49f80ad3870a5e72e1d206a32aa38935871aa67a6",
  challengeIssuer: "publisher-c",
  challengeRecordId: "invoice-2026-001-c",
  timestamp: 1788798000n,
  validUntil: 1789402800n,
};

export const CASE_FIELDS = [
  "case_id", "requester", "policy_id", "policy_version", "policy_name", "policy_text", "policy_digest",
  "subject", "submitted_content", "context", "evidence_a_uri", "evidence_a_hash", "evidence_a_issuer",
  "evidence_a_group", "evidence_a_record_id", "evidence_a_version", "evidence_a_published_at",
  "evidence_a_valid_until", "evidence_b_uri", "evidence_b_hash", "evidence_b_issuer", "evidence_b_group",
  "evidence_b_record_id", "evidence_b_version", "evidence_b_published_at", "evidence_b_valid_until",
  "challenge_uri", "challenge_hash", "challenge_issuer", "challenge_group", "challenge_record_id",
  "challenge_version", "challenge_published_at", "challenge_valid_until", "challenge_note", "challenger",
  "created_at", "expires_at", "challenge_deadline", "last_resolved_at", "evidence_revision",
  "resolution_count", "status", "decision", "confidence", "reason_code", "summary", "resolved_evidence_a_hash",
  "resolved_evidence_b_hash", "resolved_challenge_hash", "consensus_bound",
] as const;

export type ChainCase = Record<(typeof CASE_FIELDS)[number], unknown>;

export async function getReadClient() {
  const [{ createClient }, { testnetBradbury }] = await Promise.all([
    import("genlayer-js"),
    import("genlayer-js/chains"),
  ]);
  return createClient({ chain: testnetBradbury, endpoint: RPC_URL }) as any;
}

export async function getWriteClient(account: string) {
  if (typeof window === "undefined" || !(window as Window & { ethereum?: unknown }).ethereum) {
    throw new Error("No browser wallet detected. Install a wallet connected to GenLayer Bradbury.");
  }
  const [{ createClient }, { testnetBradbury }] = await Promise.all([
    import("genlayer-js"),
    import("genlayer-js/chains"),
  ]);
  return createClient({
    chain: testnetBradbury,
    account: account as `0x${string}`,
    provider: (window as Window & { ethereum: unknown }).ethereum,
  }) as any;
}

export function asNumber(value: unknown) {
  return Number(value ?? 0);
}

export function shortHash(value: unknown, start = 10, end = 8) {
  const text = String(value ?? "");
  if (!text) return "—";
  if (text.length <= start + end + 1) return text;
  return `${text.slice(0, start)}…${text.slice(-end)}`;
}

export function statusName(value: unknown) {
  return ({ 1: "OPEN", 2: "RESOLVED", 3: "CHALLENGED", 4: "FINALIZED", 5: "EXPIRED", 6: "RECOVERED", 7: "ERROR" } as Record<number, string>)[asNumber(value)] ?? "UNKNOWN";
}

export function decisionName(value: unknown) {
  return ({ 0: "UNKNOWN", 1: "ALLOWED", 2: "DENIED", 3: "NEEDS REVIEW", 4: "ERROR" } as Record<number, string>)[asNumber(value)] ?? "UNKNOWN";
}

export function decisionTone(value: unknown) {
  return ({ ALLOWED: "positive", DENIED: "negative", "NEEDS REVIEW": "warning", ERROR: "negative" } as Record<string, string>)[decisionName(value)] ?? "neutral";
}

export function statusTone(value: unknown) {
  return ({ OPEN: "open", RESOLVED: "resolved", CHALLENGED: "challenged", FINALIZED: "finalized", ERROR: "error" } as Record<string, string>)[statusName(value)] ?? "neutral";
}
