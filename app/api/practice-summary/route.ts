import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const {
    studentName,
    instrument,
    exerciseName,
    durationMinutes,
    difficulty,
    hardSections,
    notes,
    createdAt,
  } = body;

  const prompt = `You are an expert music teacher assistant. Based on this student practice log, create a concise teacher-facing summary with:
1. Overall practice summary
2. Main struggle areas
3. Recommended next lesson focus
4. Suggested homework
Keep it practical, encouraging, and under 180 words.

Student: ${studentName}
Instrument: ${instrument}
Exercise: ${exerciseName}
Duration: ${durationMinutes} minutes
Difficulty: ${difficulty}
Hard sections: ${hardSections || "None"}
Notes: ${notes || "None"}
Date: ${createdAt}`;

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
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 200,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "No summary generated.";

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}