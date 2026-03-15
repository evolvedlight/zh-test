<template>
  <div class="admin-view">
    <h1>Admin Review Mode</h1>
    
    <div v-if="quizStore.loading">Loading...</div>
    <div v-else-if="quizStore.error">{{ quizStore.error }}</div>
    <div v-else-if="questions.length === 0">No questions found.</div>
    <div v-else class="admin-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="stats">
          Total: {{ questions.length }} | Reviewed: {{ reviewedCount }}
        </div>
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Search by ID or text" />
        </div>
        <div class="question-list">
          <div 
            v-for="q in filteredQuestions" 
            :key="q.id" 
            class="list-item" 
            :class="{ active: currentQuestion && q.id === currentQuestion.id, reviewed: q.reviewed }"
            @click="selectQuestion(q)"
          >
            <span class="id-badge">#{{ q.id }}</span>
            <span class="q-text">{{ q.question }}</span>
            <span v-if="q.reviewed" class="reviewed-icon">✓</span>
          </div>
        </div>
      </div>

      <!-- Main Editor -->
      <div class="editor" v-if="currentQuestion">
        <div class="header">
          <h2>Edit Question #{{ currentQuestion.id }}</h2>
          <button @click="markReviewedAndSave" class="btn-save" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save & Mark Reviewed' }}
          </button>
        </div>

        <div class="editor-content">
          
          <!-- Top Row: Meta/Question (Left) and Options (Right) -->
          <div class="row">
            <div class="col left-col">
              <div class="form-group">
                <label>Category</label>
                <input type="text" v-model="currentQuestion.category" />
              </div>

              <div class="form-group">
                <label>Subcategory</label>
                <input type="text" v-model="currentQuestion.subcategory" />
              </div>

              <div class="form-group flex-fill">
                <label>Question Text</label>
                <textarea v-model="currentQuestion.question" rows="4" class="full-height-textarea"></textarea>
              </div>
            </div>

            <div class="col right-col">
              <div class="options-group">
                <label>Options</label>
                <div v-for="(opt, index) in currentQuestion.options" :key="index" class="option-item">
                  <input type="radio" :value="['a', 'b', 'c', 'd'][index]" v-model="currentQuestion.correct_answer" />
                  <span class="opt-label">{{ ['a)', 'b)', 'c)', 'd)'][index] }}</span>
                  <input type="text" v-model="currentQuestion.options[index]" />
                </div>
              </div>
              
              <div class="form-group">
                <label>Explanation File Path</label>
                <input type="text" v-model="currentQuestion.explanation_en" readonly class="readonly-input" />
              </div>
            </div>
          </div>

          <!-- Bottom Row: Markdown Editor (Left) and Preview (Right) -->
          <div class="row markdown-row">
            <div class="col">
               <div class="form-group flex-fill">
                 <label>Explanation Content (Markdown)</label>
                 <textarea v-model="markdownContent" class="full-height-textarea" placeholder="Loading markdown..."></textarea>
               </div>
            </div>
            <div class="col">
               <div class="form-group flex-fill markdown-preview-col">
                 <label>Preview</label>
                 <div class="markdown-preview">
                   <div class="preview-box" v-html="renderedMarkdown"></div>
                 </div>
               </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="prevQuestion" :disabled="currentIndex <= 0">Previous</button>
            <button @click="nextQuestion" :disabled="currentIndex >= filteredQuestions.length - 1">Next</button>
          </div>
        </div>
      </div>

      <!-- Right Panel: PDF Viewer -->
      <div class="pdf-panel" v-if="currentQuestion">
         <div class="form-group">
            <label>Brochure Page (optional)</label>
            <input type="number" v-model.number="currentQuestion.brochure_page" />
         </div>
         <div class="pdf-container">
            <iframe 
               :key="'pdf-' + currentQuestion.id + '-' + currentQuestion.brochure_page" 
               v-if="pdfUrl" 
               :src="pdfUrl" 
               class="pdf-frame" 
               title="Brochure PDF Preview"
            ></iframe>
            <div v-else class="no-pdf-msg">No brochure page specified or PDF not found.</div>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuizStore, type Question } from '../store/quizStore';
import { marked } from 'marked';

const quizStore = useQuizStore();
const questions = computed(() => quizStore.questions);
const searchQuery = ref('');

const currentQuestion = ref<Question | null>(null);
const markdownContent = ref('');
const isSaving = ref(false);

const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  return marked.parse(markdownContent.value);
});

const pdfUrl = computed(() => {
   if (currentQuestion.value && currentQuestion.value.brochure_page != null && currentQuestion.value.brochure_page > 0) {
      // Use standard fragment #page=N. 
      // Note: This relies on browser PDF viewer support.
      return `/data/broschure.pdf#page=${currentQuestion.value.brochure_page}`;
   }
   return null;
});

const reviewedCount = computed(() => {
  return questions.value.filter(q => q.reviewed).length;
});

