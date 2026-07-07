"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentMatchesPage() {
  const [acceptedMatches, setAcceptedMatches] = useState<
    {
      id: number;
      studentName: string;
      studentInstruments: string[];
      studentExperience: string;
      studentGoal: string;
      status: string;
      createdAt: string;
    }[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem("lessonRequests");
    if (saved) {
      const all = JSON.parse(saved);
      const accepted = all.filter(
        (req: { status: string }) => req.status === "accepted"
      );
      setAcceptedMatches(accepted);
    }
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="bg-[#0d0820] px-6 py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-bold">
            🎵 MusicTutor
          </Link>
          <Link
            href="/student/dashboard"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          My Accepted Matches
        </h1>
        <p className="mb-8 text-slate-500">
          Tutors who have accepted your lesson requests.
        </p>

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
                      {match.studentName}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {match.studentInstruments.join(", ")}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {match.studentExperience}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {match.studentGoal}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Requested on {formatDate(match.createdAt)}
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