# EvidenceBound Policy Gate

EvidenceBound Policy Gate is a reusable GenLayer Intelligent Contract for
source-bound policy decisions. It is designed for cases where a downstream
contract needs a fresh, consensus-backed answer about a submission, entitlement,
profile, invoice, deliverable, or other claim.

## Bradbury deployment

Current corrected deployment: `0xde282ff85c1a626dbf5ca5bc0ce1def6a8a5483f`
Deployment transaction: `0x3428bd5a718df449156665fbb82ed01b2feb67d69af746969abc0ee110261fcf`
Deployed source SHA-256: `1cfbc4eac2ac62bfa785e376de2e47f652cf60ac9f470c919d26c7fc450cac9f`

The deployment was accepted with `AGREE / FINISHED_WITH_RETURN`. This revised
artifact includes enforceable issuer publisher URL provenance: each issuer is
registered to a safe HTTPS origin/path, and every evidence URL is checked at
submission and again during validator re-evaluation. It uses the documented
Bradbury web and prompt APIs and pins immutable raw fixture response bodies.
Use the deployment log for the full verification record. Earlier Bradbury
addresses are historical and must not be submitted. Fresh initial resolution
verification is still processing on the new address; challenged re-review has
not yet been claimed as successful.

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
- Every validator fetches and checks both records against the pinned snapshot.
- The semantic result is canonicalized to `allowed`, `denied`, `needs_review`,
  or `error`; confidence and reason are derived from the decision.
- Validators independently re-fetch and verify the snapshot, then validate the
  leader's stable canonical decision with a compact support/contradiction check;
  free-form explanations and model-specific confidence are never consensus
  inputs.
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
- `resolve_case(case_id)` — the leader independently reviews the snapshot under
  `run_nondet_unsafe`; validators re-fetch the same snapshot and independently
  validate whether the canonical leader decision is supported.
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
- independent validator execution and candidate-support validation;
- no exact equality requirement for nondeterministic model output;
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
