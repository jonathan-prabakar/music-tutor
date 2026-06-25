
export default function StudentOnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] text-white flex items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">
          Student Onboarding
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Let&apos;s find your perfect tutor
        </h1>

        <p className="mt-3 text-slate-500">
          This is where students will answer questions about their instrument,
          experience level, goals, practice time, pace, and budget.
        </p>
      </section>
    </main>
  );
}
