"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Analysis,
  Foundation,
  UserType,
} from "@/types/application";

function ArchitectView() {
  const searchParams = useSearchParams();
  const idea = searchParams.get("idea") || "";

  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createClient().auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
        window.location.href = `/login?next=${encodeURIComponent(`/architect?idea=${encodeURIComponent(idea)}`)}`;
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to run once on mount
  }, []);

  useEffect(() => {
    async function analyzeIdea() {
      if (authState !== "authenticated") return;

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
  }, [idea, authState]);

  function updateProductName(value: string) {
    setAnalysis((current) =>
      current
        ? {
            ...current,
            productName: value,
          }
        : current
    );
  }

  function updateSummary(value: string) {
    setAnalysis((current) =>
      current
        ? {
            ...current,
            summary: value,
          }
        : current
    );
  }

  function updateUser(
    index: number,
    field: keyof UserType,
    value: string
  ) {
    setAnalysis((current) => {
      if (!current) return current;

      const users = [...current.users];

      users[index] = {
        ...users[index],
        [field]: value,
      };

      return {
        ...current,
        users,
      };
    });
  }

  function addUser() {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        users: [
          ...current.users,
          {
            name: "New user",
            description: "Describe what this user does.",
          },
        ],
      };
    });
  }

  function removeUser(index: number) {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        users: current.users.filter((_, userIndex) => userIndex !== index),
      };
    });
  }

  function updateFeature(index: number, value: string) {
    setAnalysis((current) => {
      if (!current) return current;

      const features = [...current.features];
      features[index] = value;

      return {
        ...current,
        features,
      };
    });
  }

  function addFeature() {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        features: [...current.features, "New feature"],
      };
    });
  }

  function removeFeature(index: number) {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        features: current.features.filter(
          (_, featureIndex) => featureIndex !== index
        ),
      };
    });
  }

  function updateDataEntity(index: number, value: string) {
    setAnalysis((current) => {
      if (!current) return current;

      const dataModel = [...current.dataModel];
      dataModel[index] = value;

      return {
        ...current,
        dataModel,
      };
    });
  }

  function addDataEntity() {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        dataModel: [...current.dataModel, "New entity"],
      };
    });
  }

  function removeDataEntity(index: number) {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        dataModel: current.dataModel.filter(
          (_, entityIndex) => entityIndex !== index
        ),
      };
    });
  }

  function toggleFoundation(field: keyof Foundation) {
    setAnalysis((current) => {
      if (!current) return current;

      return {
        ...current,
        foundation: {
          ...current.foundation,
          [field]: !current.foundation[field],
        },
      };
    });
  }

  function approvePlan() {
    setEditing(false);
    setApproved(true);
  }

  function startBuild() {
  if (!analysis) return;

  sessionStorage.setItem(
    "abiora-approved-architecture",
    JSON.stringify(analysis)
  );

  sessionStorage.removeItem("abiora-build-plan");
  sessionStorage.removeItem("abiora-generated-application");
  sessionStorage.removeItem("abiora-generated-application-id");

  sessionStorage.setItem("abiora-build-status", "started");

  window.location.href = "/builder";
}


  if (loading) {
    return (
      <main className="architect-page">
        <header className="architect-topbar">
          <Link href="/" className="architect-brand">
            ABIORA
          </Link>

          <div className="architect-progress">
            <span className="architect-progress-dot"></span>
            Analyzing product
          </div>

          <Link href="/" className="architect-exit">
            Exit
          </Link>
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
          <Link href="/" className="architect-brand">
            ABIORA
          </Link>

          <div className="architect-progress">
            <span className="architect-progress-dot"></span>
            Analysis stopped
          </div>

          <Link href="/" className="architect-exit">
            Exit
          </Link>
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
              <Link href="/" className="edit-plan">
                ← Return to workspace
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const foundationItems: {
    key: keyof Foundation;
    label: string;
  }[] = [
    {
      key: "authentication",
      label: "Authentication",
    },
    {
      key: "database",
      label: "Database",
    },
    {
      key: "rolesAndPermissions",
      label: "Roles & permissions",
    },
    {
      key: "billing",
      label: "Subscription billing",
    },
    {
      key: "email",
      label: "Email & notifications",
    },
    {
      key: "errorHandling",
      label: "Error handling",
    },
    {
      key: "testing",
      label: "Testing foundation",
    },
  ];

  return (
    <main className="architect-page">
      <header className="architect-topbar">
        <Link href="/" className="architect-brand">
          ABIORA
        </Link>

        <div className="architect-progress">
          <span className="architect-progress-dot"></span>
          {approved
            ? "Architecture approved"
            : editing
              ? "Review mode"
              : "Analysis complete"}
        </div>

        <Link href="/" className="architect-exit">
          Exit
        </Link>
      </header>

      <div className="architect-container">
        <section className="architect-intro">
          <p className="eyebrow">✦ ABIORA ARCHITECT</p>

          <h1>
            {approved
              ? "Architecture approved."
              : editing
                ? "Refine the architecture."
                : "I've structured your idea."}
          </h1>

          <p>
            {approved
              ? "This specification is now ready to become the source of truth for the build."
              : editing
                ? "Review Abiora's decisions and change anything that does not match the product you want to build."
                : "Review the proposed product architecture before anything gets built. Abiora has focused the plan around a strong, practical MVP."}
          </p>
        </section>

        <div className="architect-layout">
          <div className="architect-main">
            <section className="architect-card product-summary">
              <div className="architect-card-heading">
                <span>01</span>
                <p>PRODUCT</p>
              </div>

              {editing ? (
                <>
                  <input
                    className="architect-edit-title"
                    value={analysis.productName}
                    onChange={(event) =>
                      updateProductName(event.target.value)
                    }
                  />

                  <textarea
                    className="architect-edit-textarea"
                    value={analysis.summary}
                    onChange={(event) => updateSummary(event.target.value)}
                  />
                </>
              ) : (
                <>
                  <h2>{analysis.productName}</h2>

                  <p className="architect-description">
                    {analysis.summary}
                  </p>
                </>
              )}
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>02</span>
                <p>USERS</p>
              </div>

              <div className="architect-list">
                {analysis.users.map((user, index) => (
                  <div key={index}>
                    {editing ? (
                      <div className="architect-edit-row">
                        <div className="architect-edit-fields">
                          <input
                            value={user.name}
                            onChange={(event) =>
                              updateUser(index, "name", event.target.value)
                            }
                          />

                          <textarea
                            value={user.description}
                            onChange={(event) =>
                              updateUser(
                                index,
                                "description",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="architect-remove"
                          onClick={() => removeUser(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <strong>{user.name}</strong>
                        <p>{user.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {editing && (
                <button
                  type="button"
                  className="architect-add"
                  onClick={addUser}
                >
                  + Add user
                </button>
              )}
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>03</span>
                <p>CORE MVP</p>
              </div>

              <div className="feature-grid">
                {analysis.features.map((feature, index) =>
                  editing ? (
                    <div className="architect-edit-item" key={index}>
                      <input
                        value={feature}
                        onChange={(event) =>
                          updateFeature(index, event.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span key={index}>✓ {feature}</span>
                  )
                )}
              </div>

              {editing && (
                <button
                  type="button"
                  className="architect-add"
                  onClick={addFeature}
                >
                  + Add feature
                </button>
              )}
            </section>

            <section className="architect-card">
              <div className="architect-card-heading">
                <span>04</span>
                <p>DATA MODEL</p>
              </div>

              <div className="data-model">
                <div className="data-root">{analysis.productName}</div>

                <div className="data-children">
                  {analysis.dataModel.map((entity, index) =>
                    editing ? (
                      <div className="architect-edit-item" key={index}>
                        <input
                          value={entity}
                          onChange={(event) =>
                            updateDataEntity(index, event.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={() => removeDataEntity(index)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span key={index}>{entity}</span>
                    )
                  )}
                </div>
              </div>

              {editing && (
                <button
                  type="button"
                  className="architect-add"
                  onClick={addDataEntity}
                >
                  + Add data entity
                </button>
              )}
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
                  <div key={item.key}>
                    <span>{item.label}</span>

                    {editing ? (
                      <button
                        type="button"
                        className={
                          analysis.foundation[item.key]
                            ? "foundation-toggle active"
                            : "foundation-toggle"
                        }
                        onClick={() => toggleFoundation(item.key)}
                      >
                        {analysis.foundation[item.key]
                          ? "Required"
                          : "Not needed"}
                      </button>
                    ) : (
                      <b>
                        {analysis.foundation[item.key]
                          ? "✓ Required"
                          : "Not needed"}
                      </b>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="architect-card recommendation-card">
              <p className="recommendation-label">
                ABIORA RECOMMENDS
              </p>

              <h3>Product decisions</h3>

              <div className="recommendation-list">
                {analysis.recommendations.map(
                  (recommendation, index) => (
                    <span key={index}>{recommendation}</span>
                  )
                )}
              </div>
            </section>
          </aside>
        </div>

        <div className="architect-actions">
          <div>
            <strong>
              {approved
                ? "Specification approved"
                : editing
                  ? "Review mode active"
                  : "Architecture ready for review"}
            </strong>

            <span>
              {approved
                ? "Abiora can now use this approved specification for the build."
                : editing
                  ? "Your changes will become part of the approved product specification."
                  : "Review the MVP before moving into application generation."}
            </span>
          </div>

          <div className="architect-buttons">
            {!approved && !editing && (
              <>
                <button
                  type="button"
                  className="edit-plan"
                  onClick={() => setEditing(true)}
                >
                  Edit Plan
                </button>

                <button
                  type="button"
                  className="approve-build"
                  onClick={approvePlan}
                >
                  Approve Plan →
                </button>
              </>
            )}

            {!approved && editing && (
              <>
                <button
                  type="button"
                  className="edit-plan"
                  onClick={() => setEditing(false)}
                >
                  Done Editing
                </button>

                <button
                  type="button"
                  className="approve-build"
                  onClick={approvePlan}
                >
                  Approve Plan →
                </button>
              </>
            )}

            {approved && (
              <button
                type="button"
                className="approve-build"
                  onClick={startBuild}
              >
                Start Build →
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ArchitectPage() {
  return (
    <Suspense fallback={null}>
      <ArchitectView />
    </Suspense>
  );
}
