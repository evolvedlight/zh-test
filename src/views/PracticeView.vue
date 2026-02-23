<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '../store/quizStore'
import { useRouter, useRoute } from 'vue-router'
import QuestionCard from '../components/QuestionCard.vue'

const store = useQuizStore()
const router = useRouter()
const route = useRoute()

const currentQuestionIndex = ref(0)
const selectedOption = ref<number | null>(null)
const isAnswered = ref(false)
const practiceQueue = ref<typeof store.questions>([])

const mode = computed(() => route.query.mode === 'weak' ? 'Weak Areas' : 'Spaced Repetition')

onMounted(() => {
  // Initialize queue based on mode
  if (route.query.mode === 'weak') {
    practiceQueue.value = [...store.weakQuestions].sort(() => 0.5 - Math.random())
  } else {
    practiceQueue.value = [...store.dueQuestions].sort(() => 0.5 - Math.random())
    // Fallback if nothing is due
    if (practiceQueue.value.length === 0) {
      practiceQueue.value = [...store.questions].sort(() => 0.5 - Math.random()).slice(0, 20)
    }
  }
})

const currentQuestion = computed(() => {
  return practiceQueue.value[currentQuestionIndex.value] || null
})

const progressText = computed(() => {
  return `${currentQuestionIndex.value + 1} / ${practiceQueue.value.length}`
})

async function handleSelect(index: number) {
  if (isAnswered.value || !currentQuestion.value) return
  
  selectedOption.value = index
  isAnswered.value = true
  
  const selectedLetter = String.fromCharCode(97 + index)
  const isCorrect = selectedLetter === currentQuestion.value.correct_answer
  
  await store.recordAttempt(currentQuestion.value.id, isCorrect, 'practice')
}

function nextQuestion() {
  if (currentQuestionIndex.value < practiceQueue.value.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = null
    isAnswered.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="practice-layout">
    <header class="practice-header">
      <div class="header-content">
        <h2>Practice: {{ mode }}</h2>
        <span class="progress">{{ progressText }}</span>
      </div>
      <div class="progress-bar-bg">
        <div 
          class="progress-bar-fill" 
          :style="{ width: `${((currentQuestionIndex) / practiceQueue.length) * 100}%` }"
        ></div>
      </div>
    </header>

    <main class="practice-content">
      <div v-if="currentQuestion" class="card-container">
        <QuestionCard 
          :question="currentQuestion"
          :show-answer="isAnswered"
          :interactive="true"
          :selected-option="selectedOption"
          @select="handleSelect"
          @bookmark="(id) => store.toggleBookmark(id)"
        />
        
        <div v-if="isAnswered" class="action-footer">
          <button class="next-btn" @click="nextQuestion">
            {{ currentQuestionIndex < practiceQueue.length - 1 ? 'Next Question ➡️' : 'Finish Practice 🎉' }}
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No questions available for this mode right now. Great job!</p>
        <button class="next-btn" @click="router.push('/')">Go Home</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.practice-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
}

.practice-header {
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

.practice-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--secondary);
}

.progress {
  font-weight: 600;
  color: var(--text-light);
}

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
  background: var(--primary);
  transition: width 0.3s ease;
}

.practice-content {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.card-container {
  max-width: 800px;
  margin: 0 auto;
}

.action-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.next-btn {
  background-color: var(--secondary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (min-width: 600px) {
  .next-btn {
    width: auto;
  }
}

.next-btn:hover {
  background-color: #112240;
}

.empty-state {
  text-align: center;
  margin-top: 4rem;
  color: var(--text-light);
}

.empty-state .next-btn {
  margin-top: 2rem;
}
</style>
