"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TutorProfile = {
  name: string;
  instruments: string[];
  teachingStyle: string;
  studentPreference: string;
};

export default function TutorDashboardPage() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("tutorProfile");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            No tutor profile found
          </h1>

          <p className="mt-3 text-slate-500">
            Complete tutor onboarding first so we can show student matches.
          </p>

          <Link
            href="/tutor/onboarding"
            className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
          >
            Go to Onboarding
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="bg-[#0d0820] px-6 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-bold">
            🎵 MusicTutor
          </Link>

          <Link
            href="/tutor/onboarding"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Edit Profile
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Student Matches for {profile.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Soon, this page will show students ranked by compatibility with your
            teaching profile.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900">
            Tutor Profile Summary
          </h2>

          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Name:</span> {profile.name}
            </p>

            <p>
              <span className="font-semibold">Instruments:</span>{" "}
              {profile.instruments.join(", ")}
            </p>

            <p>
              <span className="font-semibold">Teaching Style:</span>{" "}
              {profile.teachingStyle}
            </p>

            <p>
              <span className="font-semibold">Student Preference:</span>{" "}
              {profile.studentPreference}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            Student match cards will go here next.
          </div>
        </div>
      </section>
    </main>
  );
}