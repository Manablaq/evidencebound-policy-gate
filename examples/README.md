# Bradbury demo fixtures

These three JSON records are fixed demo inputs for policy ID `1` on the
Bradbury deployment. Their complete-body hashes were computed from the files as
committed:

| File | Body SHA-256 | Source group |
|---|---|---|
| `evidence_a.json` | `a95497ac94db8baaf13a705909c1f65f1582a673afba48432dd2f82efaa3febc` | `accounting-system` |
| `evidence_b.json` | `80f7f1f1376310119aae8080663b24c14dd7665d420eaf89f9716cdbfe6a0beb` | `delivery-system` |
| `challenge.json` | `ccdf83a459136d6cc25e23c676ab2931cbb582c1f11a43b3204aadf2e5d7083d` | `customer-dispute` |

The `signature` values are demo artifacts for the fixture. Before a production
deployment, replace them with real detached signatures produced and verified by
the registered issuer service. The contract binds the issuer key ID and signed
payload hash, and additionally enforces that each fetched URL matches the
registered issuer's safe HTTPS origin and exact path. This demo uses the URL
authority/path remedy requested by the reviewer; it does not claim asymmetric
cryptography inside GenVM.

The timestamps are a one-day demo window generated on 2026-09-06. Regenerate
fresh timestamps and hashes if these fixtures are published after the window.
