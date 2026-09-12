# EvidenceBound Policy Gate — contract submission artifact

This branch is the contract-focused submission artifact for EvidenceBound
Policy Gate. The complete wallet-connected application remains on the
[`main`](https://github.com/Manablaq/evidencebound-policy-gate/tree/main)
branch and should be submitted under Project.

## Bradbury deployment

The corrected source is ready for a fresh Bradbury deployment from
`contracts/evidencebound_policy_gate.py`. The previous address recorded in
[`docs/DEPLOYMENT_LOG_BRADBURY.md`](docs/DEPLOYMENT_LOG_BRADBURY.md) is
historical because it predates the independent adjudication comparison.

Current source SHA-256:

```text
499057d191b55789291248254ffd71fe9e9b66e03de6f8056330f3bf84b9ef09
```

The `studio_bradbury/` copy is byte-identical to the audited contract source.
After deployment, submit only the fresh address and transaction whose
Explorer source matches this hash.

## What the contract does

The contract turns two independently sourced, issuer-bound evidence records
and a versioned policy into a challengeable GenLayer decision. It supports:

- owner-registered issuers with source groups, key IDs, and safe HTTPS publisher
  authorities;
- full response-body SHA-256 hashes, detached signed-payload hashes, and exact
  record metadata binding;
- fresh leader and validator web retrieval plus semantic policy evaluation;
- validator comparison of the consequential `allowed`, `denied`,
  `needs_review`, or `error` decision for the same immutable snapshot;
- policy snapshots and exact version/digest checks for consumers;
- challenge invalidation, fresh re-review, evidence repair, and expiry recovery;
  and
- finalization-gated `is_allowed` and `is_denied` consumer predicates.

The validator intentionally compares the decision field and stable error code,
while explanations may vary between models. Therefore a canonical `allowed`
result and a canonical `denied` result cannot both pass validation for one
evidence snapshot.

## Contract API

Governance: `register_issuer`, `set_issuer_active`, `register_policy`, and
`set_policy_active`.

Lifecycle: `open_case`, `resolve_case`, `submit_challenge`, `finalize_case`,
`repair_case_evidence`, and `recover_case`.

Consumer views: `get_case`, `get_policy`, `get_issuer`, `is_allowed`,
`is_denied`, and `is_fresh`.

## Evidence fixtures and documentation

The immutable fixture examples are in [`examples/`](examples). The record
format and hash rules are in
[`docs/EVIDENCE_RECORD_SPEC.md`](docs/EVIDENCE_RECORD_SPEC.md). The audit,
remediation, and live verification records are in [`docs/`](docs).

## Verification

Run from the repository root:

```bash
PYTHONPYCACHEPREFIX=/private/tmp/evidencebound-pycache \
  python3 -m py_compile contracts/evidencebound_policy_gate.py \
  studio_bradbury/evidencebound_policy_gate.py
python3 -m unittest discover -s tests -v
```

The tests include a source-level regression proving that opposite canonical
decisions fail validator matching and that the deployment copy matches the
audited source.
