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
- duplicate-source/record rejection;
- prompt-injection defense;
- independent validator re-execution;
- canonical `allowed` / `denied` / `needs_review` / `error` result;
- challenge invalidation and fresh re-review;
- evidence repair and expiry recovery; and
- exact audited-source/deployment-copy parity.

## Links to attach after deployment

- repository and corrected commit: pending deployment;
- contract address: `0x1799625F92fCB2A933C33B96C1C1a25328fFC14F`;
- deployment transaction: `0xc7f89e2699ab86a32d724218f2bb884985d56b8e412973d16ea521d70ba0094e`;
- Explorer/source verification: `https://explorer-bradbury.genlayer.com/`;
- Direct Mode test run: pending official runtime;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence schema: `docs/EVIDENCE_RECORD_SPEC.md`.
