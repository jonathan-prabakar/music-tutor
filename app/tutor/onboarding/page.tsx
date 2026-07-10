"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

const instruments = [
  { id: "guitar", label: "Guitar", emoji: "🎸" },
  { id: "piano", label: "Piano", emoji: "🎹" },
  { id: "violin", label: "Violin", emoji: "🎻" },
  { id: "drums", label: "Drums", emoji: "🥁" },
  { id: "vocals", label: "Vocals", emoji: "🎤" },
  { id: "other", label: "Other", emoji: "🎵" },
];

const teachingStyles = [
  {
    id: "casual",
    emoji: "😊",
    label: "Casual & Fun",
    description: "Relaxed lessons focused on enjoyment and confidence.",
  },
  {
    id: "balanced",
    emoji: "⚖️",
    label: "Balanced",
    description: "A mix of structure, progress, and fun.",
  },
  {
    id: "focused",
    emoji: "🎯",
    label: "Focused & Structured",
    description: "Goal-oriented lessons with clear milestones.",
  },
  {
    id: "rigorous",
    emoji: "🏆",
    label: "Rigorous & Professional",
    description: "High standards for serious students.",
  },
];

const studentPreferences = [
  {
    id: "beginners",
    emoji: "🌱",
    label: "Beginners",
    description: "I enjoy teaching students from scratch.",
  },
  {
    id: "all",
    emoji: "🌍",
    label: "All Levels",
    description: "I am comfortable teaching any skill level.",
  },
  {
    id: "intermediate",
    emoji: "🎯",
    label: "Intermediate+",
    description: "I prefer students with some foundation.",
  },
  {
    id: "advanced",
    emoji: "⭐",
    label: "Advanced Only",
    description: "I prefer serious, high-level students.",
  },
];

export default function TutorOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [teachingStyle, setTeachingStyle] = useState("");
  const [studentPreference, setStudentPreference] = useState("");

  function toggleInstrument(instrumentId: string) {
    setSelectedInstruments((current) => {
      if (current.includes(instrumentId)) {
        return current.filter((id) => id !== instrumentId);
      }

      return [...current, instrumentId];
    });
  }

  const [error, setError] = useState<string | null>(null);

  async function handleFinishOnboarding() {
    setError(null);

    const tutorProfile = {
      name,
      instruments: selectedInstruments,
      teachingStyle,
      studentPreference,
    };

    localStorage.setItem("tutorProfile", JSON.stringify(tutorProfile));

  const { data: { user }, error: userError } = await getSupabase().auth.getUser();

  if (userError || !user) {
    router.push("/login");
    return;
  }

  if (!user.email) {
    setError("User email is required");
    return;
  }

  const { error: profileError } = await getSupabase()
    .from("profiles")
    .upsert({ id: user.id, email: user.email, role: "tutor" } as any);

    if (profileError) {
      setError(profileError.message);
      return;
    }

  const { error: tutorProfileError } = await getSupabase()
    .from("tutor_profiles")
    .upsert({
      id: user.id,
      name,
      instruments: selectedInstruments,
      teaching_style: teachingStyle,
      student_preference: studentPreference,
    } as any);

    if (tutorProfileError) {
      setError(tutorProfileError.message);
      return;
    }

    router.push("/tutor/dashboard");
  }

  const canContinueFromStepOne =
    name.trim().length > 0 && selectedInstruments.length > 0;

  const canContinueFromStepTwo = teachingStyle.length > 0;

  const canFinish = studentPreference.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] px-6 py-10 text-white">
      <Link
        href="/"
        className="mx-auto mb-6 block w-full max-w-2xl text-sm text-white/70 transition hover:text-white"
      >
        ← Back to Home
      </Link>

      <section className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Tutor Onboarding
            </p>

            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-400">Step {step} of 3</p>
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold">
                Build your teaching profile
              </h1>

              <p className="mt-3 text-slate-500">
                Start by telling students your name and what instruments you
                teach.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="tutor-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Your name
                  </label>

                  <input
                    id="tutor-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Maria"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">
                    What instruments do you teach?
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
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-200 bg-white hover:border-indigo-300"
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
                      ? "bg-indigo-500 text-white hover:bg-indigo-400"
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
                What is your teaching style?
              </h1>

              <p className="mt-3 text-slate-500">
                This helps students understand what learning with you feels
                like.
              </p>

              <div className="mt-8 space-y-3">
                {teachingStyles.map((style) => {
                  const isSelected = teachingStyle === style.id;

                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTeachingStyle(style.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <span className="text-3xl">{style.emoji}</span>

                      <span>
                        <span className="block font-semibold text-slate-900">
                          {style.label}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {style.description}
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
                      ? "bg-indigo-500 text-white hover:bg-indigo-400"
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
                What students do you prefer teaching?
              </h1>

              <p className="mt-3 text-slate-500">
                This helps us match you with students who fit your teaching
                strengths.
              </p>

              <div className="mt-8 space-y-3">
                {studentPreferences.map((preference) => {
                  const isSelected = studentPreference === preference.id;

                  return (
                    <button
                      key={preference.id}
                      type="button"
                      onClick={() => setStudentPreference(preference.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <span className="text-3xl">{preference.emoji}</span>

                      <span>
                        <span className="block font-semibold text-slate-900">
                          {preference.label}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {preference.description}
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

                {error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canFinish}
                  onClick={handleFinishOnboarding}
                  className={`w-2/3 rounded-xl px-5 py-3 font-semibold transition ${
                    canFinish
                      ? "bg-indigo-500 text-white hover:bg-indigo-400"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  See My Students
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}