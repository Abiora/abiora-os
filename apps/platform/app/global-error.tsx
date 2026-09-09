"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="state-page">
          <div className="state-card">
            <p className="state-eyebrow">✦ ABIORA</p>
            <h1>Something went wrong</h1>
            <p>Abiora hit an unexpected error. You can try again, or head back to the dashboard.</p>
            <div className="state-actions">
              <button type="button" className="state-primary" onClick={reset}>
                Try again
              </button>
              {/* Plain anchor, not next/link: this replaces the root layout when it
                  itself has failed, so router context can't be relied on here. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="state-secondary">
                Back to dashboard
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
