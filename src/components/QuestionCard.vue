<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { marked } from 'marked'
import type { Question } from '../store/quizStore'
import { useQuizStore } from '../store/quizStore'

const props = defineProps<{
  question: Question
  showAnswer: boolean
  interactive?: boolean
  selectedOption?: number | null
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
  (e: 'bookmark', id: number): void
}>()

const store = useQuizStore()
const explanationHtml = ref('')

async function fetchExplanation() {
  if (props.showAnswer && props.question.explanation_en) {
    try {
      const response = await fetch(`/data/${props.question.explanation_en}`)
      if (response.ok) {
        const text = await response.text()
        explanationHtml.value = await marked(text)
      } else {
        explanationHtml.value = '<p>Explanation not found.</p>'
      }
    } catch (err) {
      explanationHtml.value = '<p>Error loading explanation.</p>'
    }
  }
}

onMounted(fetchExplanation)
watch(() => [props.question.id, props.showAnswer], fetchExplanation)

const bookmarkBtnIcon = computed(() => store.getProgress(props.question.id).bookmarked ? '🔖' : '🏷️')

function getOptionLetter(index: number) {
  return String.fromCharCode(97 + index)
}

function handleSelect(index: number) {
  if (props.interactive && !props.showAnswer) {
    emit('select', index)
  }
}

function getImageUrl(img: string) {
  if (!img) return ''
  if (img.startsWith('http') || img.startsWith('data:')) return img
  if (img.startsWith('images/')) return `/data/${img}`
  return `/data/images/${img}`
}
</script>

<template>
  <div class="question-card">
    <header class="detail-header">
      <div class="meta">
        <span class="category">{{ question.category }}</span>
        <button class="bookmark-btn" @click.stop="emit('bookmark', question.id)" :title="store.getProgress(question.id).bookmarked ? 'Remove Bookmark' : 'Add Bookmark'">
          {{ bookmarkBtnIcon }}
        </button>
      </div>
      <h2 class="q-title">{{ question.question }}</h2>
    </header>

    <!-- Question Image (if only 1 image) -->
    <section class="question-visual" v-if="question.question_image">
      <div class="image-wrapper">
         <img :src="getImageUrl(question.question_image)" :alt="`Visual for question ${question.id}`" />
      </div>
    </section>

    <!-- Options -->
    <section class="options" :class="{ 'grid-options': !!question.option_images }">
      <div 
        v-for="(option, idx) in question.options" 
        :key="idx" 
        class="option-item"
        :class="{ 
          'interactive': interactive && !showAnswer,
          'selected': selectedOption === idx,
          'correct': showAnswer && getOptionLetter(idx) === question.correct_answer,
          'incorrect': showAnswer && selectedOption === idx && getOptionLetter(idx) !== question.correct_answer,
          'has-image': !!question.option_images
        }"
        @click="handleSelect(idx)"
      >
        <div v-if="question.option_images && question.option_images[idx]" class="option-image-wrapper">
          <img :src="getImageUrl(question.option_images[idx])" alt="" />
        </div>
        <div class="option-text">
          <span class="option-letter">{{ getOptionLetter(idx) }})</span>
          {{ option.replace(/^[a-d]\)\s*/, '') }}
        </div>
      </div>
    </section>

    <footer v-if="showAnswer" class="explanation-container">
      <h3>Explanation</h3>
      <div v-if="question.brochure_page" class="brochure-link-container">
        <a :href="`/data/broschure.pdf#page=${question.brochure_page}`" target="_blank" rel="noopener noreferrer" class="brochure-link">
          📖 Official Naturalization Brochure (Page {{ question.brochure_page }})
        </a>
      </div>
      <div class="markdown-body" v-html="explanationHtml"></div>
    </footer>
  </div>
</template>

<style scoped>
.question-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  text-align: left;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #dbeafe; 
  color: #1e40af;
}

.bookmark-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
}

.q-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  line-height: 1.4;
  color: var(--secondary);
}

.question-visual .image-wrapper img {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
  margin: 0 auto 1.5rem auto;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.grid-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .grid-options {
    grid-template-columns: 1fr;
  }
}

.option-item {
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--bg-color);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item.interactive {
  cursor: pointer;
}

.option-item.interactive:hover {
  border-color: #adb5bd;
}

.option-item.selected {
  border-color: var(--primary);
  background-color: #fff1f2;
}

.option-item.correct {
  border-color: var(--correct);
  background-color: #e6fcf5;
  color: #0d9488;
  font-weight: 600;
}

.option-item.incorrect {
  border-color: var(--incorrect);
  background-color: #fff1f2;
  color: #be123c;
}

.option-image-wrapper img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  background: white;
}

.option-text {
  display: flex;
  gap: 0.5rem;
}

.option-letter {
  font-weight: bold;
  color: var(--text-light);
}

.explanation-container {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.explanation-container h3 {
  margin-top: 0;
  font-size: 1.1rem;
  color: var(--secondary);
}

.brochure-link-container {
  margin-bottom: 1rem;
}

.brochure-link {
  display: inline-block;
  background-color: #f1f5f9;
  color: #2563eb;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  border: 1px solid #cbd5e1;
  transition: all 0.2s;
}

.brochure-link:hover {
  background-color: #e2e8f0;
  border-color: #94a3b8;
  color: #1d4ed8;
}

:deep(.markdown-body) {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4b5563;
}

:deep(.markdown-body h1), :deep(.markdown-body h2), :deep(.markdown-body h3) {
  color: var(--secondary);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>
