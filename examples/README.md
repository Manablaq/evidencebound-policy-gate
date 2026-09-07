# Bradbury demo fixtures

These three JSON records are fixed demo inputs for policy ID `1` on the
Bradbury deployment. Their complete-body hashes were computed from the files as
committed:

| File | Body SHA-256 | Source group |
|---|---|---|
| `evidence_a.json` | `127c5e938e2beb01d608e4c3969aae694112d21f1bdb53cb068e86f3d25b8cd2` | `accounting-system` |
| `evidence_b.json` | `acefdceade22183c67ad13a12740deb49103d9adbdfb36e70cfe71237feedc42` | `delivery-system` |
| `challenge.json` | `680df56b2e3d38df26a0b9d49f80ad3870a5e72e1d206a32aa38935871aa67a6` | `customer-dispute` |

The `signature` values are demo artifacts for the fixture. Before a production
deployment, replace them with real detached signatures produced and verified by
the registered issuer service. The contract binds the issuer key ID and signed
payload hash, and additionally enforces that each fetched URL matches the
registered issuer's safe HTTPS origin and exact path. This demo uses the URL
authority/path remedy requested by the reviewer; it does not claim asymmetric
cryptography inside GenVM.

The timestamps are a seven-day demo window generated on 2026-09-07. Regenerate
fresh timestamps and hashes if these fixtures are published after the window.
