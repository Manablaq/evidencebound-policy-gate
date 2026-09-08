"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  ExternalLink,
  FileCheck2,
  Github,
  Layers3,
  LockKeyhole,
  Menu,
  Moon,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Sun,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  asNumber,
  CASE_FIELDS,
  CONTRACT_ADDRESS,
  decisionName,
  decisionTone,
  DEMO,
  EXPLORER_URL,
  getReadClient,
  getWriteClient,
  REPOSITORY_URL,
  RPC_URL,
  shortHash,
  statusName,
  statusTone,
  type ChainCase,
  type CaseDraft,
  type EvidenceDraft,
  BRADBURY_CHAIN_ID_HEX,
  demoCaseDraft,
} from "@/lib/contract";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

type Notice = { kind: "info" | "success" | "error"; text: string };
type Theme = "light" | "dark";
type PendingAction = { functionName: string; label: string; caseId: string; hash: string };

const EMPTY_EVIDENCE: EvidenceDraft = { uri: "", hash: "", issuer: "", recordId: "", version: "1", publishedAt: "", validUntil: "" };

function emptyCaseDraft(): CaseDraft {
  return { policyId: "1", subject: "", submittedContent: "", context: "", evidenceA: { ...EMPTY_EVIDENCE }, evidenceB: { ...EMPTY_EVIDENCE }, ttlSeconds: "604800" };
}

function asDraftNumber(value: string, label: string) {
  if (!/^\d+$/.test(value.trim())) throw new Error(`${label} must be a whole number.`);
  return BigInt(value.trim());
}

const FALLBACK_CASE: ChainCase = {
  case_id: 1n, requester: "0x1f87Ae197af539253978d435aD45cCf28Fb95024", policy_id: 1n,
  policy_version: 1n, policy_name: DEMO.policyName, policy_text: "Evidence must satisfy the registered policy.", policy_digest: DEMO.policyDigest,
  subject: DEMO.subject, submitted_content: DEMO.submittedContent, context: DEMO.context,
  evidence_a_uri: DEMO.evidenceAUri, evidence_a_hash: DEMO.evidenceAHash, evidence_a_issuer: DEMO.evidenceAIssuer, evidence_a_group: "accounting-system", evidence_a_record_id: DEMO.evidenceARecordId, evidence_a_version: 1n, evidence_a_published_at: DEMO.timestamp, evidence_a_valid_until: DEMO.validUntil,
  evidence_b_uri: DEMO.evidenceBUri, evidence_b_hash: DEMO.evidenceBHash, evidence_b_issuer: DEMO.evidenceBIssuer, evidence_b_group: "delivery-system", evidence_b_record_id: DEMO.evidenceBRecordId, evidence_b_version: 1n, evidence_b_published_at: DEMO.timestamp, evidence_b_valid_until: DEMO.validUntil,
  challenge_uri: "", challenge_hash: "", challenge_issuer: "", challenge_group: "", challenge_record_id: "", challenge_version: 0n, challenge_published_at: 0n, challenge_valid_until: 0n, challenge_note: "", challenger: "0x0000000000000000000000000000000000000000",
  created_at: DEMO.timestamp, expires_at: DEMO.validUntil, challenge_deadline: DEMO.validUntil, last_resolved_at: DEMO.timestamp, evidence_revision: 2n, resolution_count: 2n,
  status: 2n, decision: 3n, confidence: 9500n, reason_code: "policy_violated", summary: "The registered policy is violated by independently verified evidence.", resolved_evidence_a_hash: DEMO.evidenceAHash, resolved_evidence_b_hash: DEMO.evidenceBHash, resolved_challenge_hash: DEMO.challengeHash, consensus_bound: true,
};

const navItems = ["Overview", "How it works", "Trust model", "Workspace"];

