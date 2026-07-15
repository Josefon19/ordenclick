import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { rol: 'administrador' }
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsuarios',
    component: () => import('../views/admin/UsuariosView.vue'),
    meta: { rol: 'administrador' }
  },
  {
    path: '/admin/platillos',
    name: 'AdminPlatillos',
    component: () => import('../views/admin/PlatillosView.vue'),
    meta: { rol: 'administrador' }
  },
  {
    path: '/mesero/ordenes',
    name: 'MeseroOrdenes',
    component: () => import('../views/mesero/OrdenesView.vue'),
    meta: { rol: 'mesero' }
  },
  {
    path: '/cocina',
    name: 'Cocina',
    component: () => import('../views/cocina/CocinaView.vue'),
    meta: { rol: 'cocina' }
  },
  {
    path: '/',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.cargarSesion();

  if (to.meta.public) {
    if (authStore.isAuthenticated) {
      const redirectTo = {
        administrador: '/admin/dashboard',
        mesero: '/mesero/ordenes',
        cocina: '/cocina'
      }[authStore.rolUsuario];
      next(redirectTo);
    } else {
      next();
    }
  } else {
    if (!authStore.isAuthenticated) {
      next('/login');
    } else if (to.meta.rol && to.meta.rol !== authStore.rolUsuario) {
      const redirectTo = {
        administrador: '/admin/dashboard',
        mesero: '/mesero/ordenes',
        cocina: '/cocina'
      }[authStore.rolUsuario];
      next(redirectTo);
    } else {
      next();
    }
  }
});

export default router;
