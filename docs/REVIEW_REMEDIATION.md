# Review remediation: challenged re-review timeout

## Finding

The previous Bradbury challenged re-review transaction
`0x1e41ae0dea292d570187fd1475ee7460d1bbbd49fd40c2f360f9ad72424da5e8`
reached a validator timeout. Its first round recorded five revealed votes:

```text
DETERMINISTIC_VIOLATION, TIMEOUT, TIMEOUT,
DETERMINISTIC_VIOLATION, TIMEOUT
```

The leader produced a valid canonical `denied` proposal and the execution trace
contained no contract exception, but the proposal was never accepted into case
storage. The deployed contract therefore remained `CHALLENGED`.

## Root cause

The old validator callback fetched all three records, called the LLM again, and
required the independent model output to reproduce the leader's full decision
tuple exactly. This made the challenged path both expensive and sensitive to
normal nondeterministic model variation. The public receipt proves the validator
committee timed out or rejected the callback, but does not expose each
validator's private model output.

## First remediation attempt and remaining issue

The first remediation replaced exact LLM-output equality with a compact
candidate-support prompt. That still failed because it called `gl.nondet` from
inside the validator callback. Bradbury correctly recorded deterministic
violations, so that intermediate deployment is also historical.

## Final remediation

The revised source keeps the security boundary intact:

1. The leader still fetches and validates every pinned record and produces one
   canonical decision.
2. The deterministic validator callback independently re-checks the snapshot's
   issuer/path bindings and every consequential canonical result field.
3. The validator callback makes no web or LLM call, avoiding GenLayer's
   deterministic-violation rule.
4. Free-form model explanations, confidence, and reason text are not used as
   validator inputs beyond their deterministic canonical derivation.
5. Canonical errors remain safe and recoverable, and can never become an allow
   decision.

This removes the nondeterministic-validator and exact-equality failure modes
while retaining independent deterministic validator review and all
issuer-provenance controls. The final source must be deployed to a new Bradbury
address and pass a fresh challenged re-review before the Portal submission is
updated.

## Verification

- Local regression suite: 17 tests passing.
- `contracts/evidencebound_policy_gate.py` and
  `studio_bradbury/evidencebound_policy_gate.py`: byte-identical.
- Final source SHA-256: `9f8f2f77f91edb40e03cc0ed45a96a16109d6f2bd7260dfb2fcbe9b44fb6ca10`.
- The intermediate Bradbury deployment at
  `0xDe282Ff85c1A626dBF5Ca5Bc0CE1DeF6a8a5483F` is historical because its
  validator callback still made nondeterministic calls.
- Final remediation deployment: `0x783D0Ac74991408A12ED6ccC2977411984990d28`.
- The fresh accepted initial resolution, challenge, challenged re-review, and
  read-back all passed. The re-review returned `NEEDS_REVIEW` with
  `consensus_bound=true`; this is the expected policy result for the challenge
  fixture, not a validator failure.
