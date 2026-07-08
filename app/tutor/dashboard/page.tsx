"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mockStudents } from "@/lib/mock-students";
import {
  calculateStudentCompatibility,
  type TutorProfile,
} from "@/lib/tutor-matching";
import { getSupabase } from "@/lib/supabase";

const instrumentLabels: Record<string, string> = {
  guitar: "Guitar",
  piano: "Piano",
  violin: "Violin",
  drums: "Drums",
  vocals: "Vocals",
  other: "Other",
};

const styleLabels: Record<string, string> = {
  casual: "Casual & Fun",
  balanced: "Balanced",
  focused: "Focused & Structured",
  rigorous: "Rigorous & Professional",
};

const studentPreferenceLabels: Record<string, string> = {
  beginners: "Beginners",
  all: "All Levels",
  intermediate: "Intermediate+",
  advanced: "Advanced Only",
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

export default function TutorDashboardPage() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);

  const [requestedStudentIds, setRequestedStudentIds] = useState<number[]>([]);
  const [lessonRequests, setLessonRequests] = useState<
    {
      id: number;
      tutorId: number;
      studentName: string;
      studentInstruments: string[];
      studentExperience: string;
      studentGoal: string;
      status: string;
      createdAt: string;
    }[]
  >([]);

  useEffect(() => {
  const savedProfile = localStorage.getItem("tutorProfile");
  const savedRequests = localStorage.getItem("requestedStudentIds");
  const savedLessonRequests = localStorage.getItem("lessonRequests");

  if (savedProfile) {
    setProfile(JSON.parse(savedProfile));
  }

  if (savedRequests) {
    setRequestedStudentIds(JSON.parse(savedRequests));
  }

  if (savedLessonRequests) {
    setLessonRequests(JSON.parse(savedLessonRequests));
  }
}, []);

  function handleAcceptRequest(id: number) {
    setLessonRequests((current) => {
      const updated = current.map((req) =>
        req.id === id ? { ...req, status: "accepted" } : req
      );
      localStorage.setItem("lessonRequests", JSON.stringify(updated));
      return updated;
    });
  }

  function handleDeclineRequest(id: number) {
    setLessonRequests((current) => {
      const updated = current.map((req) =>
        req.id === id ? { ...req, status: "declined" } : req
      );
      localStorage.setItem("lessonRequests", JSON.stringify(updated));
      return updated;
    });
  }

  const matchedStudents = useMemo(() => {
    if (!profile) return [];

    return mockStudents
      .map((student) => {
        const compatibility = calculateStudentCompatibility(profile, student);

        return {
          ...student,
          compatibilityScore: compatibility.score,
          reasons: compatibility.reasons,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [profile]);

  function handleRequestStudent(studentId: number) {
  if (!profile) return;

  setRequestedStudentIds((current) => {
    if (current.includes(studentId)) {
      return current;
    }

    const updatedRequests = [...current, studentId];

    localStorage.setItem(
      "requestedStudentIds",
      JSON.stringify(updatedRequests)
    );

    const existingRequests = localStorage.getItem("tutorStudentRequests");
    const parsedRequests = existingRequests
      ? JSON.parse(existingRequests)
      : [];

    const newRequest = {
      id: Date.now(),
      studentId,
      tutorName: profile.name,
      tutorInstruments: profile.instruments,
      tutorTeachingStyle: profile.teachingStyle,
      tutorStudentPreference: profile.studentPreference,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "tutorStudentRequests",
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
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-bold">
            🎵 MusicTutor
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/tutor/onboarding"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={async () => {
                await getSupabase().auth.signOut();
                window.location.href = "/";
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Student Matches for {profile.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Students ranked by instrument fit, level preference, and teaching
            style compatibility.
          </p>
        </div>

        {/* Incoming Lesson Requests */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Incoming Lesson Requests
          </h2>

          {lessonRequests.length === 0 ? (
            <p className="text-sm text-slate-500">No incoming requests yet.</p>
          ) : (
            <div className="space-y-4">
              {lessonRequests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {request.studentName}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {request.studentInstruments.join(", ")}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {request.studentExperience}
                        </span>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {request.studentGoal}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            request.status === "pending"
                              ? "text-yellow-600"
                              : request.status === "accepted"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {request.status}
                        </span>
                      </p>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 text-5xl">🎤</div>

            <h2 className="text-xl font-bold text-slate-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">Music Tutor</p>

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
                <p className="font-medium text-slate-500">Teaching Style</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {styleLabels[profile.teachingStyle]}
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-500">
                  Student Preference
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {studentPreferenceLabels[profile.studentPreference]}
                </p>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Recommended Students
              </h2>

              <p className="text-sm text-slate-500">
                {matchedStudents.length} students found
              </p>
            </div>

            <div className="space-y-4">
              {matchedStudents.map((student, index) => (
                <article
                  key={student.id}
                  className={`rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg ${
                    index === 0 ? "border-2 border-indigo-500" : ""
                  }`}
                >
                  {index === 0 && (
                    <div className="mb-3 inline-block rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Best Student Match
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-[auto_1fr_auto]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
                      {student.avatar}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {student.name}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {experienceLabels[student.experience]}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {goalLabels[student.goal]}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {student.bio}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {student.instruments.map((instrument) => (
                          <span
                            key={instrument}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {instrumentLabels[instrument]}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {student.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-slate-900">
                        {student.compatibilityScore}%
                      </div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Match
                      </p>

                      <button
  type="button"
  onClick={() => handleRequestStudent(student.id)}
  disabled={requestedStudentIds.includes(student.id)}
  className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition ${
    requestedStudentIds.includes(student.id)
      ? "cursor-not-allowed bg-green-100 text-green-700"
      : "bg-[#0d0820] text-white hover:bg-[#1e1257]"
  }`}
>
  {requestedStudentIds.includes(student.id) ? "Request Sent" : "Contact"}
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