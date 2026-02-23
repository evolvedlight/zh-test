import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StudyView from '../views/StudyView.vue'
import PracticeView from '../views/PracticeView.vue'
import ExamView from '../views/ExamView.vue'
import StatsView from '../views/StatsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/study/:id?', name: 'study', component: StudyView },
    { path: '/practice', name: 'practice', component: PracticeView },
    { path: '/exam', name: 'exam', component: ExamView },
    { path: '/stats', name: 'stats', component: StatsView },
  ]
})

export default router
