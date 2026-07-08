"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const instruments = [
  { id: "guitar", label: "Guitar", emoji: "🎸" },
  { id: "piano", label: "Piano", emoji: "🎹" },
  { id: "violin", label: "Violin", emoji: "🎻" },
  { id: "drums", label: "Drums", emoji: "🥁" },
  { id: "vocals", label: "Vocals", emoji: "🎤" },
  { id: "other", label: "Other", emoji: "🎵" },
];

const difficulties = ["easy", "medium", "hard"];

type PracticeSession = {
  id: number;
  studentName: string;
  instrument: string;
  exerciseName: string;
  durationMinutes: number;
  difficulty: string;
  hardSections: string;
  notes: string;
  createdAt: string;
};

export default function PracticePage() {
  const [studentName, setStudentName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [hardSections, setHardSections] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setStudentName(profile.name ?? "");
    }

    const saved = localStorage.getItem("practiceSessions");
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    const newSession: PracticeSession = {
      id: Date.now(),
      studentName,
      instrument,
      exerciseName,
      durationMinutes: Number(durationMinutes),
      difficulty,
      hardSections,
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("practiceSessions", JSON.stringify(updated));

    setInstrument("");
    setExerciseName("");
    setDurationMinutes("");
    setDifficulty("");
    setHardSections("");
    setNotes("");
    setSuccess(true);
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

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Practice Room
        </h1>
        <p className="mb-8 text-slate-500">
          Log your practice sessions and track your progress.
        </p>

        {success && (
          <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Practice session saved!
          </p>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Instrument
              </label>
              <select
                required
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              >
                <option value="">Select instrument</option>
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Exercise Name
              </label>
              <input
                type="text"
                required
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Scale Practice"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="e.g. 30"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Difficulty
              </label>
              <select
                required
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              >
                <option value="">Select difficulty</option>
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Hard Sections
              </label>
              <input
                type="text"
                value={hardSections}
                onChange={(e) => setHardSections(e.target.value)}
                placeholder="e.g. Barre chords, transitions"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you work on?"
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-[#0d0820] transition hover:bg-yellow-400"
          >
            Save Session
          </button>
        </form>

        {sessions.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Recent Practice Sessions
            </h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
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
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}