import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/HomeView.vue')
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../views/LogsView.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        
        component: () => import('../views/SettingsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  
  // ✅ Validate token for protected routes
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      next('/login')
      return
    }
    
    // Validate token is still valid
    const isValid = await auth.validateToken()
    if (!isValid) {
      next('/login')
      return
    }
  }
  
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    next('/dashboard/home')
    return
  }
  
  next()
})

export default router