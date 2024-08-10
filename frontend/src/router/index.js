import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/view/:blockHeight',
      name: 'visualizer', 
      component: () => import('../views/CryptoJouleVisualizer.vue'),
      props: true
    },
    {
      path: '/explore/:blockHeight/:txIndex/:byteIndex',
      name: 'explore',
      component: () => import('../views/CryptoJouleExplorer.vue'),
      props: true
    },
    {
      path: '/:blockHeight',
      redirect: { name: 'visualizer' }
    }
  ]
})

export default router
