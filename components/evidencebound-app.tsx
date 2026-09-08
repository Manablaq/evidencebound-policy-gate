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
import { useCallback, useEffect, useState } from "react";
import {
  asNumber,
  CASE_FIELDS,
  CONTRACT_ADDRESS,
  decisionName,
  decisionTone,
  DEMO,
  EXPLORER_URL,
  FIXTURE_BASE_URL,
  getReadClient,
  getWriteClient,
  REPOSITORY_URL,
  shortHash,
  statusName,
  statusTone,
  type ChainCase,
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
  const [notice, setNotice] = useState<Notice>({ kind: "info", text: "Public reads are available. Connect a Bradbury wallet only when you want to submit an action." });
  const [tx, setTx] = useState<{ hash: string; label: string; status: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const status = statusName(liveCase.status);
  const decision = decisionName(liveCase.decision);
  const resolved = status === "RESOLVED" || status === "FINALIZED";
  const final = status === "FINALIZED";

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("evidencebound-theme") as Theme | null;
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    const handleAccounts = (...args: unknown[]) => setWallet(typeof args[0] === "object" && Array.isArray(args[0]) ? String(args[0][0] ?? "") : "");
    window.ethereum?.on?.("accountsChanged", handleAccounts);
    return () => {
      observer.disconnect();
      window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("evidencebound-theme", theme);
  }, [theme]);

  const readState = useCallback(async (id = caseId) => {
    setIsReading(true);
    try {
      const client = await getReadClient();
      const [nextCase, nextPolicy] = await Promise.all([
        client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_case", args: [BigInt(id)] }),
        client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_policy", args: [DEMO.policyId] }),
      ]);
      setLiveCase(safeChainCase(nextCase));
      setPolicy(nextPolicy as Record<string, unknown>);
      setReadOnly(false);
      setNotice({ kind: "success", text: `Bradbury state synced for case ${id}. The workspace updated without a page reload.` });
    } catch (error) {
      setReadOnly(true);
      setNotice({ kind: "error", text: `Live read unavailable: ${toError(error)} Showing the verified demo snapshot instead.` });
      setLiveCase(FALLBACK_CASE);
    } finally {
      setIsReading(false);
    }
  }, [caseId]);

  useEffect(() => { if (view === "workspace") void readState(); }, [view, readState]);

  function openWorkspace() {
    setView("workspace");
    window.setTimeout(() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setNotice({ kind: "error", text: "No browser wallet detected. Install a compatible wallet, switch to GenLayer Bradbury, then try again." });
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      setWallet(accounts[0] ?? "");
      setNotice({ kind: "success", text: "Wallet connected. Writes will target the verified Bradbury contract." });
    } catch (error) {
      setNotice({ kind: "error", text: toError(error) });
    }
  }

  async function executeWrite(functionName: string, args: unknown[], label: string) {
    if (!wallet) await connectWallet();
    const account = wallet || ((await window.ethereum?.request({ method: "eth_accounts" }) as string[] | undefined)?.[0] ?? "");
    if (!account) throw new Error("Connect a browser wallet before submitting a Bradbury action.");
    const client = await getWriteClient(account);
    setIsBusy(true);
    setNotice({ kind: "info", text: `${label} submitted to your wallet. Confirm the signature to continue.` });
    const hash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName, args, value: 0n });
    setTx({ hash: String(hash), label, status: "Submitted" });
    setNotice({ kind: "success", text: `${label} accepted by the wallet. Monitoring consensus in the background; you can keep working.` });
    setIsBusy(false);
    void monitorTransaction(String(hash), label);
  }

  async function monitorTransaction(hash: string, label: string) {
    try {
      const receipt = await (await getReadClient()).waitForTransactionReceipt({ hash, status: "ACCEPTED", retries: 120, interval: 5000 });
      setTx({ hash, label, status: String(receipt?.txExecutionResultName ?? "Accepted") });
      window.setTimeout(() => void readState(), 1000);
    } catch {
      setTx((current) => current?.hash === hash ? { ...current, status: "Accepted; finalizing" } : current);
    }
  }

  async function openDemoCase() {
    try {
      await executeWrite("open_case", [DEMO.policyId, DEMO.subject, DEMO.submittedContent, DEMO.context, DEMO.evidenceAUri, DEMO.evidenceAHash, DEMO.evidenceAIssuer, DEMO.evidenceARecordId, 1n, DEMO.timestamp, DEMO.validUntil, DEMO.evidenceBUri, DEMO.evidenceBHash, DEMO.evidenceBIssuer, DEMO.evidenceBRecordId, 1n, DEMO.timestamp, DEMO.validUntil, 604800n], "New evidence review");
    } catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function resolveCase() {
    try { await executeWrite("resolve_case", [BigInt(caseId)], "Case resolution"); }
    catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  async function challengeCase() {
    try {
      await executeWrite("submit_challenge", [BigInt(caseId), DEMO.challengeUri, DEMO.challengeHash, DEMO.challengeIssuer, DEMO.challengeRecordId, 1n, DEMO.timestamp, DEMO.validUntil, "Customer dispute submitted for independent re-review."], "Independent challenge");
    } catch (error) { setIsBusy(false); setNotice({ kind: "error", text: toError(error) }); }
  }

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => setView("landing")}><Logo /><span>Evidence<span className="brand-muted">Bound</span></span></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => <a key={item} href={item === "Workspace" ? "#workspace" : `#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => item === "Workspace" && openWorkspace()}>{item}</a>)}
        </nav>
        <div className="top-actions"><StatusPill label="Bradbury live" tone="live" pulse /><button className="theme-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button><button className="wallet-button" onClick={connectWallet}><Wallet size={16} />{wallet ? shortHash(wallet, 6, 4) : "Connect wallet"}</button><button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>
      {mobileOpen && <div className="mobile-nav">{navItems.map((item) => <a key={item} href={item === "Workspace" ? "#workspace" : `#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => { setMobileOpen(false); if (item === "Workspace") openWorkspace(); }}>{item}</a>)}</div>}

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
        <div className="workspace-head reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> LIVE WORKSPACE / CASE REVIEW</div><h1>Evidence control room.</h1><p>Inspect the current policy, trace the evidence snapshot, and keep every Bradbury action visible.</p></div><div className="workspace-head-actions"><button className="button button-quiet" onClick={() => void readState()} disabled={isReading}><RefreshCw size={16} className={isReading ? "spin" : ""} /> {isReading ? "Syncing" : "Sync state"}</button><button className="button button-primary" onClick={openDemoCase} disabled={isBusy}><Sparkles size={16} /> New review</button></div></div>
        <div className="notice-bar reveal"><div className={`notice-icon ${notice.kind}`}><CircleAlert size={17} /></div><span>{notice.text}</span>{readOnly && <StatusPill label="Read-only fallback" tone="warning" />}</div>
        <div className="workspace-grid reveal">
          <section className="workspace-main"><div className="panel case-panel"><div className="panel-heading"><div><span className="mini-label">ACTIVE CASE</span><h2>{String(liveCase.subject)} <span className="case-id">#{String(liveCase.case_id)}</span></h2></div><StatusPill label={status.replace("_", " ")} tone={statusTone(liveCase.status)} pulse={status === "OPEN" || status === "CHALLENGED"} /></div><div className="case-meta-row"><span><Clock3 size={14} /> Created {formatDate(liveCase.created_at)}</span><span><Layers3 size={14} /> Revision {String(liveCase.evidence_revision)}</span><span><BadgeCheck size={14} /> {String(liveCase.resolution_count)} resolutions</span></div><div className="decision-banner"><div className="decision-label">CONSENSUS DECISION</div><div className="decision-value"><strong className={`decision-${decisionTone(liveCase.decision)}`}>{decision}</strong><span>{asNumber(liveCase.confidence) ? `${asNumber(liveCase.confidence) / 100}% confidence` : "Awaiting adjudication"}</span></div><p>{String(liveCase.summary || "Resolve the evidence snapshot through GenLayer to receive a canonical decision.")}</p><div className="decision-details"><span>Reason <b>{String(liveCase.reason_code || "pending")}</b></span><span>Bound <b>{liveCase.consensus_bound ? "yes" : "no"}</b></span><span>Consumer ready <b>{final ? "yes" : "no"}</b></span></div></div><div className="action-row"><button className="button button-primary" disabled={isBusy || !["OPEN", "CHALLENGED", "ERROR"].includes(status)} onClick={resolveCase}>{isBusy ? "Submitting…" : "Resolve through GenLayer"}<ArrowRight size={16} /></button><button className="button button-outline" disabled={isBusy || status !== "RESOLVED"} onClick={challengeCase}>Submit challenge</button><button className="button button-quiet compact" onClick={() => void readState()} aria-label="Refresh case"><RefreshCw size={16} /></button></div></div><div className="panel evidence-panel"><div className="panel-heading"><div><span className="mini-label">EVIDENCE SNAPSHOT</span><h2>Independent records</h2></div><span className="panel-caption">Full-body SHA-256 pinned</span></div><div className="evidence-list"><EvidenceRow label="EVIDENCE A" issuer={String(liveCase.evidence_a_issuer)} group={String(liveCase.evidence_a_group)} record={String(liveCase.evidence_a_record_id)} hash={String(liveCase.evidence_a_hash)} uri={String(liveCase.evidence_a_uri)} /><div className="evidence-connector"><span /> distinct source groups <span /></div><EvidenceRow label="EVIDENCE B" issuer={String(liveCase.evidence_b_issuer)} group={String(liveCase.evidence_b_group)} record={String(liveCase.evidence_b_record_id)} hash={String(liveCase.evidence_b_hash)} uri={String(liveCase.evidence_b_uri)} />{String(liveCase.challenge_uri) && <><div className="evidence-connector challenge-connector"><span /> challenged with independent record <span /></div><EvidenceRow label="CHALLENGE" issuer={String(liveCase.challenge_issuer)} group={String(liveCase.challenge_group)} record={String(liveCase.challenge_record_id)} hash={String(liveCase.challenge_hash)} uri={String(liveCase.challenge_uri)} /></>}</div></div></section>
          <aside className="workspace-side"><div className="panel policy-panel"><div className="panel-heading"><div><span className="mini-label">POLICY</span><h2>{String(policy?.name || liveCase.policy_name)}</h2></div><Code2 size={18} /></div><p>{String(policy?.policy_text || liveCase.policy_text)}</p><div className="policy-fingerprint"><span>VERSION</span><b>v{String(policy?.version || liveCase.policy_version)}</b><span>DIGEST</span><code>{shortHash(policy?.policy_digest || liveCase.policy_digest, 12, 8)}</code></div><a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="text-link">View audited source <ExternalLink size={14} /></a></div><div className="panel lifecycle-panel"><div className="panel-heading"><div><span className="mini-label">LIFECYCLE</span><h2>Review path</h2></div><Activity size={18} /></div><LifecycleItem label="Snapshot pinned" detail="2 issuer-bound records" done /><LifecycleItem label="Leader adjudication" detail={resolved ? "Canonical result returned" : "Awaiting resolution"} done={resolved} active={!resolved} /><LifecycleItem label="Challenge window" detail={final ? "Closed · final" : "Open until deadline"} done={final} active={resolved && !final} /><LifecycleItem label="Consumer predicate" detail={final ? "Available to callers" : "Locked until finality"} done={final} active={false} /></div><div className="panel network-panel"><div className="network-title"><span className="network-pulse" /> Bradbury network</div><div className="network-row"><span>Contract</span><code>{shortHash(CONTRACT_ADDRESS)}</code></div><div className="network-row"><span>Source</span><code>SHA {shortHash(String(liveCase.policy_digest), 8, 5)}</code></div><a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="explorer-link">Open Explorer <ExternalLink size={13} /></a></div></aside>
        </div>
        {tx && <div className="transaction-toast"><div className="tx-icon"><Zap size={16} /></div><div><span>{tx.label} · {tx.status}</span><code>{shortHash(tx.hash, 14, 9)}</code></div><a href={`${EXPLORER_URL}?tx=${tx.hash}`} target="_blank" rel="noreferrer" aria-label="Open transaction in Explorer"><ExternalLink size={15} /></a></div>}
        <div className="workspace-footer"><button className="text-link" onClick={() => setView("landing")}><ArrowRight size={14} className="back-arrow" /> Back to overview</button><span>Every state update is reflected in-place after Bradbury acceptance.</span></div>
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
