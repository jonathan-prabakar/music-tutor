export type Tutor = {
  id: number;
  name: string;
  avatar: string;
  instruments: string[];
  teachingStyle: "casual" | "balanced" | "focused" | "rigorous";
  preferredLevels: string[];
  rateLabel: string;
  rateTier: "low" | "mid" | "high" | "premium";
  bio: string;
  location: string;
};

export const mockTutors: Tutor[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: "🎹",
    instruments: ["piano", "vocals"],
    teachingStyle: "casual",
    preferredLevels: ["beginner", "some"],
    rateLabel: "$25/hr",
    rateTier: "low",
    bio: "Relaxed, beginner-friendly lessons focused on enjoying music while building confidence.",
    location: "Austin, TX",
  },
  {
    id: 2,
    name: "James Lee",
    avatar: "🎸",
    instruments: ["guitar", "vocals"],
    teachingStyle: "balanced",
    preferredLevels: ["beginner", "some", "intermediate"],
    rateLabel: "$40/hr",
    rateTier: "mid",
    bio: "A practical guitar teacher who mixes structure with songs students actually want to play.",
    location: "San Antonio, TX",
  },
  {
    id: 3,
    name: "Priya Kapoor",
    avatar: "🎹",
    instruments: ["piano", "violin"],
    teachingStyle: "focused",
    preferredLevels: ["some", "intermediate", "advanced"],
    rateLabel: "$65/hr",
    rateTier: "high",
    bio: "Goal-driven lessons for students who want steady progress, technique, and clear milestones.",
    location: "Dallas, TX",
  },
  {
    id: 4,
    name: "Marcus Thompson",
    avatar: "🥁",
    instruments: ["drums", "guitar"],
    teachingStyle: "balanced",
    preferredLevels: ["beginner", "some", "intermediate"],
    rateLabel: "$45/hr",
    rateTier: "mid",
    bio: "Rhythm-first teaching with a fun but consistent approach to practice and improvement.",
    location: "Houston, TX",
  },
  {
    id: 5,
    name: "Elena Rossi",
    avatar: "🎻",
    instruments: ["violin", "piano"],
    teachingStyle: "rigorous",
    preferredLevels: ["intermediate", "advanced"],
    rateLabel: "$90/hr",
    rateTier: "premium",
    bio: "Advanced classical coaching for committed students preparing for auditions or performances.",
    location: "New York, NY",
  },
];