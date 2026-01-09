"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

function sanitizeFrom(from: string | undefined): string | undefined {
  if (!from) return undefined;
  // Only allow internal paths to avoid open-redirects.
  if (!from.startsWith("/") || from.startsWith("//")) return undefined;
  return from;
}

export default function SignIn({ from }: Readonly<{ from?: string }>) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="window active" style={{ maxWidth: "400px", margin: "auto" }}>
      <div className="title-bar">
        <div className="title-bar-text">Sign In</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body has-space">
        <p style={{ marginBottom: "16px" }}>
          Enter your email below to login to your account
        </p>

        <div className="group" style={{ marginBottom: "12px" }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="text"
            placeholder="m@example.com"
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <div className="group" style={{ marginBottom: "12px" }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            placeholder="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <section style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "16px" }}>
          <button
            className="default"
            disabled={loading}
            onClick={async () => {
              await signIn.email(
                {
                  email,
                  password
                },
                {
                  onRequest: () => {
                    setLoading(true);
                  },
                  onResponse: () => {
                    setLoading(false);
                  },
                  onSuccess: () => {
                    router.replace(sanitizeFrom(from) ?? "/dashboard");
                  },
                },
              );
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: "4px", display: "inline-block" }} />
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
        </section>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px" }}>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}