"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<object | null>(null);
  const [dashboardHref, setDashboardHref] = useState<string>("/student/onboarding");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data: profile } = await getSupabase()
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = (profile as any)?.role;
        if (role === "tutor") {
          setDashboardHref("/tutor/dashboard");
        } else if (role === "student") {
          setDashboardHref("/student/dashboard");
        } else {
          setDashboardHref("/student/onboarding");
        }
      }
    })();
  }, []);

  async function handleLogout() {
    await getSupabase().auth.signOut();
    setUser(null);
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] px-6 text-white">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between py-4">
        <span className="font-bold">🎵 MusicTutor</span>
        <div className="flex gap-4 text-sm">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="text-white/70 hover:text-white"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-white/70 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white/70 hover:text-white">
                Log In
              </Link>
              <Link href="/signup" className="text-white/70 hover:text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-3xl text-center">
          <div className="mb-6 text-6xl">🎵</div>

          <h1 className="text-5xl font-bold tracking-tight">MusicTutor</h1>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/70">
            Find a music tutor that matches your skill level, goals, pace, and
            learning style.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
              <div className="mb-4 text-5xl">🎓</div>

              <h2 className="text-2xl font-semibold">I'm a Student</h2>

              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Discover tutors who match your instrument, experience level,
                budget, and goals.
              </p>

              <Link
                href="/student/onboarding"
                className="mt-6 block text-blue-300 hover:text-white"
              >
                Find My Tutor
              </Link>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
              <div className="mb-4 text-5xl">🎤</div>

              <h2 className="text-2xl font-semibold">I'm a Tutor</h2>

              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Create a teaching profile and connect with students who fit your
                style.
              </p>

              <Link
                href="/tutor/onboarding"
                className="mt-6 block text-blue-300 hover:text-white"
              >
                Build My Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}