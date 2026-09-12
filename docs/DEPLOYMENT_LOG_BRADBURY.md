# Bradbury deployment log

Date: 2026-09-08
Network: GenLayer Bradbury Testnet  
Chain ID: 4221  
RPC: `https://rpc-bradbury.genlayer.com`  
Deployer: `0x1f87Ae197af539253978d435aD45cCf28Fb95024` (`worker`)

## Historical prior deployment — do not submit for the current correction

- Contract: `0x783D0Ac74991408A12ED6ccC2977411984990d28`
- Transaction: `0x6eeb61056e626601aab40b8dea76d778462230c7add7353f36d518fd29cd2984`
- Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`
- Deployed source SHA-256: `9f8f2f77f91edb40e03cc0ed45a96a16109d6f2bd7260dfb2fcbe9b44fb6ca10`
- Source and Studio copies were byte-identical before deployment.
- This deployment predates the independent consequential-decision comparison
  added in commit `3da288c`; it is historical and must not be submitted for
  the current correction.
- Fresh setup transactions all returned `ACCEPTED / AGREE / FINISHED_WITH_RETURN`:
  - issuer `publisher-a`: `0x4f81fe30c7f0884201bf92f6a6dc4dcf4288e48a622a6db21df21791133f6328`
  - issuer `publisher-b`: `0xb278d9196fdd1d9e1af771aa2f555b7979c0e14e92bc0814fd69a5a62811c4d3`
  - issuer `publisher-c`: `0xaa11c1e267a46416e4ce175d24af787bea2372d7478f40e8072b8a92ab68684e`
  - policy `1`: `0x1a8804881e7b183452b88ac2754e57030b2bf329f50e40d2fd45188a04b90a26`
  - `open_case(1)`: `0x558640a94a9d555bf6968fee1fb8bf6119fcbab34d11ce9c15183bdc6ac6926f`
- Fresh initial `resolve_case(1)`: `0x51f551fb4e841fb5df06edd60b34523abd04697d0c1ae5b6c3428339c33d49ce`.
  Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`; five validator votes
  were `AGREE`; read-back was `RESOLVED / ALLOWED`, confidence `9500`,
  `consensus_bound=true`, resolution count `1`.
- `submit_challenge(1)`: `0x7b918415cd3074cbda27b2f71414a621d73aecedddda03865b377532e0d0193c`.
  Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`; read-back was
  `CHALLENGED / UNKNOWN`, `consensus_bound=false`, evidence revision `2`.
- Challenged `resolve_case(1)`: `0x201f36f999683eaf0e75446408a85dae3d71f74865ff54cd0d1675a94514554a`.
  Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`; five validator votes
  were `AGREE`; read-back was `RESOLVED / NEEDS_REVIEW`, confidence `6000`,
  `consensus_bound=true`, resolution count `2`, and the challenge hash was
  bound in `resolved_challenge_hash`.
- Finalization was intentionally not submitted because the challenge window is
  still open. Consumers correctly remain blocked until finalization.

## Corrected source awaiting fresh deployment

- Source commit: `3da288c`
- Source SHA-256: `499057d191b55789291248254ffd71fe9e9b66e03de6f8056330f3bf84b9ef09`
- Contract source: `contracts/evidencebound_policy_gate.py`
- Matching Studio copy: `studio_bradbury/evidencebound_policy_gate.py`
- Required validator behavior: each validator independently reruns the
  source-grounded evaluation for the immutable snapshot and must match the
  leader's consequential decision; opposite `allowed` and `denied` outcomes
  cannot both pass.
- Deployment status: pending a fresh Bradbury transaction reaching
  `ACCEPTED / AGREE / FINISHED_WITH_RETURN`.

## Historical first stable-validator remediation deployment — do not submit

- Contract: `0xDe282Ff85c1A626dBF5Ca5Bc0CE1DeF6a8a5483F`
- Transaction: `0x3428bd5a718df449156665fbb82ed01b2feb67d69af746969abc0ee110261fcf`
- Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`
- Deployed source SHA-256: `1cfbc4eac2ac62bfa785e376de2e47f652cf60ac9f470c919d26c7fc450cac9f`
- Source and Studio copies are byte-identical.
- Schema verification: passed; `resolve_case` and `register_issuer` are present.
- Fresh setup transactions all returned `ACCEPTED / AGREE / FINISHED_WITH_RETURN`:
  - issuer `publisher-a`: `0xc3fac391c5216aac4d4ea666be79bb66a4358b8816b429e167284e3eb7c4321c`
  - issuer `publisher-b`: `0xc40f63be924bba0eb9c9a3365a353813f2884486368a1a4d85ff13fe6fe345e6`
  - issuer `publisher-c`: `0x545cd54beb2370a2edcd0f98cbec771fd4092aa3b224df620960b4089045f0f6`
  - policy `1`: `0x5f696cb04b5479709121297775cf45f39c3b380785c13e4af7e6002ccd598e79`
  - `open_case(1)`: `0x25a049b450ee001ccd5313358c589ad4b17e0154a8c8a4e9e38f6c2603b10006`
- Fresh initial resolution: `0xc8f2de04b8e850fc1ff7d780acbd52e1f6ce01dfefada5f017524aeff28605a2`.
  At the latest check it remained `COMMITTING` with 4/5 commits and 0/5
  reveals; no success or timeout is claimed yet.
- The challenged re-review has not been started on this new address because
  the initial resolution must first reach an accepted state.

## Final reviewer-correction deployment

- Contract: `0xa3c8291d30372e9990b6d7a4f22dd94b9d8abf97`
- Transaction: `0xac7bb9697293951baf76c02c5f2cb822058afaf87d4ea5847a30941045f6f5ce`
- Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`
- Deployed source SHA-256: `8f6f168802d13b0d251b2f7e7b23266141996907460d8008e08dc480998fcee3`
- Source copies: `contracts/evidencebound_policy_gate.py` and
  `studio_bradbury/evidencebound_policy_gate.py` are byte-identical.
