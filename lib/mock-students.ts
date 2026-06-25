export type MockStudent = {
  id: number;
  name: string;
  avatar: string;
  instruments: string[];
  experience: "beginner" | "some" | "intermediate" | "advanced";
  goal: "fun" | "basics" | "perform" | "competitive";
  bio: string;
};

export const mockStudents: MockStudent[] = [
  {
    id: 1,
    name: "Alex K.",
    avatar: "🎸",
    instruments: ["guitar"],
    experience: "beginner",
    goal: "fun",
    bio: "Wants to learn guitar casually and play favorite songs for fun.",
  },
  {
    id: 2,
    name: "Maya R.",
    avatar: "🎹",
    instruments: ["piano"],
    experience: "some",
    goal: "basics",
    bio: "Knows a few piano basics and wants structured lessons to build confidence.",
  },
  {
    id: 3,
    name: "Jordan T.",
    avatar: "🥁",
    instruments: ["drums"],
    experience: "intermediate",
    goal: "perform",
    bio: "Wants to improve timing, rhythm, and confidence for live performance.",
  },
  {
    id: 4,
    name: "Sam W.",
    avatar: "🎻",
    instruments: ["violin"],
    experience: "advanced",
    goal: "competitive",
    bio: "Preparing for auditions and looking for serious technical coaching.",
  },
  {
    id: 5,
    name: "Casey M.",
    avatar: "🎤",
    instruments: ["vocals"],
    experience: "beginner",
    goal: "fun",
    bio: "Wants a supportive vocal coach to learn singing without pressure.",
  },
];