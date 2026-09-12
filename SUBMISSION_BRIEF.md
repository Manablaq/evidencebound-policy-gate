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
evidence. The leader fetches and evaluates the evidence; each validator
independently reruns that source-grounded evaluation against the same snapshot
and must agree on the consequential decision field.

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
- independent validator re-evaluation with exact comparison of the
  consequential decision field;
- both runs re-check issuer/path bindings, hashes, metadata, and canonical
  fields while allowing free-form explanations to vary;
- canonical `allowed` / `denied` / `needs_review` / `error` result;
- challenge invalidation and fresh re-review;
- evidence repair and expiry recovery; and
- exact audited-source/deployment-copy parity.

## Links to attach after the corrected deployment

- Project application repository: `https://github.com/Manablaq/evidencebound-policy-gate`;
- contract submission artifact: the `contract-submission` branch of that
  repository (frontend files are excluded from that artifact);
- contract address: pending fresh Bradbury deployment from commit `3da288c`;
- deployment transaction and Explorer URL: record the fresh deployment only;
- deployed source SHA-256: `499057d191b55789291248254ffd71fe9e9b66e03de6f8056330f3bf84b9ef09`;
- previous address `0x783D0Ac74991408A12ED6ccC2977411984990d28` is historical and must not be submitted for this correction;
- live Bradbury lifecycle: record accepted deployment, independent initial resolution, challenge, and challenged re-review in `docs/DEPLOYMENT_LOG_BRADBURY.md`;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence schema: `docs/EVIDENCE_RECORD_SPEC.md`.
