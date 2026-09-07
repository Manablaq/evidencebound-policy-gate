# Evidence record specification

EvidenceBound fetches a JSON record from a URL pinned in the case. The complete
UTF-8 response body must match the case's SHA-256 hash. The parsed object must
also match the issuer, source group, record ID, version, publication time,
expiry, and registered key ID pinned in the case.

```json
{
  "record_id": "invoice-2026-001-a",
  "issuer_id": "publisher-a",
  "issuer_key_id": "publisher-a-key-2026",
  "source_group": "accounting-system",
  "version": 1,
  "published_at": 1788685000,
  "valid_until": 1788771400,
  "signature": "detached-signature-artifact",
  "signed_payload_hash": "sha256-of-canonical-record-with-detached-fields-removed",
  "observation": "Invoice inv-2026-001 is paid in full."
}
```

The registered issuer publisher URI is an enforceable provenance boundary. It
must use HTTPS, an ASCII hostname without credentials, ports, percent-encoding,
queries, fragments, malformed labels, or traversal segments. The evidence URL
must use the exact registered origin and either the exact registered path or a
safe descendant path. The contract applies this check when opening or repairing
a case, when submitting a challenge, and inside every validator re-evaluation
before the web fetch.

The demo records use detached signature artifacts for fixture simplicity. The
contract requires the artifact and binds the canonical payload hash and key ID,
but the reviewer-requested enforceable control in this deployment is the
registered issuer URL authority/path rule rather than asymmetric signature
verification inside GenVM.
