"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calculateCompatibility, type StudentProfile } from "@/lib/matching";
import { getSupabase } from "@/lib/supabase";
import { mockTutors } from "@/lib/mock-tutors";

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

const styleLabels: Record<string, string> = {
  casual: "Casual",
  balanced: "Balanced",
  focused: "Focused",
  rigorous: "Rigorous",
};

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [requestedTutorIds, setRequestedTutorIds] = useState<number[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");
    const savedRequests = localStorage.getItem("requestedTutorIds");

    if (savedRequests) {
      setRequestedTutorIds(JSON.parse(savedRequests));
    }

    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();

      if (user) {
        const { data: studentData } = await getSupabase()
          .from("student_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (studentData) {
          const data = studentData as any;
          setProfile({
            name: user.user_metadata?.name ?? data.name ?? "Student",
            instruments: data.instruments ?? [],
            experience: data.experience ?? "beginner",
            goal: data.goal ?? "fun",
          });
          return;
        }
      }

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    })();
  }, []);

  const matchedTutors = useMemo(() => {
    if (!profile) return [];

    return mockTutors
      .map((tutor) => {
        const compatibility = calculateCompatibility(profile, tutor);

        return {
          ...tutor,
          compatibilityScore: compatibility.score,
          reasons: compatibility.reasons,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [profile]);

  function handleRequestTutor(tutorId: number) {
    if (!profile) return;

    setRequestedTutorIds((current) => {
      if (current.includes(tutorId)) return current;

      const updatedRequests = [...current, tutorId];

      localStorage.setItem(
        "requestedTutorIds",
        JSON.stringify(updatedRequests)
      );

      const existingRequests = localStorage.getItem("lessonRequests");
      const parsedRequests = existingRequests
        ? JSON.parse(existingRequests)
        : [];

      const newRequest = {
        id: Date.now(),
        tutorId,
        studentName: profile.name,
        studentInstruments: profile.instruments,
        studentExperience: profile.experience,
        studentGoal: profile.goal,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "lessonRequests",
        JSON.stringify([...parsedRequests, newRequest])
      );

      return updatedRequests;
    });
  }

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
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-bold">
            🎵 MusicTutor
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/student/matches"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:text-white"
            >
              My Matches
            </Link>
            <Link
              href="/student/onboarding"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:text-white"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={async () => {
                await getSupabase().auth.signOut();
                window.location.href = "/";
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Your Matches, {profile.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Tutors ranked by instrument, experience level, and learning goal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 text-5xl">🎓</div>

            <h2 className="text-xl font-bold text-slate-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">Music Student</p>

            <div className="mt-6 space-y-4 text-sm">
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

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Recommended Tutors
              </h2>

              <p className="text-sm text-slate-500">
                {matchedTutors.length} tutors found
              </p>
            </div>

            <div className="space-y-4">
              {matchedTutors.map((tutor, index) => (
                <article
                  key={tutor.id}
                  className={`rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg ${
                    index === 0 ? "border-2 border-yellow-500" : ""
                  }`}
                >
                  {index === 0 && (
                    <div className="mb-3 inline-block rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0d0820]">
                      Best Match
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-[auto_1fr_auto]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
                      {tutor.avatar}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {tutor.name}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {styleLabels[tutor.teachingStyle]}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {tutor.rateLabel}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {tutor.location}
                      </p>

                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {tutor.bio}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {tutor.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-slate-900">
                        {tutor.compatibilityScore}%
                      </div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Match
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRequestTutor(tutor.id)}
                        disabled={requestedTutorIds.includes(tutor.id)}
                        className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          requestedTutorIds.includes(tutor.id)
                            ? "cursor-not-allowed bg-green-100 text-green-700"
                            : "bg-[#0d0820] text-white hover:bg-[#1e1257]"
                        }`}
                      >
                        {requestedTutorIds.includes(tutor.id)
                          ? "Request Sent"
                          : "Contact"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}