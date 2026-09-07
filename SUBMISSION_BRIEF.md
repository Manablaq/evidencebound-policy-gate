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
evidence. Validators independently fetch the evidence and reapply the policy;
they agree on exact decision-bearing fields rather than trusting a leader's
free-form answer.

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
- independent validator re-execution;
- canonical `allowed` / `denied` / `needs_review` / `error` result;
- challenge invalidation and fresh re-review;
- evidence repair and expiry recovery; and
- exact audited-source/deployment-copy parity.

## Links to attach after deployment

- repository: `https://github.com/Manablaq/evidencebound-policy-gate`;
- contract address: `0xa3c8291d30372e9990b6d7a4f22dd94b9d8abf97`;
- deployment transaction: `0xac7bb9697293951baf76c02c5f2cb822058afaf87d4ea5847a30941045f6f5ce`;
- deployed source SHA-256: `8f6f168802d13b0d251b2f7e7b23266141996907460d8008e08dc480998fcee3`;
- Explorer/source verification: `https://explorer-bradbury.genlayer.com/address/0xa3c8291d30372e9990b6d7a4f22dd94b9d8abf97`;
- live Bradbury lifecycle: run the commands in `docs/LIVE_DEMO_BRADBURY.md` after funding the deployer;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence schema: `docs/EVIDENCE_RECORD_SPEC.md`.
