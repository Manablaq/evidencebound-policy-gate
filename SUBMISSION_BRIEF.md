# Contract submission brief

## Title

EvidenceBound Policy Gate

## Category

Intelligent Contracts

## Summary

EvidenceBound Policy Gate is a reusable GenLayer contract that turns two
independently sourced, issuer-bound evidence records and a versioned policy
into a challengeable, finalization-gated decision. The leader and validators
independently fetch the same immutable snapshot and evaluate the policy. The
validator accepts the leader only when both canonical outputs bind the same
consequential decision; explanations can vary, but `allowed` and `denied`
cannot both pass for one snapshot.

## Scope

This branch contains only the contract, deployable Studio copy, immutable
fixtures, contract tests, and contract documentation. The complete
wallet-connected application is kept on the repository `main` branch for a
separate Project submission:

`https://github.com/Manablaq/evidencebound-policy-gate/tree/main`

## Review controls

- issuer allowlist, source groups, key IDs, and safe HTTPS origin/path binding;
- complete response-body hash and exact evidence metadata binding;
- detached signed-payload hash binding;
- independent validator re-evaluation and exact consequential decision
  comparison;
- canonical error handling that cannot become an allow decision;
- policy version and digest snapshots;
- challenge invalidation and fresh re-review;
- evidence repair and expiry recovery; and
- byte-identical contract and Studio deployment copies.

## Links

- contract artifact: `https://github.com/Manablaq/evidencebound-policy-gate/tree/contract-submission`;
- deployment and transaction: see `docs/DEPLOYMENT_LOG_BRADBURY.md`;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence specification: `docs/EVIDENCE_RECORD_SPEC.md`.
