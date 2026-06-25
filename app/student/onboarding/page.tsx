
"use client";
import Link from "next/link";

import { useState } from "react";

const instruments = [
  { id: "guitar", label: "Guitar", emoji: "🎸" },
  { id: "piano", label: "Piano", emoji: "🎹" },
  { id: "violin", label: "Violin", emoji: "🎻" },
  { id: "drums", label: "Drums", emoji: "🥁" },
  { id: "vocals", label: "Vocals", emoji: "🎤" },
  { id: "other", label: "Other", emoji: "🎵" },
];

export default function StudentOnboardingPage() {
  const [name, setName] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  function toggleInstrument(instrumentId: string) {
    setSelectedInstruments((current) => {
      if (current.includes(instrumentId)) {
        return current.filter((id) => id !== instrumentId);
      }

      return [...current, instrumentId];
    });
  }

  const canContinue = name.trim().length > 0 && selectedInstruments.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] px-6 py-10 text-white">
        <Link
  href="/"
  className="mx-auto mb-6 block w-full max-w-2xl text-sm font-medium text-white/60 transition hover:text-white"
>
  ← Back to Home
</Link>
      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">
              Student Onboarding
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Let&apos;s find your perfect tutor
            </h1>

            <p className="mt-3 text-slate-500">
              Start by telling us your name and what instrument you want to learn.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="student-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Your name
              </label>

              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Jordan"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">
                What instrument do you want to learn?
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {instruments.map((instrument) => {
                  const isSelected = selectedInstruments.includes(instrument.id);

                  return (
                    <button
                      key={instrument.id}
                      type="button"
                      onClick={() => toggleInstrument(instrument.id)}
                      className={`rounded-xl border p-4 text-center transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-slate-200 bg-white hover:border-yellow-300"
                      }`}
                    >
                      <div className="text-3xl">{instrument.emoji}</div>
                      <div className="mt-2 text-sm font-semibold">
                        {instrument.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={!canContinue}
              className={`w-full rounded-xl px-5 py-3 font-semibold transition ${
                canContinue
                  ? "bg-yellow-500 text-[#0d0820] hover:bg-yellow-400"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}