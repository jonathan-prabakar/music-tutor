import type { MockStudent } from "./mock-students";

export type TutorProfile = {
  name: string;
  instruments: string[];
  teachingStyle: string;
  studentPreference: string;
};

const studentPreferenceToLevels: Record<string, string[]> = {
  beginners: ["beginner"],
  all: ["beginner", "some", "intermediate", "advanced"],
  intermediate: ["some", "intermediate", "advanced"],
  advanced: ["advanced"],
};

const teachingStyleToGoals: Record<string, string[]> = {
  casual: ["fun", "basics"],
  balanced: ["fun", "basics", "perform"],
  focused: ["basics", "perform", "competitive"],
  rigorous: ["competitive", "perform"],
};

export function calculateStudentCompatibility(
  tutor: TutorProfile,
  student: MockStudent
) {
  let score = 0;
  const reasons: string[] = [];

  const sharedInstruments = student.instruments.filter((instrument) =>
    tutor.instruments.includes(instrument)
  );

  if (sharedInstruments.length > 0) {
    score += 40;
    reasons.push(
      `Wants ${sharedInstruments
        .map((instrument) => capitalize(instrument))
        .join(", ")} lessons`
    );
  }

  const preferredLevels =
    studentPreferenceToLevels[tutor.studentPreference] ?? [];

  if (preferredLevels.includes(student.experience)) {
    score += 30;
    reasons.push("Fits your preferred student level");
  }

  const compatibleGoals = teachingStyleToGoals[tutor.teachingStyle] ?? [];

  if (compatibleGoals.includes(student.goal)) {
    score += 20;
    reasons.push("Goal fits your teaching style");
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