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

## Public fixture and end-to-end lifecycle

Repository: `https://github.com/Manablaq/evidencebound-policy-gate`

The three published raw fixtures were fetched independently and matched their
pinned body hashes before submission:

- `evidence_a.json`: `a95497ac94db8baaf13a705909c1f65f1582a673afba48432dd2f82efaa3febc`
- `evidence_b.json`: `80f7f1f1376310119aae8080663b24c14dd7665d420eaf89f9716cdbfe6a0beb`
- `challenge.json`: `ccdf83a459136d6cc25e23c676ab2931cbb582c1f11a43b3204aadf2e5d7083d`

Successful Bradbury transactions:

- issuer `publisher-a`: `0x9585578af42cee7e3cce4452f8c33dd4f7a5f29cc669145f0fd475ae5f7c7b1c`
- issuer `publisher-b`: `0xd3e1e9ec68f441070c24eb214189865e529d12bf618345d3c53b9161e9fbcf3e`
- issuer `publisher-c`: `0x527b419d9e885d5e462fa659f362d71a2696f283fa768cb30452a5ab0b3e398b`
- `open_case(1)`: `0xe6201d54d23a6f75d5b961947881f1b0b97c99e4e5f940aacf2040ab0b089d9d`
- first `resolve_case(1)`: `0x3980ff4dc0f9191814b35748e1128bed55302f662c14d6e03aeedbbe47463527`
- `submit_challenge(1)`: `0x84c8173698895083792bb70f097efe72f4df023a3249873b20b69f2755071895`
- challenged `resolve_case(1)` retry: `0xbfef3b83178bad62735446e22e001d9f66f508aea580b9fd204cb9090aef198a`

Read-back after the first resolution was `status=RESOLVED`,
`decision=ALLOWED`, `confidence=9500`, and `consensus_bound=true`. After the
challenge it became `status=CHALLENGED`, `decision=UNKNOWN`, and
`consensus_bound=false`; after the retry it returned to `status=RESOLVED`,
`resolution_count=2`, `consensus_bound=true`, with the challenge hash bound in
`resolved_challenge_hash`. `is_allowed(1, 1, 1, digest, 9000)` correctly
returned `false` because the challenge window has not closed and the case is
not finalized yet. Finalization is intentionally deferred until the recorded
challenge deadline.

## Superseded deployment — do not submit

- Address: `0x8714C7e5148D9C7599C27699338114F0c5a05B6B`
- Transaction: `0x4e26690747547c8fa2d4c9c801703ef84663b78df2431e2e2c91254ff703c912`
- Reason superseded: the first source used GenVM-incompatible regex validation;
  its later policy smoke test failed. It is not the corrected artifact.

## Finalization note

The contract's finalization guard is working as designed: a resolved decision
is not consumable while the challenge window is open. Run `finalize_case(1)`
after the recorded challenge deadline and then re-check `is_allowed`.
