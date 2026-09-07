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
- independent validator re-fetch and candidate-support validation;
- compact validator output that avoids exact equality of nondeterministic model
  explanations;
- canonical `allowed` / `denied` / `needs_review` / `error` result;
- challenge invalidation and fresh re-review;
- evidence repair and expiry recovery; and
- exact audited-source/deployment-copy parity.

## Links to attach after deployment

- repository: `https://github.com/Manablaq/evidencebound-policy-gate`;
- contract address: `0xDe282Ff85c1A626dBF5Ca5Bc0CE1DeF6a8a5483F`;
- deployment transaction: `0x3428bd5a718df449156665fbb82ed01b2feb67d69af746969abc0ee110261fcf`;
- deployed source SHA-256: `1cfbc4eac2ac62bfa785e376de2e47f652cf60ac9f470c919d26c7fc450cac9f`;
- Explorer/source verification: `https://explorer-bradbury.genlayer.com/address/0xDe282Ff85c1A626dBF5Ca5Bc0CE1DeF6a8a5483F`;
- live Bradbury lifecycle: run the commands in `docs/LIVE_DEMO_BRADBURY.md` after funding the deployer;
- audit report: `docs/AUDIT_REPORT.md`;
- evidence schema: `docs/EVIDENCE_RECORD_SPEC.md`.
