import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/HomePage.vue'
import Description from '@/pages/DescriptionTemplate.vue'
import MyAnime from '@/pages/MyAnime.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'HomePage', meta: { title: 'Home | Natsuyouko' }, component: Home },
    {
      path: '/Description/:id',
      name: 'Description',
      meta: { title: 'Description | Natsuyouko' },
      component: Description,
    },
    {
      path: '/MyAnime/:status',
      name: 'MyAnime',
      meta: { title: 'My Anime | Natsuyouko' },
      component: MyAnime,
    },
  ],
})

router.beforeEach((to) => {
  document.title = (to.meta.title as string) || 'Natsuyouko'
})

export default router