const filteredQuestions = computed(() => {
  if (!searchQuery.value) return questions.value;
  const q = searchQuery.value.toLowerCase();
  return questions.value.filter(item => 
    item.id.toString().includes(q) || 
    item.question.toLowerCase().includes(q)
  );
});

const currentIndex = computed(() => {
  if (!currentQuestion.value) return -1;
  return filteredQuestions.value.findIndex(q => q.id === currentQuestion.value!.id);
});

const loadMarkdownContent = async (filePath: string) => {
   markdownContent.value = 'Loading...';
   try {
     const timestamp = new Date().getTime(); // Prevent caching
     const res = await fetch(`/data/${filePath}?t=${timestamp}`);
     if (res.ok) {
       markdownContent.value = await res.text();
     } else {
       markdownContent.value = `Error: Could not load ${filePath} (Status: ${res.status})`;
     }
   } catch (err: any) {
     markdownContent.value = `Error loading markdown: ${err.message}`;
   }
};

const selectQuestion = (q: Question) => {
  currentQuestion.value = JSON.parse(JSON.stringify(q));
  if (currentQuestion.value?.explanation_en) {
     loadMarkdownContent(currentQuestion.value.explanation_en);
  } else {
     markdownContent.value = '';
  }
};

const nextQuestion = () => {
  if (currentIndex.value < filteredQuestions.value.length - 1) {
    selectQuestion(filteredQuestions.value[currentIndex.value + 1]);
  }
};

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    selectQuestion(filteredQuestions.value[currentIndex.value - 1]);
  }
};

const saveMarkdownContent = async () => {
  if (!currentQuestion.value?.explanation_en) return;
  
  try {
     const res = await fetch('/api/admin/markdown', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           filePath: currentQuestion.value.explanation_en,
           content: markdownContent.value
        })
     });
     if (!res.ok) {
       throw new Error(`Failed to save markdown: ${res.statusText}`);
     }
  } catch (err) {
     console.error(err);
     throw err;
  }
};

const markReviewedAndSave = async () => {
  if (!currentQuestion.value) return;
  
  isSaving.value = true;
  currentQuestion.value.reviewed = true;
  quizStore.updateQuestion(currentQuestion.value);
  
  try {
    // 1. Save JSON
    await quizStore.saveQuestionsAdmin();
    // 2. Save Markdown
    await saveMarkdownContent();
    
    isSaving.value = false;
    nextQuestion();
  } catch (err: any) {
    isSaving.value = false;
    alert('Failed to save: ' + err.message);
  }
};

onMounted(() => {
  if (questions.value.length === 0) {
    quizStore.init().then(() => {
      if (filteredQuestions.value.length > 0) {
        selectQuestion(filteredQuestions.value[0]);
      }
    });
  } else {
    if (filteredQuestions.value.length > 0) {
      selectQuestion(filteredQuestions.value[0]);
    }
  }
});
</script>

<style scoped>
.admin-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

h1 {
  margin-top: 0;
  margin-bottom: 20px;
}

.admin-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ccc;
  padding-right: 10px;
}

.stats {
  margin-bottom: 10px;
  font-weight: bold;
}

.search-box input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.question-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.list-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-item:hover {
  background-color: #f9f9f9;
}

.list-item.active {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
}

.list-item.reviewed {
  opacity: 0.8;
}

.id-badge {
  font-weight: bold;
  color: #666;
  min-width: 30px;
}

.q-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9em;
}

.reviewed-icon {
  color: green;
  font-weight: bold;
}

.editor {
  flex: 2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 450px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header h2 {
  margin: 0;
}

.btn-save {
  background-color: #52c41a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-save:disabled {
  background-color: #a0d911;
  cursor: not-allowed;
}

.btn-save:hover:not(:disabled) {
  background-color: #389e0d;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Grid Layout */
.row {
  display: flex;
  gap: 20px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-row {
  flex: 1;
  min-height: 250px;
}

/* Form Styles */
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

.flex-fill {
  flex: 1;
}

.full-height-textarea {
  flex: 1;
  resize: vertical;
}

.readonly-input {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.options-group {
  margin-bottom: 15px;
}

.options-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-item input[type="text"] {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.opt-label {
  font-weight: bold;
  min-width: 20px;
}

.markdown-preview-col {
  margin-bottom: 0;
}

.markdown-preview {
   flex: 1;
   border: 1px solid #ccc;
   padding: 10px;
   background: #fafafa;
   border-radius: 4px;
   overflow-y: auto;
}

.preview-box {
   font-size: 0.95em;
   line-height: 1.5;
}

.preview-box :deep(p) {
   margin-top: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.form-actions button {
  padding: 8px 16px;
  cursor: pointer;
}

/* PDF Panel Styles */
.pdf-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ccc;
  padding-left: 20px;
  min-width: 300px;
}

.pdf-container {
  flex: 1;
  background-color: #e9e9e9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  margin-bottom: 10px;
}

.pdf-frame {
  flex: 1;
  width: 100%;
  border: none;
}

.no-pdf-msg {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
  margin: auto;
}
</style>