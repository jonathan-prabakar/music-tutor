import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  // Require an authenticated tutor
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const accessToken = authHeader.slice(7);
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { studentId } = body;

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 }
    );
  }

  // Verify the tutor has an accepted match with this student
  const { data: match } = await supabase
    .from("accepted_matches")
    .select("id")
    .eq("tutor_id", user.id)
    .eq("student_id", studentId)
    .eq("status", "active")
    .maybeSingle();

  if (!match) {
    return NextResponse.json(
      { error: "You are not matched with this student" },
      { status: 403 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    );
  }

  // Gather student context: profile, recent practice sessions, AI summaries
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("name, instruments, experience, goal")
    .eq("id", studentId)
    .maybeSingle();

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: summaries } = await supabase
    .from("ai_practice_summaries")
    .select("summary, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(10);

  const profile = (studentProfile as any) ?? {};
  const sessionList = (sessions as any[]) ?? [];
  const summaryList = (summaries as any[]) ?? [];

  const sessionsText = sessionList.length
    ? sessionList
        .map(
          (s, i) =>
            `${i + 1}. ${s.exercise_name ?? "Exercise"} (${s.instrument ?? "instrument"}, ${s.duration_minutes ?? "?"} min, difficulty: ${s.difficulty ?? "?"})` +
            `${s.hard_sections ? ` — hard sections: ${s.hard_sections}` : ""}` +
            `${s.notes ? ` — notes: ${s.notes}` : ""}`
        )
        .join("\n")
    : "No practice sessions logged yet.";

  const summariesText = summaryList.length
    ? summaryList.map((s, i) => `${i + 1}. ${s.summary}`).join("\n\n")
    : "No AI practice summaries yet.";

  const prompt = `You are an expert music teacher assistant helping a tutor prepare for their next lesson with a student. Using the student profile, recent practice sessions, and prior AI practice summaries below, produce a clear tutor-facing lesson prep report with these sections, each clearly labeled:

1. Progress Summary
2. Recurring Struggles
3. Next Lesson Plan
4. Suggested Exercises
5. Homework
6. Encouragement Note

Be practical, specific, and encouraging. Keep it under 350 words.

STUDENT PROFILE
Name: ${profile.name ?? "Student"}
Instruments: ${(profile.instruments ?? []).join(", ") || "Unknown"}
Experience: ${profile.experience ?? "Unknown"}
Goal: ${profile.goal ?? "Unknown"}

RECENT PRACTICE SESSIONS
${sessionsText}

PRIOR AI PRACTICE SUMMARIES
${summariesText}`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "MusicTutor",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 600,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const data = await response.json();
    const report =
      data.choices?.[0]?.message?.content || "No lesson prep report generated.";

    // Persist the report
    const { error: insertError } = await supabase
      .from("ai_lesson_prep_reports")
      .insert({
        student_id: studentId,
        tutor_id: user.id,
        report,
        model: "openai/gpt-4o-mini",
      });

    if (insertError) {
      return NextResponse.json({
        report,
        warning: "Report generated but not saved to database",
      });
    }

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate lesson prep report" },
      { status: 500 }
    );
  }
}
