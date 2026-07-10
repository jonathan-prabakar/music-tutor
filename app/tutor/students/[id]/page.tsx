"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

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

type StudentProfile = {
  name: string;
  instruments: string[];
  experience: string;
  goal: string;
};

type PracticeSession = {
  id: string;
  instrument: string;
  exerciseName: string;
  durationMinutes: number;
  difficulty: string;
  hardSections: string;
  notes: string;
  createdAt: string;
};

type Summary = {
  id: string;
  summary: string;
  createdAt: string;
};

type PrepReport = {
  id: string;
  report: string;
  createdAt: string;
};

export default function TutorStudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [matched, setMatched] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [reports, setReports] = useState<PrepReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    await getSupabase().auth.signOut();
    window.location.href = "/";
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Verify the tutor is matched with this student
      const { data: match } = await getSupabase()
        .from("accepted_matches")
        .select("id")
        .eq("tutor_id", user.id)
        .eq("student_id", studentId)
        .eq("status", "active")
        .maybeSingle();

      if (!match) {
        setMatched(false);
        setLoading(false);
        return;
      }

      setMatched(true);

      const { data: studentProfile } = await getSupabase()
        .from("student_profiles")
        .select("name, instruments, experience, goal")
        .eq("id", studentId)
        .maybeSingle();

      if (studentProfile) {
        const p = studentProfile as any;
        setProfile({
          name: p.name ?? "Student",
          instruments: p.instruments ?? [],
          experience: p.experience ?? "beginner",
          goal: p.goal ?? "fun",
        });
      }

      const { data: sessionData } = await getSupabase()
        .from("practice_sessions")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setSessions(
        ((sessionData as any[]) ?? []).map((s) => ({
          id: String(s.id),
          instrument: s.instrument,
          exerciseName: s.exercise_name,
          durationMinutes: s.duration_minutes,
          difficulty: s.difficulty,
          hardSections: s.hard_sections,
          notes: s.notes,
          createdAt: s.created_at,
        }))
      );

      const { data: summaryData } = await getSupabase()
        .from("ai_practice_summaries")
        .select("id, summary, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setSummaries(
        ((summaryData as any[]) ?? []).map((s) => ({
          id: String(s.id),
          summary: s.summary,
          createdAt: s.created_at,
        }))
      );

      await loadReports();

      setLoading(false);
    })();
  }, [studentId]);

  async function loadReports() {
    const { data: reportData } = await getSupabase()
      .from("ai_lesson_prep_reports")
      .select("id, report, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    setReports(
      ((reportData as any[]) ?? []).map((r) => ({
        id: String(r.id),
        report: r.report,
        createdAt: r.created_at,
      }))
    );
  }

  async function handleGeneratePrep() {
    setGenerating(true);
    setError("");

    try {
      const { data: { session: authSession } } =
        await getSupabase().auth.getSession();
      const token = authSession?.access_token;

      const response = await fetch("/api/lesson-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate lesson prep report");
      }

      await loadReports();
    } catch {
      setError("Could not generate a lesson prep report. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎵</div>
          <p className="text-lg text-slate-600">Loading student...</p>
        </div>
      </main>
    );
  }

  const nav = (
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
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );

  if (!matched) {
    return (
      <main className="min-h-screen bg-slate-100">
        {nav}
        <section className="mx-auto max-w-2xl px-6 py-10">
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <div className="mb-3 text-4xl">🔒</div>
            <h1 className="text-2xl font-bold text-slate-900">
              Student not available
            </h1>
            <p className="mt-3 text-slate-500">
              You can only view students you are actively matched with.
            </p>
            <Link
              href="/tutor/students"
              className="mt-6 inline-block rounded-xl bg-[#0d0820] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1257]"
            >
              Back to My Students
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {nav}

      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/tutor/students"
          className="mb-6 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          ← Back to My Students
        </Link>

        {/* Profile */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-slate-900">
            {profile?.name ?? "Student"}
          </h1>
          {profile ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.instruments.length > 0 ? (
                profile.instruments.map((instrument) => (
                  <span
                    key={instrument}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {instrumentLabels[instrument] ?? instrument}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                  No instruments listed
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {experienceLabels[profile.experience] ?? profile.experience}
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {goalLabels[profile.goal] ?? profile.goal}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              This student hasn&apos;t completed their profile yet.
            </p>
          )}
        </div>

        {/* Lesson Prep */}
        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              AI Lesson Prep Reports
            </h2>
            <button
              type="button"
              onClick={handleGeneratePrep}
              disabled={generating}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                generating
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-indigo-500 text-white hover:bg-indigo-400"
              }`}
            >
              {generating ? "Generating..." : "Generate Lesson Prep"}
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {reports.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow">
              No lesson prep reports yet. Generate one from this student&apos;s
              practice history and AI summaries.
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <article key={report.id} className="rounded-2xl bg-white p-6 shadow">
                  <p className="mb-3 text-xs text-slate-400">
                    {formatDate(report.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {report.report}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* AI Practice Summaries */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            AI Practice Summaries
          </h2>
          {summaries.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow">
              No AI practice summaries yet.
            </p>
          ) : (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <article
                  key={summary.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <p className="mb-3 text-xs text-slate-400">
                    {formatDate(summary.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {summary.summary}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Practice History */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Practice History
          </h2>
          {sessions.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow">
              This student hasn&apos;t logged any practice sessions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {session.exerciseName}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {session.instrument}
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
                    <p className="mt-1 text-sm text-slate-500">{session.notes}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(session.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
