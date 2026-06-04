import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/HomePage.vue'
import Description from '@/pages/DescriptionTemplate.vue'
import MyAnime from '@/pages/MyAnime.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'HomePage', component: Home },
    { path: '/Description/:id', name: 'Description', component: Description },
    { path: '/MyAnime/:status', name: 'MyAnime', component: MyAnime },
  ],
})

export default router
