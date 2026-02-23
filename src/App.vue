<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuizStore } from './store/quizStore'
import { useRoute } from 'vue-router'

const store = useQuizStore()
const route = useRoute()

onMounted(() => {
  store.init()
})

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Study', path: '/study', icon: '📖' },
  { name: 'Practice', path: '/practice', icon: '⚡' },
  { name: 'Stats', path: '/stats', icon: '📊' }
]
</script>

<template>
  <div class="app-wrapper">
    <!-- Main Content Area -->
    <main class="main-content">
      <div v-if="store.loading" class="loading-overlay">
        Loading...
      </div>
      <div v-else-if="store.error" class="error-overlay">
        Error: {{ store.error }}
      </div>
      <router-view v-else v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation (Mobile Friendly) / Side Navigation (Desktop) -->
    <nav class="bottom-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style>
:root {
  --primary: #e63946;
  --secondary: #1d3557;
  --bg-color: #f8f9fa;
  --surface: #ffffff;
  --text: #333333;
  --text-light: #6c757d;
  --border: #e9ecef;
  --correct: #2a9d8f;
  --incorrect: #e63946;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-color);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* For mobile browsers with dynamic UI */
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background-color: var(--bg-color);
}

.bottom-nav {
  display: flex;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom, 0.5rem); /* iOS Safe Area */
  justify-content: space-around;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-light);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 64px;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.nav-item.active {
  color: var(--primary);
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-overlay, .error-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: var(--text-light);
}

/* Desktop override */
@media (min-width: 768px) {
  .app-wrapper {
    flex-direction: row;
  }
  
  .bottom-nav {
    flex-direction: column;
    justify-content: flex-start;
    border-top: none;
    border-right: 1px solid var(--border);
    padding: 2rem 1rem;
    width: 80px;
    box-shadow: 2px 0 10px rgba(0,0,0,0.05);
  }

  .nav-item {
    margin-bottom: 1.5rem;
  }
}
</style>
