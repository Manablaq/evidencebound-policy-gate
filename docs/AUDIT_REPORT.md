# EvidenceBound Policy Gate audit report

Audit date: 2026-09-06  
Audited source: `contracts/evidencebound_policy_gate.py`  
Deployment copy: `studio_bradbury/evidencebound_policy_gate.py`  
Corrected Bradbury deployment: `0x1799625F92fCB2A933C33B96C1C1a25328fFC14F`

## Executive result

The source passes the local static, AST, and adversarial invariant suite. The
deployment copy is byte-for-byte identical to the audited source. No finding is
currently rated critical or high in the contract logic.

The corrected artifact has also been accepted on Bradbury, its schema loads, and
its deterministic policy-registration smoke test succeeded with unanimous
validator agreement. The full non-deterministic case path still needs public
immutable evidence fixtures before it can be exercised end-to-end.

## What the primitive does

It is a reusable policy gate for claims such as an invoice, entitlement,
deliverable, moderation result, or profile decision. A case snapshots an
immutable policy and two independently sourced evidence records. GenLayer
validators fetch and verify both records, independently run the semantic policy
review, and agree on a canonical decision. A challenge can add independent
counter-evidence and forces a fresh review. Only a finalized, unexpired,
consensus-bound decision with the exact policy fingerprint can be consumed.

## Findings and controls

### Evidence integrity — PASS

The case stores full-body SHA-256 hashes. Validators hash the complete UTF-8
response and reject mismatches. Metadata is checked against the case snapshot:
issuer, key ID, source group, record ID, version, publication time, and expiry.
Hash mismatch output is canonicalized to the expected hash so nodes do not
disagree merely because they fetched different bytes.

### Evidence provenance and corroboration — PASS WITH EXPLICIT BOUNDARY

Issuers are owner-registered with a publisher URI, source group, and key ID.
Cases require two different source groups and now reject duplicate evidence URLs
or record IDs. Records carry a detached signature artifact and a canonical
signed-payload hash.

Residual boundary: this contract does not perform asymmetric signature
verification. The issuer/evidence service must verify the signature before
publishing, while this contract provides the on-chain allowlist and exact hash,
identity, and freshness binding. This is documented rather than hidden.

### Validator independence — PASS

The leader and validator both execute the same full evaluation snapshot. The
validator does not merely check JSON shape: it independently fetches evidence,
reapplies the policy prompt, normalizes the result, and compares the decision,
confidence, reason code, evidence hashes, challenge hash, and error code.

### Equivalence and exact consequential output — PASS

Free-form LLM explanations are not stored as consensus inputs. The canonical
decision is one of `allowed`, `denied`, `needs_review`, or `error`; confidence and
reason are deterministically derived. Invalid/malformed model output becomes an
explicit error rather than a permissive allow or an ambiguous fallback.

### Prompt-injection resistance — PASS

Submitted content and evidence are delimited as untrusted data. The prompt
instructs the adjudicator to ignore embedded instructions, not invent facts,
and select allow/deny only when the policy is clear.

### Policy version binding — PASS

Policies are registered with a required SHA-256 fingerprint, and registration
rejects a digest that does not equal the exact policy text hash. Cases then take
immutable snapshots. Consumer predicates require the exact policy ID, version,
normalized digest, confidence threshold, finalized status, consensus binding,
and current freshness.

### Challenge and reinstatement safety — PASS

A challenge is restricted to the open window, requires independent evidence,
invalidates the prior decision, and changes the case to `CHALLENGED`. Re-review
uses the updated snapshot. There is no profile-update/reactivation path that can
silently bypass an old finding.

### Timeout, failed fetch, and expiry recovery — PASS

Evidence or model failures resolve to a canonical `ERROR` state. The requester
or owner can repair evidence while the case is live, resetting the lifecycle to
`OPEN`. An expired, non-finalized case can be marked `RECOVERED`; no assets are
held by this primitive, so there is no permanently locked escrow balance.

### Deployment parity — PASS WITH SERIALIZATION NOTE

The Studio deployment file is byte-for-byte checked against the audited source.
Bradbury's `genlayer code` response contains two extra trailing blank lines,
but its normalized source content matches the audited file. The submitted
address must be the corrected deployment, not the superseded failed address.

## Local verification

```bash
PYTHONPYCACHEPREFIX=/private/tmp/evidencebound-pycache \
  python3 -m py_compile contracts/evidencebound_policy_gate.py
python3 -m unittest discover -s tests -v
```

Current result: 14 tests pass, including deployment parity and detached-payload
hash math. Bradbury deployment, schema retrieval, and deterministic policy
registration have passed. Remaining end-to-end checks are live evidence
retrieval, non-deterministic resolution, challenge/re-review, and Explorer
source verification.
