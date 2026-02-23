<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '../store/quizStore'
import { useRouter } from 'vue-router'
import QuestionCard from '../components/QuestionCard.vue'

const store = useQuizStore()
const router = useRouter()

const EXAM_LENGTH = 30
const examQuestions = ref<typeof store.questions>([])
const currentQuestionIndex = ref(0)
const userAnswers = ref<Record<number, number>>({})
const examFinished = ref(false)

onMounted(() => {
  // Select random 30 questions
  examQuestions.value = [...store.questions]
    .sort(() => 0.5 - Math.random())
    .slice(0, EXAM_LENGTH)
})

const currentQuestion = computed(() => examQuestions.value[currentQuestionIndex.value])

const progressText = computed(() => `${currentQuestionIndex.value + 1} / ${EXAM_LENGTH}`)

function handleSelect(index: number) {
  if (!currentQuestion.value || examFinished.value) return
  userAnswers.value[currentQuestion.value.id] = index
  
  setTimeout(() => {
    if (currentQuestionIndex.value < EXAM_LENGTH - 1) {
      currentQuestionIndex.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      finishExam()
    }
  }, 300) // Slight delay to show selection
}

const score = computed(() => {
  let correct = 0
  examQuestions.value.forEach(q => {
    const ansIndex = userAnswers.value[q.id]
    if (ansIndex !== undefined) {
      const selectedLetter = String.fromCharCode(97 + ansIndex)
      if (selectedLetter === q.correct_answer) correct++
    }
  })
  return correct
})

const passingScore = Math.ceil(EXAM_LENGTH * 0.6) // 60% to pass
const passed = computed(() => score.value >= passingScore)

async function finishExam() {
  examFinished.value = true
  
  // Record all attempts in background
  for (const q of examQuestions.value) {
    const ansIndex = userAnswers.value[q.id]
    if (ansIndex !== undefined) {
      const selectedLetter = String.fromCharCode(97 + ansIndex)
      const isCorrect = selectedLetter === q.correct_answer
      await store.recordAttempt(q.id, isCorrect, 'exam')
    }
  }
}
</script>

<template>
  <div class="exam-layout">
    <header class="exam-header">
      <div class="header-content">
        <h2>Mock Exam</h2>
        <span class="progress" v-if="!examFinished">{{ progressText }}</span>
      </div>
      <div class="progress-bar-bg" v-if="!examFinished">
        <div 
          class="progress-bar-fill" 
          :style="{ width: `${((currentQuestionIndex) / EXAM_LENGTH) * 100}%` }"
        ></div>
      </div>
    </header>

    <main class="exam-content">
      <div v-if="!examFinished && currentQuestion" class="card-container">
        <QuestionCard 
          :question="currentQuestion"
          :show-answer="false"
          :interactive="true"
          :selected-option="userAnswers[currentQuestion.id]"
          @select="handleSelect"
          @bookmark="(id) => store.toggleBookmark(id)"
        />
      </div>

      <div v-else-if="examFinished" class="results-container">
        <div class="result-card" :class="{ 'passed': passed, 'failed': !passed }">
          <h1>{{ passed ? 'Exam Passed! 🎉' : 'Exam Failed 😔' }}</h1>
          <p class="score-display">{{ score }} / {{ EXAM_LENGTH }}</p>
          <p class="req-display">Required to pass: {{ passingScore }}</p>
          
          <div class="actions">
            <button class="btn primary-btn" @click="router.push('/')">Go Home</button>
            <button class="btn secondary-btn" @click="router.push('/study')">Review Answers</button>
          </div>
        </div>

        <h3>Exam Review</h3>
        <div class="review-list">
          <QuestionCard 
            v-for="q in examQuestions" 
            :key="q.id"
            :question="q"
            :show-answer="true"
            :interactive="false"
            :selected-option="userAnswers[q.id]"
            @bookmark="(id) => store.toggleBookmark(id)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.exam-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
}

.exam-header {
  background-color: var(--surface);
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto 1rem auto;
}

.exam-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--secondary);
}

.progress { font-weight: 600; color: var(--text-light); }

.progress-bar-bg {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--secondary);
  transition: width 0.3s ease;
}

.exam-content {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.card-container, .results-container {
  max-width: 800px;
  margin: 0 auto;
}

.result-card {
  background: var(--surface);
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 3rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-top: 8px solid transparent;
}

.result-card.passed { border-top-color: var(--correct); }
.result-card.failed { border-top-color: var(--incorrect); }

.result-card h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  color: var(--secondary);
}

.score-display {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: var(--text);
}

.req-display {
  color: var(--text-light);
  margin: 0 0 2rem 0;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:active { opacity: 0.8; }
.primary-btn { background-color: var(--primary); color: white; }
.secondary-btn { background-color: #e2e8f0; color: var(--secondary); }

.review-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

h3 { color: var(--secondary); margin-bottom: 1.5rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
</style>