function formatDate(value: unknown) {
  const timestamp = asNumber(value);
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(value: unknown) {
  const timestamp = asNumber(value);
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function toError(error: unknown) {
  if (error && typeof error === "object" && "shortMessage" in error) return String(error.shortMessage);
  if (error instanceof Error) return error.message;
  return "The Bradbury RPC did not return a usable response.";
}

function safeChainCase(value: unknown): ChainCase {
  if (!value || typeof value !== "object") return FALLBACK_CASE;
  const raw = value as Record<string, unknown>;
  return Object.fromEntries(CASE_FIELDS.map((field) => [field, raw[field] ?? FALLBACK_CASE[field]])) as ChainCase;
}

function Logo() {
  return <span className="logo-mark" aria-hidden="true"><span>e</span><i /></span>;
}

function StatusPill({ label, tone = "neutral", pulse = false }: { label: string; tone?: string; pulse?: boolean }) {
  return <span className={`status-pill status-${tone}`}>{pulse && <span className="status-pulse" />}{label}</span>;
}

export default function EvidenceBoundApp() {
  const [view, setView] = useState<"landing" | "workspace">("landing");
  const [theme, setTheme] = useState<Theme>("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [caseId, setCaseId] = useState("1");
  const [liveCase, setLiveCase] = useState<ChainCase>(FALLBACK_CASE);
  const [policy, setPolicy] = useState<Record<string, unknown> | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [wallet, setWallet] = useState("");
  const [walletOnBradbury, setWalletOnBradbury] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [notice, setNotice] = useState<Notice>({ kind: "info", text: "Public reads are available. Connect a Bradbury wallet only when you want to submit an action." });
  const [tx, setTx] = useState<{ hash: string; label: string; status: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [caseDraft, setCaseDraft] = useState<CaseDraft>(() => emptyCaseDraft());
  const [repairDraft, setRepairDraft] = useState<CaseDraft>(() => emptyCaseDraft());
  const [challengeDraft, setChallengeDraft] = useState<EvidenceDraft>(() => ({ ...EMPTY_EVIDENCE }));
  const [challengeNote, setChallengeNote] = useState("");
  const [nowSeconds, setNowSeconds] = useState(0);
  const readRequest = useRef(0);

  const status = statusName(liveCase.status);
  const decision = decisionName(liveCase.decision);
  const resolved = status === "RESOLVED" || status === "FINALIZED";
  const final = status === "FINALIZED";
  const caseExpired = nowSeconds > 0 && asNumber(liveCase.expires_at) > 0 && nowSeconds >= asNumber(liveCase.expires_at);
  const challengeWindowOpen = nowSeconds === 0 || (asNumber(liveCase.challenge_deadline) > 0 && nowSeconds < asNumber(liveCase.challenge_deadline));
  const actionPending = (functionName: string) => pendingAction?.functionName === functionName && pendingAction.caseId === caseId;

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("evidencebound-theme") as Theme | null;
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    const handleAccounts = (...args: unknown[]) => setWallet(typeof args[0] === "object" && Array.isArray(args[0]) ? String(args[0][0] ?? "") : "");
    window.ethereum?.on?.("accountsChanged", handleAccounts);
    const handleChain = (...args: unknown[]) => setWalletOnBradbury(String(args[0] ?? "").toLowerCase() === BRADBURY_CHAIN_ID_HEX);
    window.ethereum?.on?.("chainChanged", handleChain);
    void window.ethereum?.request({ method: "eth_accounts" }).then((accounts) => {
      if (Array.isArray(accounts)) setWallet(String(accounts[0] ?? ""));
    }).catch(() => undefined);
    void window.ethereum?.request({ method: "eth_chainId" }).then((chainId) => {
      setWalletOnBradbury(String(chainId ?? "").toLowerCase() === BRADBURY_CHAIN_ID_HEX);
    }).catch(() => undefined);
    const clock = window.setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 15000);
    setNowSeconds(Math.floor(Date.now() / 1000));
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWalletMenuOpen(false);
        setMobileOpen(false);
        setShowCreateForm(false);
        setShowRepairForm(false);
        setShowChallengeForm(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const closeWalletMenu = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".wallet-wrap")) setWalletMenuOpen(false);
    };
    document.addEventListener("click", closeWalletMenu);
    return () => {
      observer.disconnect();
      window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
      window.ethereum?.removeListener?.("chainChanged", handleChain);
      document.removeEventListener("click", closeWalletMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("evidencebound-theme", theme);
  }, [theme]);

  const readState = useCallback(async (id = caseId) => {
    const requestId = ++readRequest.current;
    setIsReading(true);
    try {
      const client = await getReadClient();
      const [nextCase, nextPolicy] = await Promise.all([
        client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_case", args: [BigInt(id)] }),
        client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_policy", args: [DEMO.policyId] }),
      ]);
      if (requestId !== readRequest.current) return;
      setLiveCase(safeChainCase(nextCase));
      setPolicy(nextPolicy as Record<string, unknown>);
      setReadOnly(false);
      setNotice({ kind: "success", text: `Bradbury state synced for case ${id}. The workspace updated without a page reload.` });
    } catch (error) {
      if (requestId !== readRequest.current) return;
      setReadOnly(true);
      setNotice({ kind: "error", text: `Live read unavailable: ${toError(error)} Showing the verified demo snapshot instead.` });
      setLiveCase(FALLBACK_CASE);
    } finally {
      if (requestId === readRequest.current) setIsReading(false);
    }
  }, [caseId]);

  useEffect(() => { if (view === "workspace") void readState(); }, [view, readState]);

  function openWorkspace() {
    setView("workspace");
    window.setTimeout(() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function openLanding() {
    setView("landing");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setNotice({ kind: "error", text: "No browser wallet detected. Install a compatible wallet, switch to GenLayer Bradbury, then try again." });
      return;
    }
    try {
      const chainId = String(await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
      if (chainId !== BRADBURY_CHAIN_ID_HEX) {
        try {
          await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BRADBURY_CHAIN_ID_HEX }] });
        } catch (switchError) {
          const code = switchError && typeof switchError === "object" && "code" in switchError ? String(switchError.code) : "";
          if (code !== "4902") throw new Error("Switch your wallet to GenLayer Bradbury before connecting.");
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: BRADBURY_CHAIN_ID_HEX, chainName: "GenLayer Bradbury", nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }, rpcUrls: [RPC_URL], blockExplorerUrls: [EXPLORER_URL] }] });
        }
      }
      const verifiedChainId = String(await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
      if (verifiedChainId !== BRADBURY_CHAIN_ID_HEX) throw new Error("Switch your wallet to GenLayer Bradbury before connecting.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      const account = accounts[0] ?? "";
      if (!account) throw new Error("Your wallet did not provide an account.");
      setWallet(account);
      setWalletOnBradbury(true);
      setWalletMenuOpen(false);
      setNotice({ kind: "success", text: "Wallet connected. No message was signed; signatures are requested only when you submit a Bradbury action." });
    } catch (error) {
      setNotice({ kind: "error", text: toError(error) });
    }
  }

  async function copyAddress() {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedAddress(true);
      setNotice({ kind: "success", text: "Wallet address copied to your clipboard." });
      window.setTimeout(() => setCopiedAddress(false), 1800);
    } catch {
      setNotice({ kind: "error", text: "Your browser blocked clipboard access. Copy the address from the wallet menu." });
    }
  }

  function disconnectWallet() {
    setWallet("");
    setWalletMenuOpen(false);
    setCopiedAddress(false);
    setNotice({ kind: "info", text: "Wallet disconnected from EvidenceBound. To revoke browser-wallet permissions completely, use your wallet extension’s connected-sites settings." });
  }

  async function executeWrite(functionName: string, args: unknown[], label: string) {
    const targetCaseId = functionName === "open_case" ? "new" : caseId;
    if (pendingAction && pendingAction.functionName === functionName && pendingAction.caseId === targetCaseId) {
      throw new Error(`${label} is already processing. Wait for its consensus status to update before repeating it.`);
    }
    if (!wallet) await connectWallet();
    await ensureBradburyWallet();
    const account = wallet || ((await window.ethereum?.request({ method: "eth_accounts" }) as string[] | undefined)?.[0] ?? "");
    if (!account) throw new Error("Connect a browser wallet before submitting a Bradbury action.");
    const client = await getWriteClient(account);
    setIsBusy(true);
    setNotice({ kind: "info", text: `${label} submitted to your wallet. Confirm the signature to continue.` });
    const hash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName, args, value: 0n });
    setTx({ hash: String(hash), label, status: "Submitted" });
    setPendingAction({ hash: String(hash), functionName, label, caseId: targetCaseId });
    setNotice({ kind: "success", text: `${label} accepted by the wallet. Monitoring consensus in the background; you can keep working.` });
    setIsBusy(false);
    void monitorTransaction(String(hash), label, targetCaseId, functionName);
  }

  async function ensureBradburyWallet() {
    if (!window.ethereum) throw new Error("No browser wallet detected. Install a wallet connected to GenLayer Bradbury.");
    const chainId = String(await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
    if (chainId !== BRADBURY_CHAIN_ID_HEX) {
      setWalletOnBradbury(false);
      throw new Error("Your wallet is on the wrong network. Switch to GenLayer Bradbury before submitting.");
    }
    setWalletOnBradbury(true);
  }

  async function findLatestCaseId(startId: string) {
    const client = await getReadClient();
    let latest = asDraftNumber(startId, "Case ID");
    for (let offset = 1; offset <= 20; offset += 1) {
      const candidate = latest + 1n;
      try {
        await client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_case", args: [candidate] });
        latest = candidate;
      } catch {
        break;
      }
    }
    return String(latest);
  }

  async function monitorTransaction(hash: string, label: string, targetCaseId: string, functionName: string) {
    try {
      const receipt = await (await getReadClient()).waitForTransactionReceipt({ hash, status: "ACCEPTED", retries: 120, interval: 5000 });
      setTx({ hash, label, status: String(receipt?.txExecutionResultName ?? "Accepted") });
      setPendingAction((current) => current?.hash === hash ? null : current);
      if (functionName === "open_case") {
        try {
          const latestCaseId = await findLatestCaseId(caseId);
          setCaseId(latestCaseId);
          setNotice({ kind: "success", text: `New review accepted by Bradbury. Showing case ${latestCaseId} now.` });
          window.setTimeout(() => void readState(latestCaseId), 800);
        } catch {
          setNotice({ kind: "success", text: "New review accepted by Bradbury. Use the case selector to load the new case if it is not visible yet." });
        }
      } else {
        window.setTimeout(() => void readState(targetCaseId), 800);
      }
    } catch {
      setTx((current) => current?.hash === hash ? { ...current, status: "Accepted; finalizing" } : current);
      setNotice({ kind: "info", text: `${label} is still processing in Bradbury. You can continue with other work; repeating this same action is temporarily disabled.` });
    }
  }

  function evidenceArgs(evidence: EvidenceDraft) {
    return [evidence.uri.trim(), evidence.hash.trim(), evidence.issuer.trim(), evidence.recordId.trim(), asDraftNumber(evidence.version, "Evidence version"), asDraftNumber(evidence.publishedAt, "Published time"), asDraftNumber(evidence.validUntil, "Valid-until time")];
  }

  function caseArgs(draft: CaseDraft) {
    if (!draft.subject.trim() || !draft.submittedContent.trim()) throw new Error("Subject and submitted content are required.");
    return [asDraftNumber(draft.policyId, "Policy ID"), draft.subject.trim(), draft.submittedContent.trim(), draft.context.trim(), ...evidenceArgs(draft.evidenceA), ...evidenceArgs(draft.evidenceB), asDraftNumber(draft.ttlSeconds, "TTL")];
  }

  async function createCase() {
    try {
      await executeWrite("open_case", caseArgs(caseDraft), "New evidence review");
      setShowCreateForm(false);
    } catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function resolveCase() {
    try { await executeWrite("resolve_case", [BigInt(caseId)], "Case resolution"); }
    catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function challengeCase() {
    try {
      if (!challengeNote.trim()) throw new Error("A challenge note is required.");
      await executeWrite("submit_challenge", [asDraftNumber(caseId, "Case ID"), ...evidenceArgs(challengeDraft), challengeNote.trim()], "Independent challenge");
      setShowChallengeForm(false);
    } catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function finalizeCase() {
    try { await executeWrite("finalize_case", [asDraftNumber(caseId, "Case ID")], "Case finalization"); }
    catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function recoverCase() {
    try { await executeWrite("recover_case", [asDraftNumber(caseId, "Case ID")], "Case recovery"); }
    catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function repairCase() {
    try {
      await executeWrite("repair_case_evidence", [asDraftNumber(caseId, "Case ID"), ...evidenceArgs(repairDraft.evidenceA), ...evidenceArgs(repairDraft.evidenceB)], "Evidence repair");
      setShowRepairForm(false);
    } catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  function updateCaseDraft(target: "create" | "repair", field: keyof CaseDraft, value: string) {
    const setter = target === "create" ? setCaseDraft : setRepairDraft;
    setter((current) => ({ ...current, [field]: value }));
  }

  function updateEvidenceDraft(target: "create" | "repair", side: "evidenceA" | "evidenceB", field: keyof EvidenceDraft, value: string) {
    const setter = target === "create" ? setCaseDraft : setRepairDraft;
    setter((current) => ({ ...current, [side]: { ...current[side], [field]: value } }));
  }

  function demoChallengeEvidence(): EvidenceDraft {
    return { uri: DEMO.challengeUri, hash: DEMO.challengeHash, issuer: DEMO.challengeIssuer, recordId: DEMO.challengeRecordId, version: "1", publishedAt: String(DEMO.timestamp), validUntil: String(DEMO.validUntil) };
  }

  function loadCase() {
    try { asDraftNumber(caseId, "Case ID"); void readState(); }
    catch (error) { setNotice({ kind: "error", text: toError(error) }); }
  }

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#top" onClick={openLanding}><Logo /><span>Evidence<span className="brand-muted">Bound</span></span></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => <a key={item} href={item === "Workspace" ? "#workspace" : item === "Overview" ? "#top" : `#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => item === "Workspace" ? openWorkspace() : item === "Overview" ? openLanding() : undefined}>{item}</a>)}
        </nav>
        <div className="top-actions"><StatusPill label="Bradbury live" tone="live" pulse />{wallet && <StatusPill label={walletOnBradbury ? "Wallet on Bradbury" : "Wrong network"} tone={walletOnBradbury ? "positive" : "negative"} />}<button className="theme-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button><div className="wallet-wrap"><button className={`wallet-button ${wallet ? "wallet-connected" : ""}`} aria-expanded={wallet ? walletMenuOpen : undefined} onClick={() => wallet ? setWalletMenuOpen(!walletMenuOpen) : void connectWallet()}><Wallet size={16} />{wallet ? shortHash(wallet, 6, 4) : "Connect wallet"}{wallet && <ChevronRight size={14} className={walletMenuOpen ? "chevron-open" : ""} />}</button>{wallet && walletMenuOpen && <div className="wallet-popover" role="dialog" aria-modal="true" aria-label="Wallet account menu"><div className="wallet-popover-top"><span className="network-pulse" /><span>{walletOnBradbury ? "Connected to Bradbury" : "Wrong network"}</span></div><div className="wallet-address"><small>ACCOUNT</small><code>{wallet}</code></div><button className="wallet-menu-action" onClick={() => void copyAddress()}>{copiedAddress ? <Check size={14} /> : <Code2 size={14} />}{copiedAddress ? "Copied address" : "Copy address"}</button><button className="wallet-menu-action wallet-disconnect" onClick={disconnectWallet}><X size={14} />Disconnect</button><p>Disconnecting here clears this app session. Revoke full wallet permissions from your wallet extension.</p></div>}</div><button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>
      {mobileOpen && <div className="mobile-nav">{navItems.map((item) => <a key={item} href={item === "Workspace" ? "#workspace" : item === "Overview" ? "#top" : `#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => { setMobileOpen(false); if (item === "Workspace") openWorkspace(); if (item === "Overview") openLanding(); }}>{item}</a>)}</div>}

      {view === "landing" ? <>
        <section className="hero section-pad" id="top">
          <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-line" /> GENLAYER / EVIDENCE INFRASTRUCTURE</div><h1>Make policy decisions<br /><em>with a visible trust boundary.</em></h1><p className="hero-lead">EvidenceBound turns independently sourced records into a challengeable, policy-bound decision that downstream apps can actually trust.</p><div className="hero-actions"><button className="button button-primary" onClick={openWorkspace}>Open live workspace <ArrowRight size={17} /></button><a className="button button-quiet" href={REPOSITORY_URL} target="_blank" rel="noreferrer">Read the source <ExternalLink size={15} /></a></div><div className="hero-proof"><span><BadgeCheck size={16} /> Source verified</span><span><Zap size={16} /> 5 validators agreeing</span><span><LockKeyhole size={16} /> Bradbury testnet</span></div></div>
          <div className="hero-visual reveal"><div className="orbital orbital-a" /><div className="orbital orbital-b" /><div className="hero-card card-main"><div className="card-topline"><span className="mini-label">LIVE POLICY GATE</span><StatusPill label="Consensus bound" tone="positive" /></div><div className="hero-case-title"><span className="case-icon"><FileCheck2 size={21} /></span><span><b>invoice-2026-001</b><small>Evidence review #1</small></span></div><div className="hero-decision"><span>FINAL DECISION</span><strong>NEEDS REVIEW</strong><small>Challengeable · 9,500 confidence</small></div><div className="hero-card-footer"><span><i className="dot dot-green" /> 2 source groups</span><span><i className="dot dot-coral" /> 2 resolutions</span></div></div><div className="floating-card float-top"><span className="float-icon green"><ShieldCheck size={17} /></span><span><b>Issuer bound</b><small>Safe URL authority checked</small></span></div><div className="floating-card float-bottom"><span className="float-icon purple"><ScanSearch size={17} /></span><span><b>Independent re-check</b><small>Validator callback verified</small></span></div><div className="orbit-label orbit-label-a">A</div><div className="orbit-label orbit-label-b">B</div></div>
        </section>
        <section className="marquee" aria-label="Product properties"><div className="marquee-track"><span>ISSUER PROVENANCE</span><i>✳</i><span>POLICY LIFECYCLE</span><i>✳</i><span>CONSENSUS-BACKED REVIEW</span><i>✳</i><span>CHALLENGEABLE DECISIONS</span><i>✳</i><span>ISSUER PROVENANCE</span><i>✳</i></div></section>
        <section className="intro section-pad reveal" id="how-it-works"><div className="section-kicker">01 / THE PRIMITIVE</div><div className="split-heading"><h2>Trust should be inspectable,<br /><span>not implied.</span></h2><p>Most policy systems stop at a signed-looking payload or a model response. EvidenceBound makes the whole path explicit: who published the evidence, where it lives, how it was hashed, what policy was active, and whether validators agreed.</p></div><div className="feature-grid"><article><span className="feature-number">01</span><Layers3 size={24} /><h3>Snapshot the truth</h3><p>Pin two immutable records, metadata, full-body hashes, and the exact policy version before a review starts.</p></article><article><span className="feature-number">02</span><Activity size={24} /><h3>Adjudicate with context</h3><p>GenLayer’s nondeterministic leader evaluates fresh web evidence while keeping the decision canonical.</p></article><article><span className="feature-number">03</span><ShieldCheck size={24} /><h3>Bind the outcome</h3><p>Independent validators re-check issuer authority, source groups, hashes, and every consequential decision field.</p></article></div></section>
        <section className="trust-section section-pad" id="trust-model"><div className="trust-panel reveal"><div><div className="section-kicker light">02 / TRUST MODEL</div><h2>Permission comes<br /><span>after proof.</span></h2><p>Consumer predicates remain unavailable until a resolved decision survives the challenge window, matches the exact policy fingerprint, and is still fresh.</p><a className="text-link" href={EXPLORER_URL} target="_blank" rel="noreferrer">Inspect the Bradbury contract <ArrowUpRightIcon /></a></div><div className="trust-list"><div><b>01</b><span><strong>Issuer registry</strong><small>Publisher authority and source group are explicit trust roots.</small></span><Check size={16} /></div><div><b>02</b><span><strong>Evidence binding</strong><small>Safe origin/path rules prevent an impersonating host.</small></span><Check size={16} /></div><div><b>03</b><span><strong>Validator agreement</strong><small>Every result-bearing field must match independently.</small></span><Check size={16} /></div><div><b>04</b><span><strong>Finality gate</strong><small>Challengeable state is never presented as consumer-ready.</small></span><Check size={16} /></div></div></div></section>
        <section className="cta-section section-pad reveal"><div className="cta-card"><div><span className="section-kicker">03 / READY WHEN YOU ARE</span><h2>See the trust boundary<br />in a live review.</h2></div><button className="button button-light" onClick={openWorkspace}>Enter workspace <ArrowDownRight size={17} /></button></div></section>
      </> : <section className="workspace-section section-pad" id="workspace">
        <div className="workspace-head reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> LIVE WORKSPACE / CASE REVIEW</div><h1>Evidence control room.</h1><p>Inspect the current policy, trace the evidence snapshot, and keep every Bradbury action visible.</p></div><div className="workspace-head-actions"><div className="case-selector"><label htmlFor="case-id">CASE ID</label><div><input id="case-id" inputMode="numeric" value={caseId} onChange={(event) => setCaseId(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadCase()} /><button className="button button-outline" onClick={loadCase} disabled={isReading}>Load</button></div></div><button className="button button-quiet" onClick={() => void readState()} disabled={isReading}><RefreshCw size={16} className={isReading ? "spin" : ""} /> {isReading ? "Syncing" : "Sync state"}</button><button className="button button-primary" onClick={() => { setCaseDraft(demoCaseDraft()); setShowCreateForm(!showCreateForm); setShowRepairForm(false); setShowChallengeForm(false); }} disabled={isBusy || readOnly || pendingAction?.functionName === "open_case"}><Sparkles size={16} /> {showCreateForm ? "Close form" : "New review"}</button></div></div>
        <div className="notice-bar reveal" role={notice.kind === "error" ? "alert" : "status"} aria-live="polite"><div className={`notice-icon ${notice.kind}`}><CircleAlert size={17} /></div><span>{notice.text}</span>{readOnly && <StatusPill label="Read-only fallback" tone="warning" />}</div>
        {showCreateForm && <CaseForm mode="create" draft={caseDraft} disabled={isBusy || !walletOnBradbury} onCaseChange={(field, value) => updateCaseDraft("create", field, value)} onEvidenceChange={(side, field, value) => updateEvidenceDraft("create", side, field, value)} onSubmit={() => void createCase()} onCancel={() => setShowCreateForm(false)} />}
        {showRepairForm && <CaseForm mode="repair" draft={repairDraft} disabled={isBusy || !walletOnBradbury} onCaseChange={(field, value) => updateCaseDraft("repair", field, value)} onEvidenceChange={(side, field, value) => updateEvidenceDraft("repair", side, field, value)} onSubmit={() => void repairCase()} onCancel={() => setShowRepairForm(false)} />}
        {showChallengeForm && <ChallengeForm evidence={challengeDraft} note={challengeNote} disabled={isBusy || !walletOnBradbury} onEvidenceChange={(field, value) => setChallengeDraft((current) => ({ ...current, [field]: value }))} onNoteChange={setChallengeNote} onSubmit={() => void challengeCase()} onCancel={() => setShowChallengeForm(false)} />}
        <div className="workspace-grid reveal">
          <section className="workspace-main"><div className="panel case-panel"><div className="panel-heading"><div><span className="mini-label">ACTIVE CASE</span><h2>{String(liveCase.subject)} <span className="case-id">#{String(liveCase.case_id)}</span></h2></div><StatusPill label={status.replace("_", " ")} tone={statusTone(liveCase.status)} pulse={status === "OPEN" || status === "CHALLENGED"} /></div><div className="case-meta-row"><span><Clock3 size={14} /> Created {formatDate(liveCase.created_at)}</span><span><Layers3 size={14} /> Revision {String(liveCase.evidence_revision)}</span><span><BadgeCheck size={14} /> {String(liveCase.resolution_count)} resolutions</span></div><div className="decision-banner"><div className="decision-label">CONSENSUS DECISION</div><div className="decision-value"><strong className={`decision-${decisionTone(liveCase.decision)}`}>{decision}</strong><span>{asNumber(liveCase.confidence) ? `${asNumber(liveCase.confidence) / 100}% confidence` : "Awaiting adjudication"}</span></div><p>{String(liveCase.summary || "Resolve the evidence snapshot through GenLayer to receive a canonical decision.")}</p><div className="decision-details"><span>Reason <b>{String(liveCase.reason_code || "pending")}</b></span><span>Bound <b>{liveCase.consensus_bound ? "yes" : "no"}</b></span><span>Consumer ready <b>{final ? "yes" : "no"}</b></span></div></div><div className="action-row"><button className="button button-primary" disabled={isBusy || readOnly || !walletOnBradbury || actionPending("resolve_case") || !["OPEN", "CHALLENGED", "ERROR"].includes(status)} onClick={resolveCase}>{actionPending("resolve_case") ? "Consensus pending…" : isBusy ? "Submitting…" : "Resolve through GenLayer"}<ArrowRight size={16} /></button><button className="button button-outline" disabled={isBusy || readOnly || actionPending("submit_challenge") || status !== "RESOLVED"} onClick={() => { setChallengeDraft(demoChallengeEvidence()); setChallengeNote("Customer dispute submitted for independent re-review."); setShowChallengeForm(!showChallengeForm); setShowCreateForm(false); setShowRepairForm(false); }}> {showChallengeForm ? "Close challenge" : "Submit challenge"}</button><button className="button button-outline" disabled={isBusy || readOnly || !walletOnBradbury || actionPending("finalize_case") || status !== "RESOLVED" || challengeWindowOpen} onClick={finalizeCase}>{actionPending("finalize_case") ? "Finalizing…" : "Finalize case"}</button>{status === "ERROR" && <button className="button button-outline" disabled={isBusy || readOnly || actionPending("repair_case_evidence")} onClick={() => { setRepairDraft(demoCaseDraft()); setShowRepairForm(true); setShowCreateForm(false); setShowChallengeForm(false); }}>Repair evidence</button>}{caseExpired && !["FINALIZED", "RECOVERED"].includes(status) && <button className="button button-outline" disabled={isBusy || readOnly || !walletOnBradbury || actionPending("recover_case")} onClick={recoverCase}>{actionPending("recover_case") ? "Recovering…" : "Recover expired"}</button>}<button className="button button-quiet compact" onClick={() => void readState()} aria-label="Refresh case"><RefreshCw size={16} /></button></div></div><div className="panel evidence-panel"><div className="panel-heading"><div><span className="mini-label">EVIDENCE SNAPSHOT</span><h2>Independent records</h2></div><span className="panel-caption">Full-body SHA-256 pinned</span></div><div className="evidence-list"><EvidenceRow label="EVIDENCE A" issuer={String(liveCase.evidence_a_issuer)} group={String(liveCase.evidence_a_group)} record={String(liveCase.evidence_a_record_id)} hash={String(liveCase.evidence_a_hash)} uri={String(liveCase.evidence_a_uri)} /><div className="evidence-connector"><span /> distinct source groups <span /></div><EvidenceRow label="EVIDENCE B" issuer={String(liveCase.evidence_b_issuer)} group={String(liveCase.evidence_b_group)} record={String(liveCase.evidence_b_record_id)} hash={String(liveCase.evidence_b_hash)} uri={String(liveCase.evidence_b_uri)} />{String(liveCase.challenge_uri) && <><div className="evidence-connector challenge-connector"><span /> challenged with independent record <span /></div><EvidenceRow label="CHALLENGE" issuer={String(liveCase.challenge_issuer)} group={String(liveCase.challenge_group)} record={String(liveCase.challenge_record_id)} hash={String(liveCase.challenge_hash)} uri={String(liveCase.challenge_uri)} /></>}</div></div></section>
          <aside className="workspace-side"><div className="panel policy-panel"><div className="panel-heading"><div><span className="mini-label">POLICY</span><h2>{String(policy?.name || liveCase.policy_name)}</h2></div><Code2 size={18} /></div><p>{String(policy?.policy_text || liveCase.policy_text)}</p><div className="policy-fingerprint"><span>VERSION</span><b>v{String(policy?.version || liveCase.policy_version)}</b><span>DIGEST</span><code>{shortHash(policy?.policy_digest || liveCase.policy_digest, 12, 8)}</code></div><a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="text-link">View audited source <ExternalLink size={14} /></a></div><div className="panel lifecycle-panel"><div className="panel-heading"><div><span className="mini-label">LIFECYCLE</span><h2>Review path</h2></div><Activity size={18} /></div><LifecycleItem label="Snapshot pinned" detail="2 issuer-bound records" done /><LifecycleItem label="Leader adjudication" detail={resolved ? "Canonical result returned" : "Awaiting resolution"} done={resolved} active={!resolved} /><LifecycleItem label="Challenge window" detail={final ? "Closed · final" : "Open until deadline"} done={final} active={resolved && !final} /><LifecycleItem label="Consumer predicate" detail={final ? "Available to callers" : "Locked until finality"} done={final} active={false} /></div><div className="panel network-panel"><div className="network-title"><span className="network-pulse" /> Bradbury network</div><div className="network-row"><span>Contract</span><code>{shortHash(CONTRACT_ADDRESS)}</code></div><div className="network-row"><span>Source</span><code>SHA {shortHash(String(liveCase.policy_digest), 8, 5)}</code></div><a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="explorer-link">Open Explorer <ExternalLink size={13} /></a></div></aside>
        </div>
        {tx && <div className="transaction-toast" role="status" aria-live="polite"><div className="tx-icon"><Zap size={16} /></div><div><span>{tx.label} · {tx.status}</span><code>{shortHash(tx.hash, 14, 9)}</code></div><a href={`${EXPLORER_URL}?tx=${tx.hash}`} target="_blank" rel="noreferrer" aria-label="Open transaction in Explorer"><ExternalLink size={15} /></a></div>}
        <div className="workspace-footer"><button className="text-link" onClick={openLanding}><ArrowRight size={14} className="back-arrow" /> Back to overview</button><span>Every state update is reflected in-place after Bradbury acceptance.</span></div>
      </section>}
      <footer className="footer"><div className="brand"><Logo /><span>Evidence<span className="brand-muted">Bound</span></span></div><span>Source-bound policy decisions for the real world.</span><div className="footer-links"><a href={REPOSITORY_URL} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a><a href={EXPLORER_URL} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Explorer</a><a href={`${REPOSITORY_URL}/blob/main/docs/AUDIT_REPORT.md`} target="_blank" rel="noreferrer"><BookOpen size={14} /> Audit report</a></div></footer>
    </main>
  );
}

function EvidenceRow({ label, issuer, group, record, hash, uri }: { label: string; issuer: string; group: string; record: string; hash: string; uri: string }) {
  return <div className="evidence-row"><div className="evidence-label"><span className="evidence-marker" />{label}</div><div className="evidence-content"><div className="evidence-title"><strong>{record}</strong><StatusPill label="Verified" tone="positive" /></div><div className="evidence-data"><span><small>ISSUER</small>{issuer}</span><span><small>SOURCE GROUP</small>{group}</span><span><small>BODY HASH</small><code>{shortHash(hash, 10, 8)}</code></span></div><a href={uri} target="_blank" rel="noreferrer" className="evidence-uri">{shortHash(uri, 42, 18)} <ExternalLink size={12} /></a></div></div>;
}

function LifecycleItem({ label, detail, done, active = false }: { label: string; detail: string; done: boolean; active?: boolean }) {
  return <div className={`lifecycle-item ${done ? "done" : ""} ${active ? "active" : ""}`}><span className="lifecycle-dot">{done ? <Check size={11} /> : active ? <span /> : ""}</span><span><strong>{label}</strong><small>{detail}</small></span></div>;
}

function ArrowUpRightIcon() { return <ArrowRight size={14} className="arrow-up" />; }

function CaseForm({ mode, draft, disabled, onCaseChange, onEvidenceChange, onSubmit, onCancel }: { mode: "create" | "repair"; draft: CaseDraft; disabled: boolean; onCaseChange: (field: keyof CaseDraft, value: string) => void; onEvidenceChange: (side: "evidenceA" | "evidenceB", field: keyof EvidenceDraft, value: string) => void; onSubmit: () => void; onCancel: () => void }) {
  return <section className="panel form-panel" aria-label={mode === "create" ? "Create a new evidence review" : "Repair case evidence"}>
    <div className="panel-heading"><div><span className="mini-label">{mode === "create" ? "NEW REVIEW" : "EVIDENCE REPAIR"}</span><h2>{mode === "create" ? "Create a case from your records" : "Replace failed evidence"}</h2></div><button className="button button-quiet compact" onClick={onCancel} aria-label={mode === "create" ? "Close new review form" : "Close repair form"}><X size={16} /></button></div>
    <p className="form-help">Use immutable HTTPS record URLs from the registered issuer authority. Bradbury validates the URL, hash, issuer, source group, and record metadata during execution.</p>
    {mode === "create" && <div className="form-grid form-grid-three"><Field label="Policy ID" value={draft.policyId} inputMode="numeric" onChange={(value) => onCaseChange("policyId", value)} /><Field label="Subject" value={draft.subject} placeholder="e.g. invoice-2026-002" onChange={(value) => onCaseChange("subject", value)} /><Field label="TTL seconds" value={draft.ttlSeconds} inputMode="numeric" onChange={(value) => onCaseChange("ttlSeconds", value)} /><Field label="Submitted content" value={draft.submittedContent} onChange={(value) => onCaseChange("submittedContent", value)} wide /><Field label="Context" value={draft.context} onChange={(value) => onCaseChange("context", value)} wide /></div>}
    <div className="form-grid form-grid-two"><EvidenceEditor title="Evidence A" evidence={draft.evidenceA} onChange={(field, value) => onEvidenceChange("evidenceA", field, value)} /><EvidenceEditor title="Evidence B" evidence={draft.evidenceB} onChange={(field, value) => onEvidenceChange("evidenceB", field, value)} /></div>
    {!disabled && <p className="form-wallet-note">Wallet connected to Bradbury. Review every value before signing.</p>}
    {disabled && <p className="form-wallet-note">Connect a wallet on GenLayer Bradbury before submitting this form.</p>}
    <div className="form-actions"><button className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" onClick={onSubmit} disabled={disabled}>{mode === "create" ? "Submit new case" : "Submit repaired evidence"}<ArrowRight size={16} /></button></div>
  </section>;
}

function EvidenceEditor({ title, evidence, onChange }: { title: string; evidence: EvidenceDraft; onChange: (field: keyof EvidenceDraft, value: string) => void }) {
  return <fieldset className="evidence-editor"><legend>{title}</legend><Field idPrefix={title} label="Record URL" value={evidence.uri} placeholder="https://issuer.example/records/..." onChange={(value) => onChange("uri", value)} /><Field idPrefix={title} label="Full-body SHA-256" value={evidence.hash} onChange={(value) => onChange("hash", value)} /><div className="form-grid form-grid-two"><Field idPrefix={title} label="Issuer ID" value={evidence.issuer} onChange={(value) => onChange("issuer", value)} /><Field idPrefix={title} label="Record ID" value={evidence.recordId} onChange={(value) => onChange("recordId", value)} /><Field idPrefix={title} label="Version" value={evidence.version} inputMode="numeric" onChange={(value) => onChange("version", value)} /><Field idPrefix={title} label="Published Unix time" value={evidence.publishedAt} inputMode="numeric" onChange={(value) => onChange("publishedAt", value)} /><Field idPrefix={title} label="Valid-until Unix time" value={evidence.validUntil} inputMode="numeric" onChange={(value) => onChange("validUntil", value)} /></div></fieldset>;
}

function ChallengeForm({ evidence, note, disabled, onEvidenceChange, onNoteChange, onSubmit, onCancel }: { evidence: EvidenceDraft; note: string; disabled: boolean; onEvidenceChange: (field: keyof EvidenceDraft, value: string) => void; onNoteChange: (value: string) => void; onSubmit: () => void; onCancel: () => void }) {
  return <section className="panel form-panel" aria-label="Submit an independent challenge"><div className="panel-heading"><div><span className="mini-label">CHALLENGE REVIEW</span><h2>Submit counter-evidence</h2></div><button className="button button-quiet compact" onClick={onCancel} aria-label="Close challenge form"><X size={16} /></button></div><p className="form-help">A challenge must come from a registered issuer and a source group different from both original records. It resets the decision for fresh independent review.</p><EvidenceEditor title="Challenge record" evidence={evidence} onChange={onEvidenceChange} /><label className="field field-wide"><span>Challenge note</span><textarea value={note} placeholder="Explain why this evidence should trigger a re-review." onChange={(event) => onNoteChange(event.target.value)} /></label><div className="form-wallet-note">{disabled ? "Connect a wallet on GenLayer Bradbury before submitting." : "Wallet connected to Bradbury. Review every value before signing."}</div><div className="form-actions"><button className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" onClick={onSubmit} disabled={disabled}>Submit challenge <ArrowRight size={16} /></button></div></section>;
}

function Field({ label, value, placeholder, inputMode, wide = false, idPrefix = "", onChange }: { label: string; value: string; placeholder?: string; inputMode?: "numeric" | "text"; wide?: boolean; idPrefix?: string; onChange: (value: string) => void }) {
  const id = `field-${idPrefix.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  return <label className={`field ${wide ? "field-wide" : ""}`} htmlFor={id}><span>{label}</span><input id={id} value={value} placeholder={placeholder} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} /></label>;
}
