import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/HomePage.vue'
import Description from '@/pages/DescriptionTemplate.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'HomePage', component: Home },
    { path: '/Description/:id', name: 'Description', component: Description },
  ],
})

export default router
