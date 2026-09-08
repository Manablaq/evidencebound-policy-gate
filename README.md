# EvidenceBound Policy Gate

EvidenceBound Policy Gate is a reusable GenLayer Intelligent Contract for
source-bound policy decisions. It is designed for cases where a downstream
contract needs a fresh, consensus-backed answer about a submission, entitlement,
profile, invoice, deliverable, or other claim.

## Bradbury deployment

Current corrected deployment: `0x783D0Ac74991408A12ED6ccC2977411984990d28`
Deployment transaction: `0x6eeb61056e626601aab40b8dea76d778462230c7add7353f36d518fd29cd2984`
Deployed source SHA-256: `9f8f2f77f91edb40e03cc0ed45a96a16109d6f2bd7260dfb2fcbe9b44fb6ca10`

The deployment was accepted with `AGREE / FINISHED_WITH_RETURN`. This revised
artifact includes enforceable issuer publisher URL provenance: each issuer is
registered to a safe HTTPS origin/path, and every evidence URL is checked at
submission and again during validator re-evaluation. It uses the documented
Bradbury web and prompt APIs and pins immutable raw fixture response bodies.
Use the deployment log for the full verification record. Earlier Bradbury
addresses are historical and must not be submitted. Fresh initial resolution
and challenged re-review both passed on the new address with five agreeing
validators and `FINISHED_WITH_RETURN` execution. Finalization remains deferred
until the challenge window closes.

The previous challenged re-review timeout and the revised validator design are
documented in [`docs/REVIEW_REMEDIATION.md`](docs/REVIEW_REMEDIATION.md).

```text
registered policy + two independent evidence records + submission
        -> validator-verified decision
        -> challenge window
        -> finalized, policy-bound predicate
```

## Why it is useful

The contract makes the trust boundary explicit instead of treating a URL or an
LLM response as authoritative:

- Issuers are allowlisted with a safe HTTPS publisher authority, source group, and key identity.
- Each case pins two evidence URLs, full-body SHA-256 hashes, record IDs,
  versions, issuer IDs, publication times, and expiry times.
- Each case and challenge URL must match its issuer's exact HTTPS origin and be
  the registered path or a descendant path. Credentials, query strings,
  fragments, percent-encoding, ports, and traversal segments are rejected.
- Each fetched record must carry a non-empty issuer signature artifact and a
  `signed_payload_hash` equal to the pinned full-body hash.
- The two evidence records must come from different source groups.
- The leader fetches and checks both records against the pinned snapshot;
  validators deterministically re-check the snapshot bindings and canonical
  result without web or LLM calls inside the validator callback.
- The semantic result is canonicalized to `allowed`, `denied`, `needs_review`,
  or `error`; confidence and reason are derived from the decision.
- Validators independently re-check the snapshot bindings and every
  consequential field of the leader's stable canonical decision through the
  deterministic validator callback; free-form explanations and model-specific
  confidence are never consensus inputs.
- A challenge supplies independent counter-evidence and forces a fresh review.
- Consumers require finalization, consensus binding, freshness, the exact
  policy version/digest, and a confidence threshold.
- Failed fetches and hash mismatches become a canonical recoverable error state.
- Expired cases can be recovered instead of remaining stuck indefinitely.

## Contract API

### Governance

- `register_issuer(...)`
- `set_issuer_active(...)`
- `register_policy(...)`
- `set_policy_active(...)`

The owner is the deployment sender. Issuer registration is an explicit trust
root: the contract binds each case to the registered issuer's source group,
publisher authority, and key identity. The evidence record must repeat those
values. This corrected implementation uses enforceable URL authority rules;
cryptographic signature verification remains an issuer/evidence-layer concern.

### Case lifecycle

- `open_case(...)` — snapshots the policy and two independent evidence records.
- `resolve_case(case_id)` — the leader reviews the snapshot under
  `run_nondet_unsafe`; validators deterministically re-check the snapshot
  binding and canonical result. The validator callback performs no web or LLM
  calls, as required by the GenLayer execution model.
- `submit_challenge(...)` — adds independent counter-evidence during the
  challenge window and invalidates the prior decision.
- `resolve_case(case_id)` — re-runs the challenged case from the new snapshot.
- `finalize_case(case_id)` — closes the challenge window and makes the decision
  consumable.
- `repair_case_evidence(...)` — replaces failed evidence while the case is still
  live, then resets it to an open retryable state.
- `recover_case(case_id)` — clears an expired case that never reached a usable
  final decision.

### Consumer views

