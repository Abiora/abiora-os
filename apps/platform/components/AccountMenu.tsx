"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

/**
 * The single, shared account control: an avatar trigger (initial derived
 * from the signed-in user's email) that opens a small menu showing the
 * email and a "Log out" action. Used identically on the main dashboard and
 * the generated-app preview so there is exactly one account/logout pattern
 * across the authenticated product, instead of a different one per page.
 */
export function AccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    logoutRef.current?.focus();

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogout(event: ReactMouseEvent<HTMLButtonElement>) {
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

  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="account-menu" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className="account-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={email ? `Account menu for ${email}` : "Account menu"}
        onClick={() => setOpen((current) => !current)}
      >
        {initial}
      </button>

      {open && (
        <div className="account-menu-panel" role="menu" aria-label="Account">
          {email && (
            <div className="account-menu-email" role="none">
              {email}
            </div>
          )}
          <form action="/api/auth/logout" method="POST" role="none">
            <button type="submit" role="menuitem" ref={logoutRef} className="account-menu-logout" onClick={handleLogout}>
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
