<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuizStore } from '../store/quizStore'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from '../components/QuestionCard.vue'

const store = useQuizStore()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('All')
const selectedQuestionId = ref<number | null>(null)

onMounted(() => {
  if (route.params.id) {
    selectedQuestionId.value = parseInt(route.params.id as string)
  } else if (store.questions.length > 0) {
    selectedQuestionId.value = store.questions[0]?.id ?? null
  }
})

// Update selection if URL changes (back/forward buttons)
watch(() => route.params.id, (newId) => {
  if (newId) {
    selectedQuestionId.value = parseInt(newId as string)
  }
})

// Update URL if selection changes
watch(selectedQuestionId, (newId) => {
  if (newId && route.params.id !== newId.toString()) {
    router.replace({ name: 'study', params: { id: newId.toString() } })
  }
})

const categories = computed(() => {
  const cats = new Set(store.questions.map(q => q.category))
  return ['All', ...Array.from(cats).sort()]
})

const filteredQuestions = computed(() => {
  return store.questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         q.id.toString().includes(searchQuery.value)
    const matchesCategory = selectedCategory.value === 'All' || q.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const selectedQuestion = computed(() => {
  return store.questions.find(q => q.id === selectedQuestionId.value)
})

function selectQuestion(id: number) {
  selectedQuestionId.value = id
  if (window.innerWidth < 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="study-layout">
    <!-- Sidebar / List View -->
    <aside class="study-sidebar">
      <div class="sidebar-header">
        <h2>Study Mode</h2>
        <div class="filters">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search..." 
            class="search-input"
          />
          <select v-model="selectedCategory" class="category-select">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
      
      <div class="question-list">
        <div 
          v-for="q in filteredQuestions" 
          :key="q.id" 
          class="question-item"
          :class="{ active: selectedQuestionId === q.id, bookmarked: store.getProgress(q.id).bookmarked }"
          @click="selectQuestion(q.id)"
        >
          <span class="q-id">#{{ q.id }}</span>
          <span class="q-text">{{ q.question }}</span>
          <span v-if="store.getProgress(q.id).bookmarked" class="b-icon">🔖</span>
        </div>
      </div>
    </aside>

    <!-- Detail View -->
    <main class="study-content">
      <div v-if="selectedQuestion" class="detail-container">
        <QuestionCard 
          :question="selectedQuestion"
          :show-answer="true"
          :interactive="false"
          @bookmark="(id) => store.toggleBookmark(id)"
        />
      </div>
      <div v-else class="empty-state">
        <p>Select a question from the list to view details.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.study-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media (min-width: 768px) {
  .study-layout {
    flex-direction: row;
  }
}

.study-sidebar {
  width: 100%;
  background-color: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 40vh; /* Fixed height on mobile so we can scroll the list */
}

@media (min-width: 768px) {
  .study-sidebar {
    width: 350px;
    height: 100%;
    border-bottom: none;
    border-right: 1px solid var(--border);
  }
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.sidebar-header h2 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--secondary);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-input, .category-select {
  padding: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
}

.question-list {
  flex: 1;
  overflow-y: auto;
}

.question-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background 0.2s;
}

.question-item:hover {
  background-color: var(--bg-color);
}

.question-item.active {
  background-color: #eef2ff;
  border-left: 4px solid var(--primary);
}

.q-id {
  font-weight: bold;
  color: var(--text-light);
  min-width: 2.5rem;
}

.q-text {
  font-size: 0.9rem;
  color: var(--secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.b-icon { font-size: 0.8rem; }

.study-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: var(--bg-color);
}

.detail-container {
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-light);
  font-size: 1.1rem;
}
</style>
