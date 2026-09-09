"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <main className="state-page">
      <div className="state-card">
        <p className="state-eyebrow">✦ ABIORA</p>
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred. You can try again, or head back to the dashboard.</p>
        <div className="state-actions">
          <button type="button" className="state-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="state-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
