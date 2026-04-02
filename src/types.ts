export interface Question {
  id: string;
  pointValue: number;
  questionText: string;
  choices: string[];       // 4 choices (A, B, C, D)
  correctChoice: number;   // index 0-3 of the correct choice
  answer: string;          // text of the correct answer (auto-set from choices[correctChoice])
  imageUrl?: string;
  isDailyDouble?: boolean; // deprecated, kept for backward compat
  isRevealed: boolean;
  answeredBy?: string;
  answeredCorrectly?: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Round {
  id: string;
  name: string;
  type: 'standard' | 'final';
  categories: Category[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface Game {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  rounds: Round[];
  teams: Team[];
  timerSeconds: number;
  currentRound: number;
  soundEnabled: boolean;
}
