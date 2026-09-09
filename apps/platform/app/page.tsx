"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ApplicationSummary = {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
};

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function Home() {
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [idea, setIdea] = useState("");
  const [applications, setApplications] = useState<ApplicationSummary[] | null>(null);
  const [projectsError, setProjectsError] = useState("");
  const router = useRouter();
  const ideaInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    createClient().auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
        window.location.href = `/login?next=${encodeURIComponent("/")}`;
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (authState !== "authenticated") return;
    let cancelled = false;
    fetch("/api/applications")
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error || "Could not load your projects.");
        if (cancelled) return;
        setApplications(body?.applications ?? []);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Load applications error:", error);
        setProjectsError(error instanceof Error ? error.message : "Could not load your projects.");
        setApplications([]);
      });
    return () => { cancelled = true; };
  }, [authState]);

  function analyzeIdea() {
    const cleanedIdea = idea.trim();

    if (!cleanedIdea) {
      return;
    }

    router.push(`/architect?idea=${encodeURIComponent(cleanedIdea)}`);
  }

  function focusIdeaInput() {
    ideaInputRef.current?.focus();
  }

  async function logout(event: MouseEvent<HTMLButtonElement>) {
    // Prevent the wrapping <form>'s native submit so JS can handle this
    // without a full page reload. If a handler never attaches (e.g. before
    // hydration completes), the native form submission still fires and
    // logs the user out via a plain POST to /api/auth/logout.
    event.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  if (authState !== "authenticated") {
    return (
      <main className="dashboard-loading">
        <p>{authState === "checking" ? "Checking your session…" : "Redirecting to log in…"}</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="brand">ABIORA</div>

          <button type="button" className="new-project" onClick={focusIdeaInput}>
            ＋ New Project
          </button>

          <nav className="sidebar-nav">
            <Link href="/" className="active">
              Projects
            </Link>
          </nav>
        </div>

        <div className="sidebar-footer">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="avatar" onClick={logout} aria-label="Log out" title="Log out">
              A
            </button>
          </form>

          <div>
            <strong>Account</strong>
            <span>Founder workspace</span>
          </div>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="topbar">
          <div>
            <span className="status-dot"></span>
            Development Workspace
          </div>

          <div className="topbar-links">
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="profile-button" onClick={logout} aria-label="Log out" title="Log out">
                A
              </button>
            </form>
          </div>
        </header>

        <div className="dashboard-inner">
          <div className="welcome">
            <p className="eyebrow">✦ ABIORA AI</p>

            <h1>
              What do you want
              <br />
              to build?
            </h1>

            <p className="welcome-description">
              Describe your product. Abiora will help turn the idea into a
              structured, production-ready application.
            </p>
          </div>

          <div className="idea-box">
            <textarea
              ref={ideaInputRef}
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="Describe your SaaS idea..."
              aria-label="Describe your SaaS idea"
            />

            <div className="idea-actions">
              <span>Tell Abiora as much or as little as you know.</span>

              <button
                type="button"
                className="analyze-button"
                onClick={analyzeIdea}
              >
                Analyze idea →
              </button>
            </div>
          </div>

          <section className="projects-section">
            <div className="section-heading">
              <div>
                <p className="section-label">YOUR WORKSPACE</p>
                <h2>Projects</h2>
              </div>
            </div>

            {projectsError && <div className="projects-error">{projectsError}</div>}

            <div className="projects-grid">
              <article className="project-card new-card" onClick={focusIdeaInput}>
                <div className="plus">＋</div>

                <div>
                  <h3>Start a new project</h3>
                  <p>Turn an idea into a structured application.</p>
                </div>
              </article>

              {applications === null &&
                Array.from({ length: 2 }).map((_, index) => (
                  <article className="project-card project-card-loading" key={index} aria-hidden="true" />
                ))}

              {applications?.map((application) => (
                <Link href={`/generated?applicationId=${encodeURIComponent(application.id)}`} className="project-card" key={application.id}>
                  <div className="project-card-top">
                    <div className="project-icon">{application.projectName.charAt(0).toUpperCase() || "?"}</div>
                  </div>

                  <div className="project-info">
                    <h3>{application.projectName}</h3>
                    <p>{application.description || "No description yet."}</p>
                  </div>

                  <div className="project-meta">
                    <span>Created {timeAgo(application.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {applications?.length === 0 && !projectsError && (
              <p className="projects-empty">No projects yet. Describe an idea above to generate your first one.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
