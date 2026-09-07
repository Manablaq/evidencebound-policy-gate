"""Pure tests for the on-chain issuer authority URL rules."""

import ast
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "contracts" / "evidencebound_policy_gate.py").read_text()
TREE = ast.parse(SOURCE)
HELPERS = {
    node.name: node
    for node in TREE.body
    if isinstance(node, ast.FunctionDef)
    and node.name in {"_safe_https_parts", "_uri_matches_publisher"}
}
MODULE = ast.Module(body=[HELPERS["_safe_https_parts"], HELPERS["_uri_matches_publisher"]], type_ignores=[])
ast.fix_missing_locations(MODULE)
NAMESPACE = {}
exec(compile(MODULE, "<publisher-binding>", "exec"), NAMESPACE)
uri_matches_publisher = NAMESPACE["_uri_matches_publisher"]


class PublisherBindingTests(unittest.TestCase):
    PUBLISHER = "https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples"

    def test_exact_and_descendant_paths_are_allowed(self):
        self.assertTrue(uri_matches_publisher(self.PUBLISHER, self.PUBLISHER))
        self.assertTrue(uri_matches_publisher(self.PUBLISHER + "/evidence_a.json", self.PUBLISHER))

    def test_origin_and_path_boundary_are_enforced(self):
        self.assertFalse(uri_matches_publisher("https://evil.example/evidence_a.json", self.PUBLISHER))
        self.assertFalse(uri_matches_publisher("https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/examples-archive/evidence_a.json", self.PUBLISHER))
        self.assertFalse(uri_matches_publisher("https://raw.githubusercontent.com/Manablaq/evidencebound-policy-gate/main/other/evidence_a.json", self.PUBLISHER))

    def test_ambiguous_url_forms_are_rejected(self):
        for uri in (
            self.PUBLISHER + "/../evidence_a.json",
            self.PUBLISHER + "/evidence_a.json?issuer=publisher-a",
            self.PUBLISHER + "/evidence_a.json#latest",
            "https://publisher:secret@raw.githubusercontent.com/record",
            "https://raw.githubusercontent.com/%4d/an-evidence-record",
        ):
            self.assertFalse(uri_matches_publisher(uri, self.PUBLISHER), uri)


if __name__ == "__main__":
    unittest.main()
