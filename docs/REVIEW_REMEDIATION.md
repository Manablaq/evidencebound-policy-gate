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

## Remediation

The revised source keeps the security boundary intact:

1. The leader still fetches and validates every pinned record and produces one
   canonical decision.
2. Each validator still re-fetches every record and repeats URL-authority,
   metadata, detached-payload, and full-body hash checks.
3. Each validator independently checks whether the leader's stable canonical
   decision is supported or contradicted by the verified evidence.
4. Validators return only a compact boolean support result; free-form model
   explanations, confidence, and reason text are not compared across nodes.
5. Canonical errors remain safe and recoverable, and can never become an allow
   decision.

This removes the exact-equality failure mode while retaining independent
validator review and all issuer-provenance controls. The revised source must be
deployed to a new Bradbury address and pass a fresh challenged re-review before
the Portal submission is updated.

## Verification

- Local regression suite: 17 tests passing.
- `contracts/evidencebound_policy_gate.py` and
  `studio_bradbury/evidencebound_policy_gate.py`: byte-identical.
- Revised source SHA-256: `1cfbc4eac2ac62bfa785e376de2e47f652cf60ac9f470c919d26c7fc450cac9f`.
- Revised Bradbury deployment accepted: `0xDe282Ff85c1A626dBF5Ca5Bc0CE1DeF6a8a5483F`.
- Deployment transaction: `0x3428bd5a718df449156665fbb82ed01b2feb67d69af746969abc0ee110261fcf`.
- Fresh initial resolution transaction is still processing:
  `0xc8f2de04b8e850fc1ff7d780acbd52e1f6ce01dfefada5f017524aeff28605a2`.
- No challenged re-review success is claimed until a fresh accepted receipt and
  read-back are recorded.
