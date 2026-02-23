import Dexie, { type Table } from 'dexie';

export interface UserProgress {
  questionId: number;
  attempts: number;
  correctCount: number;
  lastAttemptedAt: number;
  nextReviewAt: number; // For spaced repetition
  easeFactor: number;   // SM-2 parameter
  interval: number;     // SM-2 parameter (days)
  streak: number;       // Consecutive correct answers
  bookmarked: boolean;
}

export interface AttemptLog {
  id?: number;
  questionId: number;
  timestamp: number;
  correct: boolean;
  mode: 'practice' | 'exam' | 'study';
}

export class QuizDatabase extends Dexie {
  progress!: Table<UserProgress, number>;
  attemptLogs!: Table<AttemptLog, number>;

  constructor() {
    super('SwissQuizDB');
    this.version(1).stores({
      progress: 'questionId, nextReviewAt, bookmarked, correctCount, attempts', // Primary key and indexed props
      attemptLogs: '++id, questionId, timestamp, mode, correct'
    });
  }
}

export const db = new QuizDatabase();

// Utility: Initial progress record
export function createInitialProgress(questionId: number): UserProgress {
  return {
    questionId,
    attempts: 0,
    correctCount: 0,
    lastAttemptedAt: 0,
    nextReviewAt: 0,
    easeFactor: 2.5,
    interval: 0,
    streak: 0,
    bookmarked: false
  };
}
