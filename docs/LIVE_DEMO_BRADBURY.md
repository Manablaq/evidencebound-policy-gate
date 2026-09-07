# Live Bradbury demo plan

Deployment: `0xa3c8291d30372e9990b6d7a4f22dd94b9d8abf97`
Policy ID: `1`  
Policy digest: `d44a82e0b29678f854ff4d2b9db3490d3dbdcea7916bee2d8759486333da57e0`

## Publish fixtures first

Published repository: `https://github.com/Manablaq/evidencebound-policy-gate`

Immutable raw fixture base URL:
`https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples`

The live transactions and read-back results are recorded in
`DEPLOYMENT_LOG_BRADBURY.md`.

The commands below target the final reviewer-correction deployment.

## Register the three issuers

```bash
export C=0xa3c8291d30372e9990b6d7a4f22dd94b9d8abf97
export RPC=https://rpc-bradbury.genlayer.com

genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-a accounting-system https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples publisher-a-key-2026
genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-b delivery-system https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples delivery-system-key-2026
genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-c customer-dispute https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples challenge-key-2026
```

## Open and resolve the case

```bash
genlayer write --rpc "$RPC" "$C" open_case --args \
  1 invoice-2026-001 \
  "Invoice inv-2026-001 entitlement request" \
  "Bradbury live demo with two independent records" \
  "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/evidence_a.json" \
  127c5e938e2beb01d608e4c3969aae694112d21f1bdb53cb068e86f3d25b8cd2 \
  publisher-a invoice-2026-001-a 1 1788798000 1789402800 \
  "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/evidence_b.json" \
  acefdceade22183c67ad13a12740deb49103d9adbdfb36e70cfe71237feedc42 \
  publisher-b invoice-2026-001-b 1 1788798000 1789402800 \
  604800

genlayer write --rpc "$RPC" "$C" resolve_case --args 1
genlayer call --rpc "$RPC" "$C" get_case --args 1
```

Expected first resolution: `status=RESOLVED`, `decision=ALLOWED`,
`consensus_bound=true`, and `resolution_count=1`.

## Challenge and re-review

```bash
genlayer write --rpc "$RPC" "$C" submit_challenge --args \
  1 "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/challenge.json" \
  680df56b2e3d38df26a0b9d49f80ad3870a5e72e1d206a32aa38935871aa67a6 \
  publisher-c invoice-2026-001-c 1 1788798000 1789402800 \
  "Customer disputes delivery completion; re-review required."

genlayer write --rpc "$RPC" "$C" resolve_case --args 1
genlayer call --rpc "$RPC" "$C" get_case --args 1
```

The challenge must clear the previous decision and increment the evidence
revision. Finalize only after the challenge window closes and verify that the
consumer predicate stays false until finalization.
