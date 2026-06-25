"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StudentProfile = {
  name: string;
  instruments: string[];
  experience: string;
  goal: string;
};

const instrumentLabels: Record<string, string> = {
  guitar: "Guitar",
  piano: "Piano",
  violin: "Violin",
  drums: "Drums",
  vocals: "Vocals",
  other: "Other",
};

const experienceLabels: Record<string, string> = {
  beginner: "Complete Beginner",
  some: "Some Experience",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const goalLabels: Record<string, string> = {
  fun: "Just for fun",
  basics: "Learn the basics",
  perform: "Perform someday",
  competitive: "Competitive or professional",
};

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            No student profile found
          </h1>

          <p className="mt-3 text-slate-500">
            Complete onboarding first so we can generate your matches.
          </p>

          <Link
            href="/student/onboarding"
            className="mt-6 inline-block rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-[#0d0820] transition hover:bg-yellow-400"
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
            href="/student/onboarding"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:border-white/50 hover:text-white"
          >
            Edit Profile
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Your Matches, {profile.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Here&apos;s your student profile summary. Soon, this page will show
            tutor recommendations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 text-5xl">🎓</div>

            <h2 className="text-xl font-bold text-slate-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">Music Student</p>

            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-500">Instruments</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.instruments
                    .map((instrument) => instrumentLabels[instrument])
                    .join(", ")}
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-500">Experience</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {experienceLabels[profile.experience]}
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-500">Goal</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {goalLabels[profile.goal]}
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-slate-900">
              Recommended Tutors
            </h2>

            <p className="mt-2 text-slate-500">
              Tutor matching cards will go here next.
            </p>

            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
              No tutor cards yet. Next step: add mock tutor data and matching
              scores.
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}