# Live Bradbury demo plan

Deployment: `0x1799625F92fCB2A933C33B96C1C1a25328fFC14F`  
Policy ID: `1`  
Policy digest: `d44a82e0b29678f854ff4d2b9db3490d3dbdcea7916bee2d8759486333da57e0`

## Publish fixtures first

Publish `examples/evidence_a.json`, `examples/evidence_b.json`, and
`examples/challenge.json` at immutable public HTTPS URLs. Replace
`<PUBLIC_BASE_URL>` below with the final base URL. The issuer publisher URIs
must be the real issuer/repository URLs, not a placeholder.

## Register the three issuers

```bash
export C=0x1799625F92fCB2A933C33B96C1C1a25328fFC14F
export RPC=https://rpc-bradbury.genlayer.com

genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-a accounting-system https://<issuer-a-publisher> publisher-a-key-2026
genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-b delivery-system https://<issuer-b-publisher> delivery-system-key-2026
genlayer write --rpc "$RPC" "$C" register_issuer --args \
  publisher-c customer-dispute https://<issuer-c-publisher> challenge-key-2026
```

## Open and resolve the case

```bash
genlayer write --rpc "$RPC" "$C" open_case --args \
  1 invoice-2026-001 \
  "Invoice inv-2026-001 entitlement request" \
  "Bradbury live demo with two independent records" \
  "https://<PUBLIC_BASE_URL>/evidence_a.json" \
  a95497ac94db8baaf13a705909c1f65f1582a673afba48432dd2f82efaa3febc \
  publisher-a invoice-2026-001-a 1 1788685000 1788771400 \
  "https://<PUBLIC_BASE_URL>/evidence_b.json" \
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
  1 "https://<PUBLIC_BASE_URL>/challenge.json" \
  ccdf83a459136d6cc25e23c676ab2931cbb582c1f11a43b3204aadf2e5d7083d \
  publisher-c invoice-2026-001-c 1 1788685000 1788771400 \
  "Customer disputes delivery completion; re-review required."

genlayer write --rpc "$RPC" "$C" resolve_case --args 1
genlayer call --rpc "$RPC" "$C" get_case --args 1
```

The challenge must clear the previous decision and increment the evidence
revision. Finalize only after the challenge window closes and verify that the
consumer predicate stays false until finalization.
