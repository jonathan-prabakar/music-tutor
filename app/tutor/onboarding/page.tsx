import Link from "next/link";

export default function TutorOnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] text-white flex items-center justify-center px-6">
 
      <Link
        href="/"
        className="mx-auto mb-6 block w-full max-w-xl text-sm font-medium text-white/60 transition hover:text-white"
      >
        ← Back to Home
      </Link>
     
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Tutor Onboarding
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Build your teaching profile
        </h1>

        <p className="mt-3 text-slate-500">
          This is where tutors will add their instruments, teaching style,
          student preferences, hourly rate, and background.
        </p>
      </section>
    </main>
  );
}