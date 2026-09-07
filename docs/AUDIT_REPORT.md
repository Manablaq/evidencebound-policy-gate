# EvidenceBound Policy Gate audit report

Audit date: 2026-09-06  
Audited source: `contracts/evidencebound_policy_gate.py`  
Deployment copy: `studio_bradbury/evidencebound_policy_gate.py`  
Final corrected Bradbury deployment: `0xa3c8291d30372e9990b6d7a4f22dd94b9d8abf97`
Deployment transaction: `0xac7bb9697293951baf76c02c5f2cb822058afaf87d4ea5847a30941045f6f5ce`
Deployed source SHA-256: `8f6f168802d13b0d251b2f7e7b23266141996907460d8008e08dc480998fcee3`

## Executive result

The source passes the local static, AST, and adversarial invariant suite. The
deployment copy is byte-for-byte identical to the audited source. No finding is
currently rated critical or high in the contract logic.

The final corrected artifact has been accepted on Bradbury and the deployment
source hash is recorded above. The source includes enforceable publisher URL
provenance and uses the documented Bradbury web/prompt APIs. Immutable raw
fixtures were fetched and hash-verified in the live first resolution; the
challenge invalidation is also recorded in the deployment log.

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

### Evidence provenance and corroboration — PASS

Issuers are owner-registered with a publisher URI, source group, and key ID.
The publisher URI must be a deliberately limited HTTPS authority/path. Case and
challenge submission reject URLs with a different origin, a path-boundary
prefix, credentials, ports, queries, fragments, percent-encoding, malformed
ASCII host labels, or traversal segments. Every validator repeats the same
authority/path check before fetching during re-evaluation. Cases also require
two different source groups and reject duplicate evidence URLs or record IDs.
Records carry a detached signature artifact and canonical signed-payload hash;
the reviewer-requested enforceable remedy is the registered publisher URL
boundary, not a claim of asymmetric cryptography inside GenVM.

### Validator independence — PASS

The leader and validator both execute against the same immutable snapshot. The
validator independently re-fetches every record, repeats the publisher,
metadata, detached-payload, and full-body hash checks, then runs a compact
support/contradiction prompt against the leader's canonical decision. It does
not require two nondeterministic explanations or confidence fields to be
byte-for-byte identical.

### Stable consequential output — PASS

Free-form LLM explanations are not stored as consensus inputs. The canonical
decision is one of `allowed`, `denied`, `needs_review`, or `error`; confidence and
reason are deterministically derived. Validators approve only a valid candidate
that their independent evidence review supports. Invalid/malformed model output
becomes an explicit error rather than a permissive allow or an ambiguous
fallback.

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

### Timeout, failed fetch, and expiry recovery — PASS WITH REVISED VALIDATOR PATH

The validator path avoids the previous exact-equality failure mode: it uses a
small boolean support result instead of requiring an independent model to
reproduce the leader's complete decision tuple. Evidence or model failures
remain canonical and recoverable. The requester or owner can repair evidence
while the case is live, resetting the lifecycle to `OPEN`. An expired,
non-finalized case can be marked `RECOVERED`; no assets are held by this
primitive, so there is no permanently locked escrow balance.

### Deployment parity — PASS WITH SERIALIZATION NOTE

The Studio deployment file is byte-for-byte checked against the audited source.
Bradbury's `genlayer code` response contains two extra trailing blank lines,
but its normalized source content matches the audited file. The submitted
address must be the final corrected deployment listed above; all earlier
deployments are historical and must not be submitted.

## Local verification

```bash
PYTHONPYCACHEPREFIX=/private/tmp/evidencebound-pycache \
  python3 -m py_compile contracts/evidencebound_policy_gate.py
python3 -m unittest discover -s tests -v
```

Current result before the revision: 17 tests pass, including deployment parity,
detached-payload hash math, and adversarial publisher URL binding cases. The
previous Bradbury address is historical; the revised source must be deployed
and its new address and live re-review receipt recorded before submission.
