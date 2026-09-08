# Portal submission brief

## Title

EvidenceBound Policy Gate

## One-line summary

A reusable GenLayer Intelligent Contract that turns independently sourced,
fresh, issuer-bound evidence into a challengeable, policy-version-bound
decision that downstream contracts can safely consume.

## Why this belongs in Intelligent Contracts

The contract uses GenLayer's non-deterministic web retrieval and semantic
adjudication where ordinary deterministic contracts cannot interpret real-world
evidence. The leader fetches and evaluates the evidence; validators
deterministically re-check the issuer/path bindings and exact decision-bearing
fields rather than trusting a leader's free-form answer.

## What is reusable

The same primitive can gate invoices, deliverables, entitlements, moderation
claims, compliance attestations, or agent outcomes. A caller supplies a
versioned policy and two independent evidence records; consumers then call
`is_allowed` or `is_denied` with the exact policy fingerprint and confidence
threshold.

## Review-proof details

- full response-body hashes and metadata binding;
- issuer allowlist, key identity, source groups, and detached signature artifact;
- enforceable issuer publisher URL provenance using safe HTTPS origin and exact
  path binding at case/challenge submission and validator re-evaluation;
- duplicate-source/record rejection;
- prompt-injection defense;
- independent deterministic validator re-check of issuer/path bindings and
  every consequential canonical result field;
- no web or LLM call inside the validator callback, avoiding deterministic
  violations while preserving the leader's nondeterministic evidence review;
- canonical `allowed` / `denied` / `needs_review` / `error` result;
- challenge invalidation and fresh re-review;
- evidence repair and expiry recovery; and
- exact audited-source/deployment-copy parity.

## Links to attach after deployment

- repository: `https://github.com/Manablaq/evidencebound-policy-gate`;
- contract address: `0x783D0Ac74991408A12ED6ccC2977411984990d28`;
- deployment transaction: `0x6eeb61056e626601aab40b8dea76d778462230c7add7353f36d518fd29cd2984`;
- deployed source SHA-256: `9f8f2f77f91edb40e03cc0ed45a96a16109d6f2bd7260dfb2fcbe9b44fb6ca10`;
- Explorer: `https://explorer-bradbury.genlayer.com/address/0x783D0Ac74991408A12ED6ccC2977411984990d28`;
- live Bradbury lifecycle: accepted setup, initial resolution, challenge, and challenged re-review are recorded in `docs/DEPLOYMENT_LOG_BRADBURY.md`;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence schema: `docs/EVIDENCE_RECORD_SPEC.md`.
