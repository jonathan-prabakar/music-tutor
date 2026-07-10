"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="mb-4 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to Home
      </Link>
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Sign Up</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {success ? (
          <div className="rounded-lg bg-green-50 px-4 py-6 text-center">
            <p className="text-sm text-green-700">
              Check your email for a confirmation link, then{" "}
              <Link href="/login" className="font-semibold underline">
                log in
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              Sign Up
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Log In
              </Link>
            </p>
          </>
        )}
      </form>
    </main>
  );
}