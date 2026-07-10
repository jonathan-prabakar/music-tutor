"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TutorProfile | null>(null);

  const [requestedStudentIds, setRequestedStudentIds] = useState<number[]>([]);
  const [lessonRequests, setLessonRequests] = useState<
    {
      id: number;
      tutorId: number;
      studentId?: string;
      studentName: string;
      studentInstruments: string[];
      studentExperience: string;
      studentGoal: string;
      status: string;
      createdAt: string;
      source: "supabase" | "localStorage";
    }[]
  >([]);
  const [practiceSessions, setPracticeSessions] = useState<
    {
      id: string;
      studentId?: string;
      studentName: string;
      instrument: string;
      exerciseName: string;
      durationMinutes: number;
      difficulty: string;
      hardSections: string;
      notes: string;
      createdAt: string;
    }[]
  >([]);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>({});
  const [matchedStudentIds, setMatchedStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Supabase lesson requests
      const { data: supabaseRequests } = await getSupabase()
        .from("lesson_requests")
        .select("*")
        .eq("tutor_id", user.id);

      // Load localStorage requests
      const savedLessonRequests = localStorage.getItem("lessonRequests");
      const localRequests = savedLessonRequests
        ? JSON.parse(savedLessonRequests).map((req: any) => ({
            ...req,
            source: "localStorage" as const
          }))
        : [];

      // Convert Supabase requests to display format
      const supabaseFormatted = (supabaseRequests ?? []).map((req: any) => ({
        id: req.id,
        tutorId: req.tutor_id,
        studentId: req.student_id,
        studentName: req.student_name ?? "Student",
        studentInstruments: req.student_instruments ?? [],
        studentExperience: req.student_experience ?? "beginner",
        studentGoal: req.student_goal ?? "fun",
        status: req.status,
        createdAt: req.created_at,
        source: "supabase" as const
      }));

      // Merge and set
      setLessonRequests([...supabaseFormatted, ...localRequests]);
    })();
    const savedProfile = localStorage.getItem("tutorProfile");
    const savedRequests = localStorage.getItem("requestedStudentIds");

    if (savedRequests) {
      setRequestedStudentIds(JSON.parse(savedRequests));
    }

    // Hydrate saved AI summaries
    try {
      const savedSummaries = localStorage.getItem("practiceAISummaries");
      if (savedSummaries) {
        setSummaries(JSON.parse(savedSummaries));
      }
    } catch {
      // Ignore malformed summary cache
    }

    // Fetch practice sessions from Supabase (filtered by matched students)
    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (user) {
        // First get accepted matches to know which students to show
        const { data: matches } = await getSupabase()
          .from("accepted_matches")
          .select("student_id")
          .eq("tutor_id", user.id)
          .eq("status", "active");

        const studentIds = new Set(
          (matches as any[] ?? []).map((m) => m.student_id).filter(Boolean)
        );

        if (studentIds.size > 0) {
          // Filter practice sessions by matched students
          const { data: supabaseSessions } = await getSupabase()
            .from("practice_sessions")
            .select("*")
            .in("student_id", Array.from(studentIds))
            .order("created_at", { ascending: false });

          if (supabaseSessions && supabaseSessions.length > 0) {
            const formatted = supabaseSessions.map((s: any) => ({
              id: s.id,
              studentId: s.student_id,
              studentName: s.student_name,
              instrument: s.instrument,
              exerciseName: s.exercise_name,
              durationMinutes: s.duration_minutes,
              difficulty: s.difficulty,
              hardSections: s.hard_sections,
              notes: s.notes,
              createdAt: s.created_at,
            }));
            setPracticeSessions(formatted);
            return;
          }
        }
      }

      // Fallback to localStorage
      const savedPracticeSessions = localStorage.getItem("practiceSessions");
      if (savedPracticeSessions) {
        const parsed = JSON.parse(savedPracticeSessions);
        // Convert numeric IDs to strings for consistency
        const formatted = parsed.map((s: any) => ({
          ...s,
          id: String(s.id),
        }));
        setPracticeSessions(formatted);
      }
    })();

    // Fetch existing AI summaries from Supabase
    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (user) {
        const { data: supabaseSummaries } = await getSupabase()
          .from("ai_practice_summaries")
          .select("practice_session_id, summary")
          .eq("tutor_id", user.id);

        if (supabaseSummaries) {
          const summariesMap: Record<string, string> = {};
          for (const s of supabaseSummaries as any[]) {
            if (s.practice_session_id) {
              summariesMap[s.practice_session_id] = s.summary;
            }
          }
          setSummaries((prev) => ({ ...prev, ...summariesMap }));
        }
      }
    })();

    // Fetch accepted matches for current tutor
    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (user) {
        const { data: matches } = await getSupabase()
          .from("accepted_matches")
          .select("student_id")
          .eq("tutor_id", user.id)
          .eq("status", "active");

        if (matches) {
          const studentIds = new Set(
            (matches as any[]).map((m) => m.student_id).filter(Boolean)
          );
          setMatchedStudentIds(studentIds);
        }
      }
    })();

    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();

      if (user) {
        const { data: tutorData } = await getSupabase()
          .from("tutor_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (tutorData) {
          const data = tutorData as any;
          setProfile({
            name: data.name ?? "Tutor",
            instruments: data.instruments ?? [],
            teachingStyle: data.teaching_style ?? "balanced",
            studentPreference: data.student_preference ?? "all",
          });
          return;
        }
      }

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    })();
  }, []);

  async function handleAcceptRequest(id: number) {
    setLessonRequests((current) => {
      const request = current.find((req) => req.id === id);
      if (!request) return current;

      const updated = current.map((req) =>
        req.id === id ? { ...req, status: "accepted" } : req
      );

      // Update Supabase if from Supabase
      if (request.source === "supabase") {
        (getSupabase()
          .from("lesson_requests") as any).update({ status: "accepted" }).eq("id", id);

        // Also upsert to accepted_matches
        (getSupabase() as any).from("accepted_matches").upsert({
          student_id: request.studentId,
          tutor_id: request.tutorId,
          status: "active",
        }, { onConflict: "student_id, tutor_id" });
      } else {
        // Update localStorage if from localStorage
        const localRequests = updated.filter((req) => req.source === "localStorage");
        localStorage.setItem("lessonRequests", JSON.stringify(localRequests));
      }

      return updated;
    });
  }

  async function handleDeclineRequest(id: number) {
    setLessonRequests((current) => {
      const request = current.find((req) => req.id === id);
      if (!request) return current;

      const updated = current.map((req) =>
        req.id === id ? { ...req, status: "declined" } : req
      );

      // Update Supabase if from Supabase
      if (request.source === "supabase") {
        (getSupabase()
          .from("lesson_requests") as any).update({ status: "declined" }).eq("id", id);
      } else {
        // Update localStorage if from localStorage
        const localRequests = updated.filter((req) => req.source === "localStorage");
        localStorage.setItem("lessonRequests", JSON.stringify(localRequests));
      }

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

  async function handleGenerateSummary(session: typeof practiceSessions[0]) {
    setSummaryLoading((prev) => ({ ...prev, [session.id]: true }));

    try {
      // Get auth session for token
      const { data: { session: authSession } } = await getSupabase().auth.getSession();
      const token = authSession?.access_token;

      const response = await fetch("/api/practice-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...session,
          practiceSessionId: session.id,
          studentId: session.studentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummaries((prev) => {
        const next = { ...prev, [session.id]: data.summary };
        try {
          localStorage.setItem("practiceAISummaries", JSON.stringify(next));
        } catch {
          // Ignore write failures (e.g. storage full)
        }
        return next;
      });
    } catch (error) {
      setSummaries((prev) => ({
        ...prev,
        [session.id]: "Could not generate summary. Please try again.",
      }));
    } finally {
      setSummaryLoading((prev) => ({ ...prev, [session.id]: false }));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎵</div>
          <p className="text-lg text-slate-600">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow">
          <div className="mb-4 text-5xl">🎤</div>
          <h1 className="text-2xl font-bold text-slate-900">
            No tutor profile found
          </h1>
          <p className="mt-3 text-slate-500">
            Complete tutor onboarding first so we can show student matches.
          </p>
          <Link
            href="/tutor/onboarding"
            className="mt-6 inline-block rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
          >
            Get Started
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
              href="/"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/tutor/dashboard"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/tutor/students"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Students
            </Link>
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

        {/* Manage Students CTA */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your Student Roster
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View matched students, their practice history, and generate AI
              lesson prep.
            </p>
          </div>
          <Link
            href="/tutor/students"
            className="rounded-xl bg-[#0d0820] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1257]"
          >
            Manage Students
          </Link>
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

        {/* Recent Practice Reports */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Recent Practice Reports
          </h2>

          {practiceSessions.length === 0 ? (
            <p className="text-sm text-slate-500">No practice reports yet.</p>
          ) : (
            <div className="space-y-4">
              {[...practiceSessions]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
                .map((session) => (
                  <article
                    key={session.id}
                    className="rounded-2xl bg-white p-6 shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">
                          {session.studentName}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {session.instrument}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {session.exerciseName}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {session.durationMinutes} min
                          </span>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {session.difficulty}
                          </span>
                        </div>

                        {session.hardSections && (
                          <p className="mt-2 text-sm text-slate-600">
                            <span className="font-medium">Hard sections:</span>{" "}
                            {session.hardSections}
                          </p>
                        )}

                        {session.notes && (
                          <p className="mt-1 text-sm text-slate-500">
                            {session.notes}
                          </p>
                        )}

                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(session.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    <div className="mt-4">
                      {summaries[session.id] && (
                        <div className="mb-3 rounded-lg bg-indigo-50 p-4">
                          <p className="text-sm text-slate-700">
                            {summaries[session.id]}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleGenerateSummary(session)}
                        disabled={summaryLoading[session.id]}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          summaryLoading[session.id]
                            ? "cursor-not-allowed bg-slate-200 text-slate-400"
                            : "bg-indigo-500 text-white hover:bg-indigo-400"
                        }`}
                      >
                        {summaryLoading[session.id]
                          ? "Generating..."
                          : summaries[session.id]
                          ? "Regenerate AI Summary"
                          : "Generate AI Summary"}
                      </button>
                    </div>
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
                        {requestedStudentIds.includes(student.id)
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