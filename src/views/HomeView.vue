<script setup lang="ts">
import { useQuizStore } from '../store/quizStore'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const store = useQuizStore()
const router = useRouter()

const totalQuestions = computed(() => store.questions.length)
const dueCount = computed(() => store.dueQuestions.length)
const weakCount = computed(() => store.weakQuestions.length)

const overallProgress = computed(() => {
  if (totalQuestions.value === 0) return 0
  const attempted = store.questions.filter(q => store.getProgress(q.id).attempts > 0).length
  return Math.round((attempted / totalQuestions.value) * 100)
})

</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Prepare for your Swiss citizenship test.</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card progress-card">
        <h3>Completion</h3>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${overallProgress}%` }"></div>
        </div>
        <p class="stat-value">{{ overallProgress }}%</p>
      </div>
      
      <div class="stat-card alert-card" @click="router.push('/practice')">
        <h3>Due for Review</h3>
        <p class="stat-value">{{ dueCount }}</p>
        <p class="action-text">Start Spaced Repetition ➡️</p>
      </div>

      <div class="stat-card weak-card" @click="router.push('/practice?mode=weak')">
        <h3>Weak Areas</h3>
        <p class="stat-value">{{ weakCount }}</p>
        <p class="action-text">Review Mistakes ➡️</p>
      </div>
    </div>

    <h2 class="section-title">Quick Actions</h2>
    <div class="action-grid">
      <button class="btn primary-btn" @click="router.push('/study')">
        <span class="icon">📖</span> Browse All Questions
      </button>
      <button class="btn secondary-btn" @click="router.push('/exam')">
        <span class="icon">⏱️</span> Take Mock Exam
      </button>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

h1 {
  color: var(--secondary);
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.subtitle {
  color: var(--text-light);
  margin: 0;
}

.section-title {
  margin: 2rem 0 1rem 0;
  font-size: 1.25rem;
  color: var(--secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--surface);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.progress-card { cursor: default; }
.progress-card:hover { transform: none; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--secondary);
}

.action-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary);
}

.alert-card { border-left: 4px solid #f59e0b; }
.weak-card { border-left: 4px solid var(--primary); }
.progress-card { border-left: 4px solid #3b82f6; }

.progress-bar-bg {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.5s ease-out;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .action-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:active { opacity: 0.8; }

.primary-btn {
  background-color: var(--primary);
  color: white;
}

.secondary-btn {
  background-color: var(--secondary);
  color: white;
}

.icon {
  font-size: 1.5rem;
}
</style>
