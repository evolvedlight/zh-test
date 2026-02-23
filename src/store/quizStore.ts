import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, createInitialProgress, type UserProgress } from '../db/db';

export interface Question {
  id: number;
  category: string;
  subcategory: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation_en: string;
  question_image: string | null;
  option_images: string[] | null;
}

export const useQuizStore = defineStore('quiz', () => {
  const questions = ref<Question[]>([]);
  const progressMap = ref<Record<number, UserProgress>>({});
  const loading = ref(true);
  const error = ref<string | null>(null);

  const init = async () => {
    loading.value = true;
    try {
      const res = await fetch('/data/questions.json');
      if (!res.ok) throw new Error('Failed to fetch questions');
      questions.value = await res.json();
      
      const allProgress = await db.progress.toArray();
      const pMap: Record<number, UserProgress> = {};
      allProgress.forEach(p => {
        pMap[p.questionId] = p;
      });
      progressMap.value = pMap;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getProgress = (id: number): UserProgress => {
    return progressMap.value[id] || createInitialProgress(id);
  };

  const toggleBookmark = async (id: number) => {
    const p = getProgress(id);
    p.bookmarked = !p.bookmarked;
    progressMap.value[id] = p;
    await db.progress.put(p);
  };

  // Simple SM-2 based Spaced Repetition update
  const recordAttempt = async (id: number, correct: boolean, mode: 'practice' | 'exam' | 'study') => {
    const p = getProgress(id);
    p.attempts += 1;
    p.lastAttemptedAt = Date.now();
    
    // Log the attempt
    await db.attemptLogs.add({
      questionId: id,
      timestamp: Date.now(),
      correct,
      mode
    });

    if (correct) {
      p.correctCount += 1;
      p.streak += 1;
      // Calculate next review (SM-2 simplified)
      if (p.streak === 1) {
        p.interval = 1;
      } else if (p.streak === 2) {
        p.interval = 6;
      } else {
        p.interval = Math.round(p.interval * p.easeFactor);
      }
      p.easeFactor = p.easeFactor + 0.1; // small bump
    } else {
      p.streak = 0;
      p.interval = 1; // review tomorrow
      p.easeFactor = Math.max(1.3, p.easeFactor - 0.2); // drop ease factor, min 1.3
    }
    
    // Calculate next review timestamp (interval in days)
    p.nextReviewAt = Date.now() + p.interval * 24 * 60 * 60 * 1000;
    
    progressMap.value[id] = p;
    await db.progress.put(p);
  };

  const dueQuestions = computed(() => {
    const now = Date.now();
    return questions.value.filter(q => {
      const p = getProgress(q.id);
      return p.attempts === 0 || p.nextReviewAt <= now;
    });
  });
  
  const weakQuestions = computed(() => {
    return questions.value.filter(q => {
      const p = getProgress(q.id);
      return p.attempts > 0 && (p.correctCount / p.attempts) < 0.6;
    });
  });

  return { 
    questions, 
    progressMap, 
    loading, 
    error, 
    init, 
    getProgress, 
    toggleBookmark, 
    recordAttempt,
    dueQuestions,
    weakQuestions
  };
});
