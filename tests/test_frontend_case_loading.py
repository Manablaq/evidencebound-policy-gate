"""Source-level checks for the frontend's case and policy read flow."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "components" / "evidencebound-app.tsx").read_text()
READ_STATE = SOURCE.split("const readState = useCallback", 1)[1].split("  useEffect(() => {\n    if (view === \"workspace\")", 1)[0]


class FrontendCaseLoadingTests(unittest.TestCase):
    def test_policy_read_uses_the_loaded_cases_policy_id(self):
        case_read = 'functionName: "get_case", args: [BigInt(requestedId)]'
        policy_read = 'functionName: "get_policy", args: [BigInt(String(loadedCase.policy_id))]'

        self.assertIn("const nextCase = await client.readContract", READ_STATE)
        self.assertIn("const loadedCase = safeChainCase(nextCase);", READ_STATE)
        self.assertIn(policy_read, READ_STATE)
        self.assertLess(READ_STATE.index(case_read), READ_STATE.index("const loadedCase"))
        self.assertLess(READ_STATE.index("const loadedCase"), READ_STATE.index(policy_read))
        self.assertNotIn('functionName: "get_policy", args: [DEMO.policyId]', READ_STATE)

    def test_non_default_case_policy_is_rendered_from_the_policy_read(self):
        policy_panel = SOURCE.split('<div className="panel policy-panel">', 1)[1].split("</div><div className=\"panel lifecycle-panel\">", 1)[0]

        self.assertRegex(policy_panel, r"policy\?\.name \?\? liveCase\.policy_name")
        self.assertRegex(policy_panel, r"policy\?\.policy_text \?\? liveCase\.policy_text")
        self.assertRegex(policy_panel, r"policy\?\.version \?\? liveCase\.policy_version")
        self.assertRegex(policy_panel, r"policy\?\.policy_digest \?\? liveCase\.policy_digest")

    def test_failed_reads_mark_demo_data_as_unverified(self):
        self.assertIn("setReadOnly(true);", READ_STATE)
        self.assertIn("setPolicy(null);", READ_STATE)
        self.assertIn("Showing demo data only; it is not contract-verified.", READ_STATE)
        self.assertIn('"DEMO SNAPSHOT · NOT CONTRACT VERIFIED"', SOURCE)
        self.assertIn('statusLabel = !contractState ? "Demo data" : consensusBound ? "Consensus bound" : "Onchain snapshot"', SOURCE)
        self.assertNotIn("Showing the verified demo snapshot instead.", SOURCE)

    def test_freshness_comes_from_the_contract_predicate(self):
        self.assertIn('functionName: "is_fresh", args: [BigInt(requestedId)]', READ_STATE)
        self.assertIn('const consumerReady = !readOnly && final && contractFresh === true;', SOURCE)
        self.assertIn('detail={readOnly ? "Locked: contract read unavailable" : consumerReady ? "Available to callers" : final ? "Locked: case is stale" : "Locked until finality"}', SOURCE)

    def test_case_input_does_not_trigger_a_read_until_load(self):
        self.assertIn('const [caseIdInput, setCaseIdInput] = useState("1");', SOURCE)
        self.assertIn('const [activeCaseId, setActiveCaseId] = useState("1");', SOURCE)
        self.assertIn('onChange={(event) => setCaseIdInput(event.target.value)}', SOURCE)
        self.assertIn('void readState(requestedId);', SOURCE)
        self.assertNotIn('const readState = useCallback(async (id = caseId)', SOURCE)

    def test_transaction_failures_are_not_reported_as_accepted(self):
        self.assertIn('executionResult === "FINISHED_WITH_ERROR"', SOURCE)
        self.assertIn('receipt?.statusName ?? receipt?.status_name', SOURCE)
        self.assertIn('setNotice({ kind: "error", text: `${label} was not applied:', SOURCE)
        self.assertIn('Monitoring timed out', SOURCE)
        self.assertIn('PENDING_TRANSACTION_STORAGE_KEY', SOURCE)


if __name__ == "__main__":
    unittest.main()
