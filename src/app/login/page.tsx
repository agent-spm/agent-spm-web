"use client";

import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/logo";
import { Mail, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const supabase = createSupabaseBrowserClient();

  async function handleGitHubLogin() {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
      },
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
            },
          });

    const { error } = await action;

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (mode === "signin") {
      window.location.href = redirect;
    } else {
      setError(null);
      alert("Check your email for a confirmation link.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 lg:flex">
        <Logo size="lg" className="[&_span]:text-white" />
        <div>
          <h2 className="text-3xl font-bold text-white">
            Manage your agent skills ecosystem
          </h2>
          <p className="mt-3 text-lg text-brand-200">
            Track usage analytics, manage team seats, and monitor package
            performance — all in one dashboard.
          </p>
        </div>
        <p className="text-sm text-brand-300">
          &copy; {new Date().getFullYear()} SPM
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            {mode === "signin"
              ? "Sign in to your SPM dashboard."
              : "Start managing your agent skills."}
          </p>

          {/* GitHub */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-200 bg-surface-0 px-4 py-2.5 text-sm font-medium text-surface-900 transition-colors hover:bg-surface-50 disabled:opacity-50 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50 dark:hover:bg-surface-800"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
            <span className="text-xs text-surface-400">or</span>
            <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-surface-200 bg-surface-0 py-2.5 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-surface-200 bg-surface-0 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="font-medium text-brand-500 hover:text-brand-600"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="font-medium text-brand-500 hover:text-brand-600"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
