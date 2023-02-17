import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PopUp from "@/components/PopUp.vue";
import TestView from "@/views/TestView.vue";

const routes = [
  {
    name: 'Home',
    path: '/',
    component: () => import("@/views/HomeView.vue"),
  },
  {
    name: 'Input',
    path: '/bot/:jetBotId/:telegramId/:object',
    component: () => import("@/views/HomeView.vue"),
    meta: { tg: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  console.log(to);
  if (to.meta.tg) {
    localStorage.setItem('jetBotId', to.params.jetBotId)
    localStorage.setItem('telegramId', to.params.telegramId)
    localStorage.setItem('object', to.params.telegramId)
  }
})

export default router
