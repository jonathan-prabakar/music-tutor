import type { Tutor } from "./mock-tutors";

export type StudentProfile = {
  name: string;
  instruments: string[];
  experience: string;
  goal: string;
};

const goalToTeachingStyle: Record<string, string[]> = {
  fun: ["casual", "balanced"],
  basics: ["casual", "balanced"],
  perform: ["balanced", "focused"],
  competitive: ["focused", "rigorous"],
};

export function calculateCompatibility(
  student: StudentProfile,
  tutor: Tutor
) {
  let score = 0;
  const reasons: string[] = [];

  const sharedInstruments = student.instruments.filter((instrument) =>
    tutor.instruments.includes(instrument)
  );

  if (sharedInstruments.length > 0) {
    score += 40;
    reasons.push(
      `Teaches ${sharedInstruments
        .map((instrument) => capitalize(instrument))
        .join(", ")}`
    );
  }

  if (tutor.preferredLevels.includes(student.experience)) {
    score += 25;
    reasons.push("Matches your experience level");
  }

  const compatibleStyles = goalToTeachingStyle[student.goal] ?? [];

  if (compatibleStyles.includes(tutor.teachingStyle)) {
    score += 25;
    reasons.push("Teaching style fits your goal");
  }

  score += 10;

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}