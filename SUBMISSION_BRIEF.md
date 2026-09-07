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
- contract address: `0x50918B2954732002c62D811E111570064123Ee5F`;
- deployment transaction: `0x0b386d41f7d01b9093cbae92badc96b23f025cf36c04f3953057c82a81625097`;
- deployed source SHA-256: `38c68f1a09e660b4ac16bc7bde2c170dc345cc663dd02df835104d8d99b8a2a8`;
- Explorer/source verification: `https://explorer-bradbury.genlayer.com/address/0x50918B2954732002c62D811E111570064123Ee5F`;
- live Bradbury lifecycle: run the commands in `docs/LIVE_DEMO_BRADBURY.md` after funding the deployer;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence schema: `docs/EVIDENCE_RECORD_SPEC.md`.
