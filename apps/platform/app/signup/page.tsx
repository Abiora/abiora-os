"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/safe-redirect";

function SignupForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` },
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      // Email confirmation is not required for this project; the account is already active.
      window.location.href = next;
      return;
    }
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <main className="auth">
        <section className="card">
          <p>Abiora</p>
          <h1>Check your email</h1>
          <span className="switch">We sent a confirmation link to {email}. Open it to activate your account, then log in.</span>
          <span className="switch">
            <Link href="/login">Back to log in</Link>
          </span>
        </section>
        <Styles />
      </main>
    );
  }

  return (
    <main className="auth">
      <section className="card">
        <p>Abiora</p>
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="banner">{error}</div>}
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <span className="switch">
          Already have an account? <Link href={next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Log in</Link>
        </span>
      </section>
      <Styles />
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      .auth{min-height:100vh;background:#f7f8fc;display:grid;place-items:center;padding:20px;font-family:Arial,Helvetica,sans-serif;color:#172238}
      .auth .card{width:min(380px,100%);background:#fff;border:1px solid #e1e6ef;border-radius:14px;box-shadow:0 8px 25px #25375a0a;padding:28px}
      .auth .card>p{margin:0;color:#6474a4;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;font-weight:700}
      .auth h1{margin:5px 0 20px;font-size:24px}
      .auth form{display:grid;gap:14px}
      .auth label{display:grid;gap:6px;font-size:13px;font-weight:700;color:#4a5870}
      .auth input{border:1px solid #dce2ed;border-radius:8px;padding:10px 11px;outline:none;font:inherit;color:#293650}
      .auth .primary{border:1px solid #596ae6;background:#596ae6;color:#fff;border-radius:8px;padding:11px 14px;font-weight:700;cursor:pointer;margin-top:4px}
      .auth .primary:disabled{opacity:0.7;cursor:default}
      .auth .banner{padding:11px 13px;border-radius:8px;background:#fff1f2;border:1px solid #ffc9cf;color:#8a2632;font-size:13px}
      .auth .switch{display:block;margin-top:18px;font-size:13px;color:#65728a;text-align:center;line-height:1.6}
      .auth .switch a{color:#596ae6;font-weight:700;text-decoration:none}
    `}</style>
  );
}
