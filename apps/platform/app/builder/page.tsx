"use client";
import { useEffect, useState } from "react";
import type { Analysis } from "@/types/application";

export default function BuilderPage() {
  const [architecture, setArchitecture] =
    useState<Analysis | null>(null);

  const [status, setStatus] =
    useState("Preparing build");

  const [error, setError] =
    useState("");

  const [generating, setGenerating] =
    useState(false);

  const [hasBuildPlan, setHasBuildPlan] =
    useState(false);

  /*
   * Load the approved architecture and check whether
   * a build plan already exists.
   */
  useEffect(() => {
    const storedArchitecture = sessionStorage.getItem(
      "abiora-approved-architecture"
    );

    const storedBuildPlan = sessionStorage.getItem(
      "abiora-build-plan"
    );

    if (storedBuildPlan) {
      setHasBuildPlan(true);
      setStatus("Build plan ready");
    }

    if (!storedArchitecture) {
      setError(
        "No approved architecture was found. Return to Architect and approve a plan first."
      );
      return;
    }

    try {
      const parsed = JSON.parse(
        storedArchitecture
      ) as Analysis;

      setArchitecture(parsed);

      if (!storedBuildPlan) {
        const timer = setTimeout(() => {
          setStatus("Build specification ready");
        }, 1200);

        return () => clearTimeout(timer);
      }
    } catch {
      setError(
        "The approved architecture could not be loaded."
      );
    }
  }, []);

  /*
   * Step 1:
   * Generate a build plan from the approved architecture.
   */
  async function generateBuildPlan() {
    if (!architecture || generating) return;

    setGenerating(true);
    setError("");
    setStatus("Generating build plan...");

    try {
      const response = await fetch(
        "/api/generate-build",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            architecture,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to generate the build plan."
        );
      }

      if (!data?.buildPlan) {
        throw new Error(
          "The AI did not return a valid build plan."
        );
      }

      sessionStorage.setItem(
        "abiora-build-plan",
        JSON.stringify(data.buildPlan)
      );

      setHasBuildPlan(true);
      setStatus("Build plan generated");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate the build plan."
      );

      setStatus("Build plan failed");
    } finally {
      setGenerating(false);
    }
  }

  /*
   * Step 2:
   * Generate the actual application from the build plan.
   */
  async function generateApplication() {
    if (generating) return;

    const storedBuildPlan =
      sessionStorage.getItem(
        "abiora-build-plan"
      );

    if (!storedBuildPlan) {
      setError(
        "No build plan was found. Generate the build plan first."
      );
      setStatus("Build plan required");
      return;
    }

    setGenerating(true);
    setError("");
    setStatus("Generating application...");

    try {
      let buildPlan;

      try {
        buildPlan = JSON.parse(
          storedBuildPlan
        );
      } catch {
        throw new Error(
          "The saved build plan is invalid. Please generate it again."
        );
      }

      const response = await fetch(
        "/api/generate-app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buildPlan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to generate the application."
        );
      }

      if (!data?.application) {
        throw new Error(
          "The AI did not return a valid application."
        );
      }

      sessionStorage.setItem(
        "abiora-generated-application",
        JSON.stringify(data.application)
      );

      setStatus("Application generated");

      window.location.href = "/generated";
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate the application."
      );

      setStatus("Application generation failed");
    } finally {
      setGenerating(false);
    }
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <main className="architect-page">
        <header className="architect-topbar">
          <a
            href="/"
            className="architect-brand"
          >
            ABIORA
          </a>

          <div className="architect-progress">
            <span className="architect-progress-dot"></span>
            Builder
          </div>

          <a
            href="/"
            className="architect-exit"
          >
            Exit
          </a>
        </header>

        <div className="architect-container">
          <section className="architect-intro">
            <p className="eyebrow">
              ✦ ABIORA BUILDER
            </p>

            <h1>
              We couldn&apos;t start the build.
            </h1>

            <p>{error}</p>
          </section>

          <div className="architect-actions">
            <div>
              <strong>
                Return to Architect
              </strong>

              <span>
                Approve an architecture before
                starting a build.
              </span>
            </div>

            <div className="architect-buttons">
              <a
                href="/architect"
                className="edit-plan"
              >
                ← Architect
              </a>
            </div>
          </div>
        </div>

        <BuilderStyles />
      </main>
    );
  }

  /*
   * Loading state.
   */
  if (!architecture) {
    return (
      <main className="architect-page">
        <header className="architect-topbar">
          <a
            href="/"
            className="architect-brand"
          >
            ABIORA
          </a>

          <div className="architect-progress">
            <span className="architect-progress-dot"></span>
            Builder
          </div>

          <a
            href="/"
            className="architect-exit"
          >
            Exit
          </a>
        </header>

        <div className="architect-container">
          <section className="architect-intro">
            <p className="eyebrow">
              ✦ ABIORA BUILDER
            </p>

            <h1>
              Preparing your build...
            </h1>

            <p>
              Abiora is loading the approved
              architecture and preparing the
              application build specification.
            </p>
          </section>
        </div>

        <BuilderStyles />
      </main>
    );
  }

  /*
   * Build pipeline.
   */
  const buildSteps = [
    {
      number: "01",
      title: "Product specification",
      description:
        "Lock the approved product definition and core MVP scope.",
      status: "Ready",
    },
    {
      number: "02",
      title: "Database architecture",
      description:
        "Translate the approved data model into application entities.",
      status: architecture.foundation.database
        ? "Required"
        : "Not needed",
    },
    {
      number: "03",
      title:
        "Authentication & permissions",
      description:
        "Prepare access rules based on the approved user types.",
      status:
        architecture.foundation
          .authentication ||
        architecture.foundation
          .rolesAndPermissions
          ? "Required"
          : "Not needed",
    },
    {
      number: "04",
      title: "Core application",
      description:
        "Generate the pages and workflows required by the MVP.",
      status: hasBuildPlan
        ? "Ready"
        : "Next",
    },
    {
      number: "05",
      title: "Production foundation",
      description:
        "Apply the approved billing, email, testing, and reliability requirements.",
      status: "Planned",
    },
  ];

  return (
    <main className="architect-page">
      <header className="architect-topbar">
        <a
          href="/"
          className="architect-brand"
        >
          ABIORA
        </a>

        <div className="architect-progress">
          <span className="architect-progress-dot"></span>
          Builder
        </div>

        <a
          href="/"
          className="architect-exit"
        >
          Exit
        </a>
      </header>

      <div className="architect-container">
        <section className="architect-intro">
          <p className="eyebrow">
            ✦ ABIORA BUILDER
          </p>

          <h1>
            Build specification ready.
          </h1>

          <p>
            Abiora is using the architecture you
            approved as the source of truth for
            this build.
          </p>
        </section>

        <section className="architect-card product-summary">
          <div className="architect-card-heading">
            <span>PROJECT</span>
            <p>APPROVED PRODUCT</p>
          </div>

          <h2>
            {architecture.productName}
          </h2>

          <p className="architect-description">
            {architecture.summary}
          </p>
        </section>

        <div className="architect-layout">
          <div className="architect-main">
            <section className="architect-card">
              <div className="architect-card-heading">
                <span>01</span>
                <p>BUILD PIPELINE</p>
              </div>

              <div className="builder-steps">
                {buildSteps.map((step) => (
                  <div
                    className="builder-step"
                    key={step.number}
                  >
                    <div className="builder-step-number">
                      {step.number}
                    </div>

                    <div className="builder-step-content">
                      <strong>
                        {step.title}
                      </strong>

                      <p>
                        {step.description}
                      </p>
                    </div>

                    <span className="builder-step-status">
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>02</span>
                <p>APP USERS</p>
              </div>

              <div className="architect-list">
                {architecture.users.map(
                  (user, index) => (
                    <div key={index}>
                      <strong>
                        {user.name}
                      </strong>

                      <p>
                        {user.description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>03</span>
                <p>CORE FEATURES</p>
              </div>

              <div className="feature-grid">
                {architecture.features.map(
                  (feature, index) => (
                    <span key={index}>
                      ✓ {feature}
                    </span>
                  )
                )}
              </div>
            </section>
          </div>

          <aside className="architect-sidebar">
            <section className="architect-card">
              <div className="architect-card-heading">
                <span>04</span>
                <p>DATA MODEL</p>
              </div>

              <div className="data-model">
                <div className="data-root">
                  {architecture.productName}
                </div>

                <div className="data-children">
                  {architecture.dataModel.map(
                    (entity, index) => (
                      <span key={index}>
                        {entity}
                      </span>
                    )
                  )}
                </div>
              </div>
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>05</span>
                <p>FOUNDATION</p>
              </div>

              <div className="foundation-list">
                <div>
                  <span>
                    Authentication
                  </span>

                  <b>
                    {architecture.foundation
                      .authentication
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>

                <div>
                  <span>Database</span>

                  <b>
                    {architecture.foundation
                      .database
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>

                <div>
                  <span>
                    Permissions
                  </span>

                  <b>
                    {architecture.foundation
                      .rolesAndPermissions
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>

                <div>
                  <span>Billing</span>

                  <b>
                    {architecture.foundation
                      .billing
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>

                <div>
                  <span>Email</span>

                  <b>
                    {architecture.foundation
                      .email
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>

                <div>
                  <span>
                    Error handling
                  </span>

                  <b>
                    {architecture.foundation
                      .errorHandling
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>

                <div>
                  <span>Testing</span>

                  <b>
                    {architecture.foundation
                      .testing
                      ? "Required"
                      : "Not needed"}
                  </b>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <section className="architect-card builder-status-card">
          <div>
            <p className="recommendation-label">
              ABIORA BUILDER
            </p>

            <h3>{status}</h3>

            <p>
              {hasBuildPlan
                ? "The build plan has been generated successfully. The application is ready to be generated from the approved specification."
                : "The approved architecture has been transferred into the build pipeline. Generate the build plan to continue."}
            </p>
          </div>

          <div className="builder-status-indicator">
            <span></span>

            {hasBuildPlan
              ? "Build plan ready"
              : "Specification locked"}
          </div>
        </section>

        <div className="architect-actions">
          <div>
            <strong>
              {hasBuildPlan
                ? "Build plan generated"
                : "Approved architecture"}
            </strong>

            <span>
              {hasBuildPlan
                ? "The build plan is ready. Generate the application to create the next stage."
                : "Abiora will build from this specification rather than the original unstructured idea."}
            </span>
          </div>

          <div className="architect-buttons">
            <a
              href="/architect"
              className="edit-plan"
            >
              ← Back to Architect
            </a>

            {!hasBuildPlan ? (
              <button
                type="button"
                className="approve-build"
                onClick={generateBuildPlan}
                disabled={generating}
              >
                {generating
                  ? "Generating Build Plan..."
                  : "Generate Build Plan →"}
              </button>
            ) : (
              <button
                type="button"
                className="approve-build"
                onClick={generateApplication}
                disabled={generating}
              >
                {generating
                  ? "Generating Application..."
                  : "Generate Application →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <BuilderStyles />
    </main>
  );
}

/*
 * Styling
 */
function BuilderStyles() {
  return (
    <style jsx>{`
      * {
        box-sizing: border-box;
      }

      .architect-page {
        min-height: 100vh;
        background: #070709;
        color: #f5f5f7;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      .architect-topbar {
        height: 72px;
        border-bottom: 1px solid #202027;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        background: #0a0a0d;
      }

      .architect-brand {
        color: white;
        text-decoration: none;
        font-weight: 800;
        letter-spacing: 3px;
        font-size: 14px;
      }

      .architect-progress {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #a3a3ad;
        font-size: 12px;
      }

      .architect-progress-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #7c83ff;
        box-shadow: 0 0 12px #7c83ff;
      }

      .architect-exit {
        color: #777780;
        text-decoration: none;
        font-size: 12px;
      }

      .architect-container {
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto;
        padding: 70px 0 100px;
      }

      .architect-intro {
        max-width: 760px;
        margin-bottom: 38px;
      }

      .eyebrow {
        color: #7c83ff;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 2.5px;
        margin: 0 0 15px;
      }

      .architect-intro h1 {
        margin: 0;
        font-size: clamp(36px, 5vw, 58px);
        line-height: 1.02;
        letter-spacing: -2.5px;
      }

      .architect-intro > p:last-child {
        color: #81818b;
        font-size: 15px;
        line-height: 1.7;
        margin: 20px 0 0;
        max-width: 650px;
      }

      .architect-card {
        border: 1px solid #24242b;
        background: #0d0d12;
        border-radius: 16px;
        padding: 24px;
      }

      .product-summary {
        margin-bottom: 18px;
      }

      .architect-card-heading {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .architect-card-heading span {
        color: #7c83ff;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.5px;
      }

      .architect-card-heading p {
        margin: 0;
        color: #666771;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.7px;
      }

      .product-summary h2 {
        margin: 0;
        font-size: 28px;
        letter-spacing: -0.8px;
      }

      .architect-description {
        color: #85858e;
        line-height: 1.7;
        font-size: 13px;
        margin: 10px 0 0;
      }

      .architect-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
        gap: 18px;
        align-items: start;
      }

      .architect-main,
      .architect-sidebar {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .builder-steps {
        display: flex;
        flex-direction: column;
      }

      .builder-step {
        display: grid;
        grid-template-columns: 48px 1fr auto;
        gap: 16px;
        align-items: center;
        padding: 18px 0;
        border-top: 1px solid #1f1f26;
      }

      .builder-step:first-child {
        border-top: 0;
        padding-top: 0;
      }

      .builder-step:last-child {
        padding-bottom: 0;
      }

      .builder-step-number {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: #17171f;
        color: #8c92ff;
        font-size: 10px;
        font-weight: 800;
      }

      .builder-step-content strong {
        display: block;
        font-size: 13px;
      }

      .builder-step-content p {
        margin: 5px 0 0;
        color: #707079;
        font-size: 11px;
        line-height: 1.5;
      }

      .builder-step-status {
        padding: 6px 9px;
        border-radius: 7px;
        background: #17171f;
        color: #9da2ff;
        font-size: 9px;
        white-space: nowrap;
      }

      .architect-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .architect-list > div {
        padding: 15px 0;
        border-top: 1px solid #1f1f26;
      }

      .architect-list > div:first-child {
        border-top: 0;
        padding-top: 0;
      }

      .architect-list > div:last-child {
        padding-bottom: 0;
      }

      .architect-list strong {
        font-size: 12px;
      }

      .architect-list p {
        color: #707079;
        font-size: 11px;
        line-height: 1.5;
        margin: 5px 0 0;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .feature-grid span {
        border: 1px solid #22222a;
        background: #111117;
        border-radius: 9px;
        padding: 11px;
        color: #a5a6af;
        font-size: 11px;
      }

      .data-model {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .data-root {
        padding: 12px;
        border: 1px solid #30303a;
        background: #17171f;
        border-radius: 9px;
        color: #b1b5ff;
        font-size: 11px;
        font-weight: 700;
      }

      .data-children {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding-left: 16px;
      }

      .data-children span {
        position: relative;
        padding: 9px 11px;
        border-left: 1px solid #34343d;
        color: #797a84;
        font-size: 10px;
      }

      .foundation-list {
        display: flex;
        flex-direction: column;
      }

      .foundation-list > div {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        padding: 11px 0;
        border-top: 1px solid #1f1f26;
      }

      .foundation-list > div:first-child {
        border-top: 0;
        padding-top: 0;
      }

      .foundation-list > div:last-child {
        padding-bottom: 0;
      }

      .foundation-list span {
        color: #777780;
        font-size: 11px;
      }

      .foundation-list b {
        color: #9da2ff;
        font-size: 10px;
        font-weight: 600;
      }

      .builder-status-card {
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .recommendation-label {
        margin: 0 0 7px;
        color: #7c83ff;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.7px;
      }

      .builder-status-card h3 {
        margin: 0;
        font-size: 17px;
      }

      .builder-status-card p:last-child {
        max-width: 650px;
        margin: 7px 0 0;
        color: #707079;
        font-size: 11px;
        line-height: 1.5;
      }

      .builder-status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border: 1px solid #25252e;
        border-radius: 8px;
        color: #92939c;
        font-size: 10px;
        white-space: nowrap;
      }

      .builder-status-indicator span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #7c83ff;
      }

      .architect-actions {
        margin-top: 18px;
        padding: 22px;
        border: 1px solid #24242b;
        background: #0d0d12;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 25px;
      }

      .architect-actions strong {
        display: block;
        font-size: 12px;
      }

      .architect-actions > div:first-child span {
        display: block;
        margin-top: 5px;
        color: #707079;
        font-size: 10px;
        line-height: 1.5;
      }

      .architect-buttons {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      .edit-plan,
      .approve-build {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 0 15px;
        border-radius: 9px;
        font-size: 11px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
      }

      .edit-plan {
        border: 1px solid #292930;
        background: #111117;
        color: #a1a1aa;
      }

      .approve-build {
        border: 1px solid #7c83ff;
        background: #7c83ff;
        color: white;
      }

      .approve-build:hover:not(:disabled) {
        filter: brightness(1.08);
      }

      .approve-build:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      @media (max-width: 850px) {
        .architect-container {
          width: min(100% - 28px, 700px);
          padding-top: 45px;
        }

        .architect-layout {
          grid-template-columns: 1fr;
        }

        .builder-status-card,
        .architect-actions {
          align-items: flex-start;
          flex-direction: column;
        }

        .architect-buttons {
          width: 100%;
        }

        .architect-buttons a,
        .architect-buttons button {
          flex: 1;
        }
      }

      @media (max-width: 600px) {
        .architect-topbar {
          padding: 0 18px;
        }

        .architect-container {
          width: calc(100% - 24px);
        }

        .architect-intro h1 {
          font-size: 38px;
        }

        .architect-card {
          padding: 18px;
        }

        .builder-step {
          grid-template-columns: 38px 1fr;
        }

        .builder-step-status {
          grid-column: 2;
          width: fit-content;
        }

        .feature-grid {
          grid-template-columns: 1fr;
        }

        .architect-buttons {
          flex-direction: column;
        }

        .architect-buttons a,
        .architect-buttons button {
          width: 100%;
        }
      }
    `}</style>
  );
}