- `get_case(case_id)`
- `get_policy(policy_id)`
- `get_issuer(issuer_id)`
- `is_allowed(case_id, policy_id, policy_version, policy_digest, min_confidence)`
- `is_denied(case_id, policy_id, policy_version, policy_digest, min_confidence)`
- `is_fresh(case_id)`

The consumer predicates deliberately require the caller to provide the exact
policy fingerprint. A decision for an older policy version cannot silently
authorize a newer policy. Registration also rejects a digest that does not equal
the SHA-256 hash of the exact policy text.

## Evidence record format

The URL pinned in a case must serve a JSON object containing at least:

```json
{
  "record_id": "invoice-2026-001",
  "issuer_id": "trusted-invoice-publisher",
  "issuer_key_id": "publisher-key-2026-01",
  "source_group": "issuer-a",
  "version": 1,
  "published_at": 1780000000,
  "valid_until": 1780600000,
  "signature": "base64-or-hex-signature-artifact",
  "signed_payload_hash": "<sha256-of-canonical-record-with-detached-fields-removed>",
  "observation": "..."
}
```

The contract hashes the complete UTF-8 response body for transport integrity,
and separately hashes the canonical JSON record after removing `signature` and
`signed_payload_hash` for detached issuer binding. It requires both hashes and
all identity/version/time fields to match the case snapshot. The authority rule
is enforced when a case/challenge is submitted and again inside each
validator's re-evaluation, so a caller cannot pin one issuer and fetch from an
impersonating host or ambiguous path. Use immutable raw URLs or commit-pinned
records; mutable homepages, dashboards, and API responses with live counters
are poor evidence sources. Cryptographic signature verification itself remains
outside GenVM because this corrected implementation chooses the reviewer's
origin/path remedy.

## Testing and audit

The test suite checks the source structure and regression-sensitive invariants:

- no `gl.nondet` call or storage write inside a contract method;
- complete-body hash pinning and metadata binding;
- distinct corroborating source groups;
- independent deterministic validator execution and candidate validation;
- no nondeterministic calls inside the validator callback;
- challenge invalidation and re-review;
- evidence repair and expiry recovery;
- finalization and exact policy fingerprint requirements; and
- source/deployment parity when a second deployable copy is used.

Run:

```bash
PYTHONPYCACHEPREFIX=/private/tmp/evidencebound-pycache \
  python3 -m py_compile contracts/evidencebound_policy_gate.py
python3 -m unittest discover -s tests -v
```

Before Portal submission, deploy the exact file from `contracts/`, verify its
source in Explorer, record the deployment transaction and contract address,
and submit those links together. Never submit a historical deployment link.

## Frontend workspace

The repository now includes a production-ready Next.js frontend for the
verified Bradbury deployment. It has a public landing page, a live case review
workspace, light/dark themes, responsive navigation, evidence provenance
cards, lifecycle visibility, wallet connection, and non-blocking transaction
feedback. After a Bradbury action is accepted, the workspace re-reads the case
in place instead of requiring a page reload.

The workspace supports a complete operator flow: load any known case ID, create
a case from editable policy/evidence metadata, submit independent challenge
evidence, resolve, finalize after the challenge window, repair failed evidence,
and recover expired cases. New-review transactions return a Bradbury transaction
identifier; after acceptance, enter the resulting case ID in the selector to
inspect that case because the current contract does not expose a case-list view.

The wallet control is session-aware: after connecting, open the account button
to view the full address, copy it, or disconnect it from this app. A browser
wallet account connection normally does not require a signature; a signature is
requested by the wallet only for a write transaction. App-level disconnect
clears the session here, while complete permission revocation is performed in
the wallet extension's connected-sites settings. Landing and workspace content
is visible by default, with scroll-in animation treated as an enhancement, so a
browser observer or hydration issue cannot leave the application blank.

Run locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. The frontend uses public Bradbury reads by
default. Wallet actions require a compatible browser wallet on Bradbury and
are intentionally opt-in. Production checks are:

```bash
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

The main UI is in `components/evidencebound-app.tsx`; the browser-facing
GenLayer adapter is in `lib/contract.ts`. The SDK is dynamically imported so
public page rendering remains independent of wallet availability.

Before signing, the UI checks for chain ID `4221` (Bradbury) and offers the
standard wallet switch/add-network request. It keeps the same lifecycle action
disabled while that action is still processing in consensus, while unrelated
work remains available. A read failure switches the workspace to a clearly
marked read-only fallback and disables state-changing forms. Client errors are
handled by `app/error.tsx`, and the initial load has a dedicated `app/loading.tsx`
state.
