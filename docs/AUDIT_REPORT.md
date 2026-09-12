# EvidenceBound Policy Gate audit report

Audit date: 2026-09-08
Audited source: `contracts/evidencebound_policy_gate.py`  
Deployment copy: `studio_bradbury/evidencebound_policy_gate.py`  
Current corrected Bradbury deployment: `0x783D0Ac74991408A12ED6ccC2977411984990d28`
Deployment transaction: `0x6eeb61056e626601aab40b8dea76d778462230c7add7353f36d518fd29cd2984`
Deployed source SHA-256: `9f8f2f77f91edb40e03cc0ed45a96a16109d6f2bd7260dfb2fcbe9b44fb6ca10`

## Executive result

The source passes the local static, AST, and adversarial invariant suite. The
deployment copy is byte-for-byte identical to the audited source. No finding is
currently rated critical or high in the contract logic.

The revised artifact has been accepted on Bradbury and the deployment source
hash is recorded above. The source includes enforceable publisher URL
provenance and uses the documented Bradbury web/prompt APIs. A fresh live
initial resolution and challenged re-review both completed with five agreeing
validators and `FINISHED_WITH_RETURN` execution.

## What the primitive does

It is a reusable policy gate for claims such as an invoice, entitlement,
deliverable, moderation result, or profile decision. A case snapshots an
immutable policy and two independently sourced evidence records. The leader
fetches and verifies the records and runs semantic policy review; each validator
independently repeats that source-grounded review and compares the
consequential decision before agreeing on the candidate. A challenge can add
independent counter-evidence and forces a fresh review. Only a finalized,
unexpired, consensus-bound decision
with the exact policy fingerprint can be consumed.

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

The leader executes the nondeterministic web retrieval and semantic review
against an immutable snapshot. The validator callback independently reruns that
same source-grounded evaluation against the snapshot, then checks both outputs'
publisher bindings, source-group separation, duplicate guards, and canonical
fields. It requires the consequential decision to match exactly, including the
error code for an error result. Explanations may differ across models and are
not consensus inputs. This prevents an `allowed` candidate and a `denied`
candidate from both being valid for the same snapshot.

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

The validator path compares only the consequential decision and stable error
code, so normal explanation differences do not prevent agreement while a
decision mismatch does. Both evaluations remain inside the documented
`run_nondet_unsafe` leader/validator boundary. Evidence or model failures
remain canonical and recoverable. The requester or owner can repair evidence
while the case is live, resetting the lifecycle to `OPEN`. An expired,
non-finalized case can be marked `RECOVERED`; no assets are held by this
primitive, so there is no permanently locked escrow balance.

### Deployment parity — PASS WITH SERIALIZATION NOTE

The Studio deployment file is byte-for-byte checked against the audited source.
The deployment transaction was created directly from that exact audited file,
whose SHA-256 is recorded above; the Bradbury CLI's `genlayer code` method is
Studio-only, so the explorer address is the public source-verification link.
The submitted address must be the current corrected deployment listed above;
all earlier deployments are historical and must not be submitted.

## Local verification

```bash
PYTHONPYCACHEPREFIX=/private/tmp/evidencebound-pycache \
  python3 -m py_compile contracts/evidencebound_policy_gate.py
python3 -m unittest discover -s tests -v
```

Current result: 17 tests pass, including deployment parity, detached-payload
hash math, and adversarial publisher URL binding cases. The exact tested source
was deployed to the address listed above; deployment, fresh initial resolution,
challenge, and challenged re-review were all accepted with five agreeing
validators. The final challenged decision is `NEEDS_REVIEW` with
`consensus_bound=true`; finalization remains deferred until the recorded
challenge window closes.
