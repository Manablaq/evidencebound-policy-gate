"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="error-screen"><section className="error-card" role="alert"><div className="eyebrow">EVIDENCEBOUND / RECOVERABLE ERROR</div><h1>The workspace needs a fresh start.</h1><p>A client-side error interrupted this view. Your onchain records are unchanged. Retry the interface, then use Sync state to reload the latest Bradbury data.</p><button className="button button-primary" onClick={() => reset()}>Retry workspace</button></section></main>;
}
