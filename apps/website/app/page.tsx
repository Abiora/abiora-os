export default function Home() {
  return (
    <main>
      {/* Navigation */}
      <nav>
        <strong>ABIORA</strong>

        <div>
          <a href="#product">Product</a>
          <a href="#developers">Developers</a>
          <a href="#pricing">Pricing</a>
        </div>

        <a href="#signin">Sign in</a>
      </nav>

      {/* Hero Section */}
      <section>
        <p>AI-NATIVE DEVELOPMENT PLATFORM</p>

        <h1>
          Build software
          <br />
          at the speed of thought.
        </h1>

        <p>
          Turn ideas into production applications with an AI-powered
          development platform built for modern teams.
        </p>

        <div>
          <a href="#start">Start Building</a>
          <a href="#learn">Learn More</a>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="product-section">
        <div className="product-heading">
          <p>ONE WORKSPACE</p>

          <h2>
            From idea to production.
            <br />
            One workspace.
          </h2>

          <p>
            Describe what you want to build. Abiora brings your development
            workflow together in one intelligent workspace.
          </p>
        </div>

        <div className="workspace">
          <div className="workspace-topbar">
            <div className="window-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <p>abiora / my-app</p>
          </div>

          <div className="workspace-body">
            <aside>
              <p>PROJECT</p>

              <span>▾ app</span>
              <span>　page.tsx</span>
              <span>　layout.tsx</span>
              <span>▸ components</span>
              <span>▸ lib</span>
            </aside>

            <div className="workspace-main">
              <p className="ai-label">✦ ABIORA AI</p>

              <h3>What do you want to build?</h3>

              <div className="prompt-box">
                Build a SaaS dashboard with authentication, billing, and a
                modern analytics interface.
              </div>

              <div className="build-status">
                <p>✓ Project structure created</p>
                <p>✓ Authentication configured</p>
                <p>✓ Database connected</p>
                <p className="working">● Preparing application...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="developers" className="features-section">
        <div className="features-heading">
          <p>HOW ABIORA WORKS</p>

          <h2>
            One platform.
            <br />
            From prompt to production.
          </h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span>01</span>

            <h3>Prompt to Product</h3>

            <p>
              Describe what you want to build in plain English and turn your
              idea into the foundation of a real application.
            </p>
          </article>

          <article className="feature-card">
            <span>02</span>

            <h3>AI Development</h3>

            <p>
              Work with AI throughout development while keeping your project,
              code, and workflow together.
            </p>
          </article>

          <article className="feature-card">
            <span>03</span>

            <h3>Ship &amp; Scale</h3>

            <p>
              Move from building toward deployment and production without
              stitching together a dozen disconnected tools.
            </p>
          </article>
        </div>
      </section>
            {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-heading">
          <p>PRICING</p>

          <h2>
            Start building.
            <br />
            Scale when you&apos;re ready.
          </h2>

          <p className="pricing-description">
            Start with Abiora for free and upgrade as your projects,
            products, and team grow.
          </p>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <div>
              <p className="plan-name">FREE</p>
              <h3>$0</h3>
              <p className="price-note">For exploring and building ideas.</p>
            </div>

            <ul>
              <li>AI development workspace</li>
              <li>Personal projects</li>
              <li>Core development tools</li>
              <li>Community support</li>
            </ul>

            <a href="#start" className="pricing-button">
              Start Free
            </a>
          </article>

          <article className="pricing-card featured">
            <div className="popular-label">MOST POPULAR</div>

            <div>
              <p className="plan-name">PRO</p>
              <h3>
                $20<span>/month</span>
              </h3>
              <p className="price-note">
                For developers shipping real products.
              </p>
            </div>

            <ul>
              <li>Everything in Free</li>
              <li>More AI usage</li>
              <li>Production deployments</li>
              <li>Advanced development tools</li>
              <li>Priority support</li>
            </ul>

            <a href="#start" className="pricing-button primary">
              Start Building
            </a>
          </article>

          <article className="pricing-card">
            <div>
              <p className="plan-name">TEAM</p>
              <h3>Custom</h3>
              <p className="price-note">
                For teams building and scaling together.
              </p>
            </div>

            <ul>
              <li>Everything in Pro</li>
              <li>Team collaboration</li>
              <li>Shared projects</li>
              <li>Admin controls</li>
              <li>Dedicated support</li>
            </ul>

            <a href="#contact" className="pricing-button">
              Contact Us
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}