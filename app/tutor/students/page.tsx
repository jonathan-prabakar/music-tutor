"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

type StudentRow = {
  studentId: string;
  name: string;
  instruments: string[];
  experience: string;
  goal: string;
  matchedAt: string;
};

export default function TutorStudentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentRow[]>([]);
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
      setLoading(false);

      const { data: matches, error: matchError } = await getSupabase()
        .from("accepted_matches")
        .select("student_id, created_at")
        .eq("tutor_id", user.id)
        .eq("status", "active");

      if (matchError) {
        setError("Could not load your matched students from the server.");
        return;
      }

      const roster: StudentRow[] = [];
      for (const match of (matches as any[]) ?? []) {
        if (!match.student_id) continue;

        const { data: studentProfile } = await getSupabase()
          .from("student_profiles")
          .select("name, instruments, experience, goal")
          .eq("id", match.student_id)
          .maybeSingle();

        const p = (studentProfile as any) ?? {};
        roster.push({
          studentId: match.student_id,
          name: p.name ?? "Student",
          instruments: p.instruments ?? [],
          experience: p.experience ?? "beginner",
          goal: p.goal ?? "fun",
          matchedAt: match.created_at,
        });
      }

      setStudents(roster);
    })();
  }, []);

  function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎵</div>
          <p className="text-lg text-slate-600">Loading your students...</p>
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

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">My Students</h1>
        <p className="mb-8 text-slate-500">
          Students you have matched with. Click a student to see their practice
          history and generate lesson prep.
        </p>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {students.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <div className="mb-3 text-4xl">🎓</div>
            <p className="text-slate-500">
              No matched students yet. Accept a lesson request from your
              dashboard to start building your roster.
            </p>
            <Link
              href="/tutor/dashboard"
              className="mt-4 inline-block rounded-xl bg-[#0d0820] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1257]"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <Link
                key={student.studentId}
                href={`/tutor/students/${student.studentId}`}
                className="block rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {student.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {student.instruments.length > 0 ? (
                        student.instruments.map((instrument) => (
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
                        {experienceLabels[student.experience] ??
                          student.experience}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {goalLabels[student.goal] ?? student.goal}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Matched on {formatDate(student.matchedAt)}
                    </p>
                  </div>
                  <span className="self-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
