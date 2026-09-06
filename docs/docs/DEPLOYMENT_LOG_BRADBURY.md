# Bradbury deployment log

Date: 2026-09-06  
Network: GenLayer Bradbury Testnet  
Chain ID: 4221  
RPC: `https://rpc-bradbury.genlayer.com`  
Deployer: `0x1f87Ae197af539253978d435aD45cCf28Fb95024` (`worker`)

## Corrected deployment

- Contract: `0x1799625F92fCB2A933C33B96C1C1a25328fFC14F`
- Transaction: `0xc7f89e2699ab86a32d724218f2bb884985d56b8e412973d16ea521d70ba0094e`
- Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`
- Initial validators: 3; last round validators: 5
- Schema retrieval: passed
- Deployed source: normalized content matches the audited source; the CLI
  response adds two trailing blank lines during source serialization.

## Live smoke test

Registered policy ID `1`:

```text
name: Invoice entitlement gate
policy: Allow only when both issuer records state that the invoice is paid and the delivery is complete.
version: 1
digest: d44a82e0b29678f854ff4d2b9db3490d3dbdcea7916bee2d8759486333da57e0
```

- Transaction: `0x74c8bdce881a73b97289153389718d4dbae2ee1e5ba223cc7d505ce6727a6219`
- Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`
- Validator votes: 5 × `AGREE`
- Read-back: `get_policy(1)` returned the exact name, text, version, digest, and
  active state.

## Superseded deployment — do not submit

- Address: `0x8714C7e5148D9C7599C27699338114F0c5a05B6B`
- Transaction: `0x4e26690747547c8fa2d4c9c801703ef84663b78df2431e2e2c91254ff703c912`
- Reason superseded: the first source used GenVM-incompatible regex validation;
  its later policy smoke test failed. It is not the corrected artifact.

## Remaining end-to-end step

The contract's non-deterministic path requires two public immutable JSON
evidence records with valid full-body hashes, issuer metadata, detached
signature artifacts, and independent source groups. No such public fixture URLs
were available in this workspace, so `open_case` and `resolve_case` have not
been run on Bradbury yet.
