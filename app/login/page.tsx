"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Check user role and redirect accordingly
      const { data: { user } } = await getSupabase().auth.getUser();
      if (user) {
        const { data: profile } = await getSupabase()
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = (profile as any)?.role;
        if (role === "tutor") {
          router.push("/tutor/dashboard");
        } else if (role === "student") {
          router.push("/student/dashboard");
        } else {
          router.push("/student/onboarding");
        }
      } else {
        router.push("/");
      }
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
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Log In</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

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
          Log In
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </main>
  );
}