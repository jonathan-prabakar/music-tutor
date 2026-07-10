"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function StudentMatchesPage() {
  const router = useRouter();
  const [acceptedMatches, setAcceptedMatches] = useState<
    {
      id: number | string;
      tutorName: string;
      tutorInstruments: string[];
      tutorTeachingStyle: string;
      tutorStudentPreference: string;
      status: string;
      createdAt: string;
    }[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

      // Read accepted matches from accepted_matches table
      const { data: matches, error: readError } = await getSupabase()
        .from("accepted_matches")
        .select("id, tutor_id, status, created_at")
        .eq("student_id", user.id)
        .eq("status", "active");

      if (readError) {
        setError("Could not load your matches from the server. Showing local data.");
      }

      // Get tutor profiles for the matches
      const supabaseAccepted: typeof acceptedMatches = [];
      if (matches && matches.length > 0) {
        for (const match of matches as any[]) {
          const { data: tutor } = await getSupabase()
            .from("tutor_profiles")
            .select("name, instruments, teaching_style, student_preference")
            .eq("id", match.tutor_id)
            .single();

          supabaseAccepted.push({
            id: match.id,
            tutorName: (tutor as any)?.name ?? "Tutor",
            tutorInstruments: (tutor as any)?.instruments ?? [],
            tutorTeachingStyle: (tutor as any)?.teaching_style ?? "balanced",
            tutorStudentPreference: (tutor as any)?.student_preference ?? "all",
            status: match.status,
            createdAt: match.created_at,
          });
        }
      }

      // Merge in localStorage accepted requests as fallback for demo cards
      let localAccepted: typeof supabaseAccepted = [];
      try {
        const saved = localStorage.getItem("lessonRequests");
        if (saved) {
          const parsed = JSON.parse(saved).filter(
            (req: { status: string }) => req.status === "accepted"
          );
          // Convert to match the new format
          localAccepted = parsed.map((req: any) => ({
            id: req.id,
            tutorName: req.tutorName ?? "Tutor",
            tutorInstruments: req.tutorInstruments ?? [],
            tutorTeachingStyle: req.tutorTeachingStyle ?? "balanced",
            tutorStudentPreference: req.tutorStudentPreference ?? "all",
            status: req.status,
            createdAt: req.createdAt,
          }));
        }
      } catch {
        // Ignore malformed localStorage data
      }

      setAcceptedMatches([...supabaseAccepted, ...localAccepted]);
    })();
  }, []);

  function formatDate(iso: string) {
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
          <p className="text-lg text-slate-600">Loading your matches...</p>
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
              href="/student/dashboard"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/student/practice"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              Practice Room
            </Link>
            <Link
              href="/student/matches"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
            >
              My Matches
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
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          My Accepted Matches
        </h1>
        <p className="mb-8 text-slate-500">
          Tutors who have accepted your lesson requests.
        </p>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {acceptedMatches.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-slate-500">
              No accepted matches yet. Keep requesting tutors from your dashboard!
            </p>
            <Link
              href="/student/dashboard"
              className="mt-4 inline-block rounded-xl bg-[#0d0820] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1257]"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptedMatches.map((match) => (
              <article
                key={match.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {match.tutorName}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {match.tutorInstruments.join(", ")}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {match.tutorTeachingStyle}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {match.tutorStudentPreference}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Matched on {formatDate(match.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">
                    {match.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}