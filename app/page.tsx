import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0820] via-[#1e1257] to-[#2d1b69] text-white flex items-center justify-center px-6">
      <section className="w-full max-w-3xl text-center">
        <div className="mb-6 text-6xl">🎵</div>

        <h1 className="text-5xl font-bold tracking-tight">
          MusicTutor
        </h1>

        <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
          Find a music tutor that matches your skill level, goals, pace,
          and learning style.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
            <div className="text-5xl mb-4">🎓</div>

            <h2 className="text-2xl font-semibold">
              I&apos;m a Student
            </h2>

            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Discover tutors who match your instrument, experience level,
              budget, and goals.
            </p>

            <Link
              href="/student/onboarding"
              className="mt-6 inline-block rounded-full bg-yellow-500 px-6 py-3 font-semibold text-[#0d0820] transition hover:bg-yellow-400"
            >
              Find My Tutor
            </Link>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
            <div className="text-5xl mb-4">🎤</div>

            <h2 className="text-2xl font-semibold">
              I&apos;m a Tutor
            </h2>

            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Create a teaching profile and connect with students who fit
              your style.
            </p>

            <Link
              href="/tutor/onboarding"
              className="mt-6 inline-block rounded-full bg-indigo-400 px-6 py-3 font-semibold text-[#0d0820] transition hover:bg-indigo-300"
            >
              Build My Profile
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}