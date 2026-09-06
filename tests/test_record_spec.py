"""Pure-Python checks for the detached evidence-record format."""

import hashlib
import json
import unittest


def signed_payload_hash(record):
    payload = dict(record)
    payload.pop("signature", None)
    payload.pop("signed_payload_hash", None)
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


class EvidenceRecordSpecTests(unittest.TestCase):
    def test_detached_payload_hash_is_not_circular(self):
        record = {
            "record_id": "invoice-2026-001",
            "issuer_id": "publisher-a",
            "issuer_key_id": "key-a-2026",
            "source_group": "group-a",
            "version": 1,
            "published_at": 1780000000,
            "valid_until": 1780600000,
            "signature": "detached-artifact",
            "observation": "paid",
        }
        record["signed_payload_hash"] = signed_payload_hash(record)
        body = json.dumps(record, sort_keys=True, separators=(",", ":"))
        body_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()

        self.assertEqual(record["signed_payload_hash"], signed_payload_hash(record))
        self.assertEqual(len(body_hash), 64)
        self.assertNotEqual(body_hash, record["signed_payload_hash"])

    def test_payload_hash_is_stable_across_json_key_order(self):
        first = {"observation": "paid", "record_id": "r-1", "version": 1}
        second = {"version": 1, "record_id": "r-1", "observation": "paid"}
        self.assertEqual(signed_payload_hash(first), signed_payload_hash(second))


if __name__ == "__main__":
    unittest.main()
