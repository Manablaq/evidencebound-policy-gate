# Live Bradbury demo plan

Deployment: `0x50918B2954732002c62D811E111570064123Ee5F`
Policy ID: `1`  
Policy digest: `d44a82e0b29678f854ff4d2b9db3490d3dbdcea7916bee2d8759486333da57e0`

## Publish fixtures first

Published repository: `https://github.com/Manablaq/evidencebound-policy-gate`

Raw fixture base URL:
`https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples`

The live transactions and read-back results are recorded in
`DEPLOYMENT_LOG_BRADBURY.md`.

The commands below target the final reviewer-correction deployment. They have
not been executed on this fresh address yet; run them only after the deployer
has enough Bradbury GEN for the issuer, policy, case, and resolution writes.

## Register the three issuers

```bash
export C=0x50918B2954732002c62D811E111570064123Ee5F
export RPC=https://rpc-bradbury.genlayer.com

genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-a accounting-system https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/evidence_a.json publisher-a-key-2026
genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-b delivery-system https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/evidence_b.json delivery-system-key-2026
genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-c customer-dispute https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/challenge.json challenge-key-2026
```

## Open and resolve the case

```bash
genlayer write --rpc "$RPC" "$C" open_case --args \
  1 invoice-2026-001 \
  "Invoice inv-2026-001 entitlement request" \
  "Bradbury live demo with two independent records" \
  "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/evidence_a.json" \
  a95497ac94db8baaf13a705909c1f65f1582a673afba48432dd2f82efaa3febc \
  publisher-a invoice-2026-001-a 1 1788685000 1788771400 \
  "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples/evidence_b.json" \
  80f7f1f1376310119aae8080663b24c14dd7665d420eaf89f9716cdbfe6a0beb \
  publisher-b invoice-2026-001-b 1 1788685000 1788771400 \
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
  ccdf83a459136d6cc25e23c676ab2931cbb582c1f11a43b3204aadf2e5d7083d \
  publisher-c invoice-2026-001-c 1 1788685000 1788771400 \
  "Customer disputes delivery completion; re-review required."

genlayer write --rpc "$RPC" "$C" resolve_case --args 1
genlayer call --rpc "$RPC" "$C" get_case --args 1
```

The challenge must clear the previous decision and increment the evidence
revision. Finalize only after the challenge window closes and verify that the
consumer predicate stays false until finalization.