- Reviewer correction: issuer publisher URLs are validated as safe HTTPS
  origin/path authorities at issuer registration, case/challenge submission,
  and validator re-evaluation before any web fetch.
- Web compatibility: the contract uses the documented `gl.nondet.web.get()`
  response body API and `gl.nondet.exec_prompt(..., response_format="json")`.
- Live lifecycle: canonical issuer registrations, policy registration, and
  `open_case(1)` all returned `ACCEPTED / AGREE / FINISHED_WITH_RETURN`.
- `resolve_case(1)` transaction: `0x806aceec791f017f1b5a8d110278769380cc1cee004b3d385fd67cd43df05971`;
  read-back: `RESOLVED / ALLOWED`, confidence `9500`,
  `consensus_bound=true`, resolution count `1`.
- `submit_challenge(1)` transaction: `0xd52076051bad5b85222af6d900ba9059eea9c75801ca85934c74e3542c45da0b`;
  read-back immediately after acceptance: `CHALLENGED / UNKNOWN`,
  `consensus_bound=false`, evidence revision `2`.
- The first challenged re-review attempt reached `LEADER_TIMEOUT` without a
  state change. The first retry was later canceled without a state change
  (`0xb186de18a7e2bf37c3ee3a55c3e7af37339a7ee9c2f29c57fffe3b1d537285c5`).
  A second retry is currently pending as
  `0x1e41ae0dea292d570187fd1475ee7460d1bbbd49fd40c2f360f9ad72424da5e8`.
  No finalization or challenged re-review success is claimed until that
  transaction receives an execution result.

Live setup transactions on this final address:

- issuer `publisher-a`: `0x582961c224ede0778232b4dcdcee83d29db28dc29c2d64d89bfb2045576febcf`
- issuer `publisher-b`: `0x641cdab3d1dbdf8cbd6500e582f28af641e1be3c9c1f7eaa80b54c9d302fedb6`
- issuer `publisher-c`: `0xd29cf9fad079dd12c30f48a2dd7115027044eb1af37210a621b73a0599bcff7b`
- policy `1`: `0x4fc29a8c1910f155da7fefbd3340d936349e0bbd60b3d3f3f68299845aa50269`
- `open_case(1)`: `0x6fdc28b428c67bf6b774654106e8c293db73fb81e7ad546524dbae8b56a63d64`

Pinned raw fixture hashes:

- `evidence_a.json`: `127c5e938e2beb01d608e4c3969aae694112d21f1bdb53cb068e86f3d25b8cd2`
- `evidence_b.json`: `acefdceade22183c67ad13a12740deb49103d9adbdfb36e70cfe71237feedc42`
- `challenge.json`: `680df56b2e3d38df26a0b9d49f80ad3870a5e72e1d206a32aa38935871aa67a6`

## Historical runtime-compatible deployment — do not submit

- Contract: `0x1c9F3F3e5eB28681A56F416980425ef06482a295`
- Transaction: `0x7fd6628b474176a10b5b88875c2275a41f7e300d4527784660bbc8d640234909`
- Reason superseded: the final source was updated to the documented
  `gl.nondet.web.get()` / `gl.nondet.exec_prompt()` API and the live evidence
  transport was changed from dynamic API envelopes to immutable raw files.

## Historical pre-final deployment — do not submit

- Contract: `0x1799625F92fCB2A933C33B96C1C1a25328fFC14F`
- Transaction: `0xc7f89e2699ab86a32d724218f2bb884985d56b8e412973d16ea521d70ba0094e`
- Receipt: `ACCEPTED / AGREE / FINISHED_WITH_RETURN`
- Initial validators: 3; last round validators: 5
- Schema retrieval: passed
- Deployed source: normalized content matches the audited source; the CLI
  response adds two trailing blank lines during source serialization.

## Historical live smoke test — do not submit as final evidence

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
