# Review remediation: independent adjudication binding

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

The previously submitted validator callback checked only the snapshot bindings
and the shape of the leader's canonical result. Because it did not independently
derive the policy decision, a canonical `allowed` result and a canonical
`denied` result could both pass for the same evidence snapshot.

## Earlier remediation attempts

An earlier remediation tried a compact candidate-support prompt and retained
the old exact-equality approach in another version. Those paths were either
too sensitive to normal model variation or did not satisfy the validator
execution boundary on Bradbury. They remain historical deployments.

## Current remediation

The current source uses the documented `run_nondet_unsafe` pattern:

1. The leader still fetches and validates every pinned record and produces one
   canonical decision.
2. Each validator independently reruns the same snapshot evaluation, including
   the web retrieval and policy prompt, inside the validator function.
3. The validator checks both outputs against the immutable snapshot and requires
   the consequential decision to match exactly. Error results also require the
   same stable error code.
4. Free-form model explanations are not compared, while canonical confidence
   and reason fields remain deterministic functions of the decision.
5. Canonical errors remain safe and recoverable, and can never become an allow
   decision.

This prevents opposite canonical decisions from both passing the same snapshot
while preserving issuer provenance, detached payload binding, challenge
invalidation, repair, and expiry recovery.

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
