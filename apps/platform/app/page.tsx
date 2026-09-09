"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [idea, setIdea] = useState("");
  const router = useRouter();
  const ideaInputRef = useRef<HTMLTextAreaElement>(null);

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
            <a href="#">Settings</a>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">A</div>

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
            <a href="#">Docs</a>
            <a href="#">Help</a>
            <button className="profile-button">A</button>
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

              <button className="view-button">View all</button>
            </div>

            <div className="projects-grid">
              <article className="project-card new-card">
                <div className="plus">＋</div>

                <div>
                  <h3>Start a new project</h3>
                  <p>Turn an idea into a structured application.</p>
                </div>
              </article>

              <article className="project-card">
                <div className="project-card-top">
                  <div className="project-icon">A</div>
                  <span className="project-menu">•••</span>
                </div>

                <div className="project-info">
                  <h3>DentalFlow</h3>
                  <p>
                    Appointment management platform for modern dental clinics.
                  </p>
                </div>

                <div className="project-meta">
                  <span>
                    <i className="green-dot"></i>
                    Production
                  </span>

                  <span>Updated 2h ago</span>
                </div>
              </article>

              <article className="project-card">
                <div className="project-card-top">
                  <div className="project-icon">S</div>
                  <span className="project-menu">•••</span>
                </div>

                <div className="project-info">
                  <h3>StudioOS</h3>
                  <p>
                    Client management and billing workspace for creative teams.
                  </p>
                </div>

                <div className="project-meta">
                  <span>
                    <i className="blue-dot"></i>
                    Development
                  </span>

                  <span>Updated 1d ago</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}