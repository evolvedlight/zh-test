<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from '../store/quizStore'
import { useRouter } from 'vue-router'

const store = useQuizStore()
const router = useRouter()

const stats = computed(() => {
  let totalAttempts = 0
  let totalCorrect = 0
  let bookmarkedIds: number[] = []

  Object.values(store.progressMap).forEach(p => {
    totalAttempts += p.attempts
    totalCorrect += p.correctCount
    if (p.bookmarked) bookmarkedIds.push(p.questionId)
  })

  return {
    accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    totalAttempts,
    bookmarkedCount: bookmarkedIds.length,
    weakCount: store.weakQuestions.length
  }
})
</script>

<template>
  <div class="stats-container">
    <header class="page-header">
      <h1>Your Statistics</h1>
    </header>

    <div class="stats-grid">
      <div class="stat-card accuracy-card">
        <h3>Overall Accuracy</h3>
        <p class="stat-value">{{ stats.accuracy }}%</p>
        <p class="subtitle">{{ stats.totalAttempts }} total attempts</p>
      </div>

      <div class="stat-card info-card">
        <h3>Weak Questions</h3>
        <p class="stat-value">{{ stats.weakCount }}</p>
        <button class="action-btn" @click="router.push('/practice?mode=weak')">Review Now</button>
      </div>

      <div class="stat-card bookmark-card">
        <h3>Bookmarked</h3>
        <p class="stat-value">{{ stats.bookmarkedCount }}</p>
        <button class="action-btn" @click="router.push('/study')">View in Study Mode</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

h1 {
  color: var(--secondary);
  margin: 0;
  font-size: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--surface);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.accuracy-card { border-top: 4px solid var(--correct); }
.info-card { border-top: 4px solid var(--primary); }
.bookmark-card { border-top: 4px solid #f59e0b; }

h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  margin: 0 0 0.5rem 0;
  font-size: 3rem;
  font-weight: 800;
  color: var(--secondary);
}

.subtitle {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.action-btn {
  margin-top: 1.5rem;
  background-color: var(--bg-color);
  color: var(--secondary);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
}
</style>
