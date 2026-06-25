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

const experienceLevels = [
  {
    id: "beginner",
    emoji: "🌱",
    label: "Complete Beginner",
    description: "I have little to no experience.",
  },
  {
    id: "some",
    emoji: "📚",
    label: "Some Experience",
    description: "I know the basics but still need guidance.",
  },
  {
    id: "intermediate",
    emoji: "🎯",
    label: "Intermediate",
    description: "I can play already and want to improve.",
  },
  {
    id: "advanced",
    emoji: "⭐",
    label: "Advanced",
    description: "I am experienced and want expert coaching.",
  },
];

const goals = [
  {
    id: "fun",
    emoji: "😄",
    label: "Just for fun",
    description: "I want a relaxed experience and to enjoy music.",
  },
  {
    id: "basics",
    emoji: "📖",
    label: "Learn the basics",
    description: "I want to build a strong foundation.",
  },
  {
    id: "perform",
    emoji: "🎭",
    label: "Perform someday",
    description: "I want to play at events, open mics, or recitals.",
  },
  {
    id: "competitive",
    emoji: "🏆",
    label: "Competitive or professional",
    description: "I want serious coaching for auditions or competitions.",
  },
];

export default function StudentOnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");

  function toggleInstrument(instrumentId: string) {
    setSelectedInstruments((current) => {
      if (current.includes(instrumentId)) {
        return current.filter((id) => id !== instrumentId);
      }

      return [...current, instrumentId];
    });
  }

  const canContinueFromStepOne =
    name.trim().length > 0 && selectedInstruments.length > 0;

  const canContinueFromStepTwo = experience.length > 0;

  const canFinish = goal.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] px-6 py-10 text-white">
      <Link
        href="/"
        className="mx-auto mb-6 block w-full max-w-2xl text-sm text-white/60 transition hover:text-white"
      >
        ← Back to Home
      </Link>

      <section className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">
              Student Onboarding
            </p>

            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-yellow-500 transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-400">Step {step} of 3</p>
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold">
                Let&apos;s find your perfect tutor
              </h1>

              <p className="mt-3 text-slate-500">
                Start by telling us your name and what instrument you want to
                learn.
              </p>

              <div className="mt-8 space-y-6">
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
                      const isSelected = selectedInstruments.includes(
                        instrument.id
                      );

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
                  disabled={!canContinueFromStepOne}
                  onClick={() => setStep(2)}
                  className={`w-full rounded-xl px-5 py-3 font-semibold transition ${
                    canContinueFromStepOne
                      ? "bg-yellow-500 text-[#0d0820] hover:bg-yellow-400"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold">
                What is your current experience level?
              </h1>

              <p className="mt-3 text-slate-500">
                This helps us match you with a tutor who teaches at the right
                pace.
              </p>

              <div className="mt-8 space-y-3">
                {experienceLevels.map((level) => {
                  const isSelected = experience === level.id;

                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setExperience(level.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-slate-200 bg-white hover:border-yellow-300"
                      }`}
                    >
                      <span className="text-3xl">{level.emoji}</span>

                      <span>
                        <span className="block font-semibold text-slate-900">
                          {level.label}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {level.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={!canContinueFromStepTwo}
                  onClick={() => setStep(3)}
                  className={`w-2/3 rounded-xl px-5 py-3 font-semibold transition ${
                    canContinueFromStepTwo
                      ? "bg-yellow-500 text-[#0d0820] hover:bg-yellow-400"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-3xl font-bold">
                What is your main learning goal?
              </h1>

              <p className="mt-3 text-slate-500">
                Your goal helps us match you with a tutor who has the right
                teaching style.
              </p>

              <div className="mt-8 space-y-3">
                {goals.map((item) => {
                  const isSelected = goal === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-slate-200 bg-white hover:border-yellow-300"
                      }`}
                    >
                      <span className="text-3xl">{item.emoji}</span>

                      <span>
                        <span className="block font-semibold text-slate-900">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={!canFinish}
                  className={`w-2/3 rounded-xl px-5 py-3 font-semibold transition ${
                    canFinish
                      ? "bg-yellow-500 text-[#0d0820] hover:bg-yellow-400"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  See My Matches
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}