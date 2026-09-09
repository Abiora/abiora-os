import Link from "next/link";

export default function NotFound() {
  return (
    <main className="state-page">
      <div className="state-card">
        <p className="state-eyebrow">✦ ABIORA</p>
        <h1>Page not found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
        <div className="state-actions">
          <Link href="/" className="state-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
