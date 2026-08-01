"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type UserType = {
  name: string;
  description: string;
};

type Foundation = {
  authentication: boolean;
  database: boolean;
  rolesAndPermissions: boolean;
  billing: boolean;
  email: boolean;
  errorHandling: boolean;
  testing: boolean;
};

type Analysis = {
  productName: string;
  summary: string;
  users: UserType[];
  features: string[];
  dataModel: string[];
  foundation: Foundation;
  recommendations: string[];
};

export default function ArchitectPage() {
  const searchParams = useSearchParams();
  const idea = searchParams.get("idea") || "";

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function analyzeIdea() {
      if (!idea) {
        setError("No product idea was provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idea }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Abiora could not analyze the idea.");
        }

        setAnalysis(data.analysis);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Abiora could not analyze the idea."
        );
      } finally {
        setLoading(false);
      }
    }

    analyzeIdea();
  }, [idea]);

  if (loading) {
    return (
      <main className="architect-page">
        <header className="architect-topbar">
          <a href="/" className="architect-brand">
            ABIORA
          </a>

          <div className="architect-progress">
            <span className="architect-progress-dot"></span>
            Analyzing product
          </div>

          <a href="/" className="architect-exit">
            Exit
          </a>
        </header>

        <div className="architect-container">
          <section className="architect-intro">
            <p className="eyebrow">✦ ABIORA ARCHITECT</p>

            <h1>Analyzing your idea...</h1>

            <p>
              Abiora is identifying the product structure, users, workflows,
              data, and production requirements.
            </p>
          </section>

          <section className="architect-card">
            <div className="architect-card-heading">
              <span>AI</span>
              <p>PRODUCT ANALYSIS</p>
            </div>

            <p className="architect-description">{idea}</p>
          </section>
        </div>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="architect-page">
        <header className="architect-topbar">
          <a href="/" className="architect-brand">
            ABIORA
          </a>

          <div className="architect-progress">
            <span className="architect-progress-dot"></span>
            Analysis stopped
          </div>

          <a href="/" className="architect-exit">
            Exit
          </a>
        </header>

        <div className="architect-container">
          <section className="architect-intro">
            <p className="eyebrow">✦ ABIORA ARCHITECT</p>

            <h1>We couldn&apos;t analyze this idea.</h1>

            <p>{error || "Something went wrong while analyzing the product."}</p>
          </section>

          <div className="architect-actions">
            <div>
              <strong>Your idea is safe.</strong>
              <span>Return to the workspace and try the analysis again.</span>
            </div>

            <div className="architect-buttons">
              <a href="/" className="edit-plan">
                ← Return to workspace
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const foundationItems = [
    {
      label: "Authentication",
      enabled: analysis.foundation.authentication,
    },
    {
      label: "Database",
      enabled: analysis.foundation.database,
    },
    {
      label: "Roles & permissions",
      enabled: analysis.foundation.rolesAndPermissions,
    },
    {
      label: "Subscription billing",
      enabled: analysis.foundation.billing,
    },
    {
      label: "Email & notifications",
      enabled: analysis.foundation.email,
    },
    {
      label: "Error handling",
      enabled: analysis.foundation.errorHandling,
    },
    {
      label: "Testing foundation",
      enabled: analysis.foundation.testing,
    },
  ];

  return (
    <main className="architect-page">
      <header className="architect-topbar">
        <a href="/" className="architect-brand">
          ABIORA
        </a>

        <div className="architect-progress">
          <span className="architect-progress-dot"></span>
          Analysis complete
        </div>

        <a href="/" className="architect-exit">
          Exit
        </a>
      </header>

      <div className="architect-container">
        <section className="architect-intro">
          <p className="eyebrow">✦ ABIORA ARCHITECT</p>

          <h1>I&apos;ve structured your idea.</h1>

          <p>
            Review the proposed product architecture before anything gets
            built. Abiora has focused the plan around a strong, practical MVP.
          </p>
        </section>

        <div className="architect-layout">
          <div className="architect-main">
            <section className="architect-card product-summary">
              <div className="architect-card-heading">
                <span>01</span>
                <p>PRODUCT</p>
              </div>

              <h2>{analysis.productName}</h2>

              <p className="architect-description">{analysis.summary}</p>
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>02</span>
                <p>USERS</p>
              </div>

              <div className="architect-list">
                {analysis.users.map((user, index) => (
                  <div key={`${user.name}-${index}`}>
                    <strong>{user.name}</strong>
                    <p>{user.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>03</span>
                <p>CORE MVP</p>
              </div>

              <div className="feature-grid">
                {analysis.features.map((feature, index) => (
                  <span key={`${feature}-${index}`}>✓ {feature}</span>
                ))}
              </div>
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>04</span>
                <p>DATA MODEL</p>
              </div>

              <div className="data-model">
                <div className="data-root">{analysis.productName}</div>

                <div className="data-children">
                  {analysis.dataModel.map((entity, index) => (
                    <span key={`${entity}-${index}`}>{entity}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="architect-sidebar">
            <section className="architect-card foundation-card">
              <div className="architect-card-heading">
                <span>05</span>
                <p>PRODUCTION FOUNDATION</p>
              </div>

              <div className="foundation-list">
                {foundationItems.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>

                    <b>{item.enabled ? "✓ Required" : "Not needed"}</b>
                  </div>
                ))}
              </div>
            </section>

            <section className="architect-card recommendation-card">
              <p className="recommendation-label">ABIORA RECOMMENDS</p>

              <h3>Product decisions</h3>

              <div className="recommendation-list">
                {analysis.recommendations.map((recommendation, index) => (
                  <span key={`${recommendation}-${index}`}>
                    {recommendation}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <div className="architect-actions">
          <div>
            <strong>Architecture ready for review</strong>
            <span>
              Review the MVP before moving into application generation.
            </span>
          </div>

          <div className="architect-buttons">
            <a href="/" className="edit-plan">
              Edit Idea
            </a>

            <button className="approve-build">Approve &amp; Build →</button>
          </div>
        </div>
      </div>
    </main>
  );
}