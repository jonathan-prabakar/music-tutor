"use client";

import Link from "next/link";

export default function EmailConfirmedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">
          Email confirmed successfully.
        </h1>
        <p className="mb-6 text-slate-600">
          You can now log in.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}