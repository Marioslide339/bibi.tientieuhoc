export interface ParentStats {
  lessonsCompleted: number;
  totalSpokenCorrect: number;
  totalFightsWon: number; // For quizzes
  totalStars: number;
  timeSpentMinutes: number; // simulated
  badges: string[];
  moduleProficiency: {
    letters: number; // percentage 0-100
    math: number;
    language: number;
    logic: number;
    world: number;
    art: number;
    music: number;
  };
  recentActivities: {
    timestamp: string;
    description: string;
    starsEarned: number;
  }[];
}

export interface QuizQuestion {
  id: string;
  module: "letters" | "math" | "language" | "logic" | "world";
  type: "multiple-choice" | "drag-drop" | "match" | "count" | "find";
  question: string;
  image?: string;
  audioText?: string;
  options: string[];
  correctAnswer: string; // or matching mappings
  pairs?: { left: string; right: string }[]; // For match type questions
}

export interface CharacterItem {
  id: string;
  name: string;
  image?: string;
  description: string;
  emoji: string;
  unlockedAtStars: number;
}

export type ActiveModule =
  | "home"
  | "letters"
  | "math"
  | "language"
  | "logic"
  | "world"
  | "coloring"
  | "music"
  | "exam"
  | "achievements"
  | "parents";
