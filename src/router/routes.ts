import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { guestOnly: true },
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/empresas' },
      {
        path: 'empresas',
        name: 'empresas',
        component: () => import('pages/EmpresaPage.vue'),
      },
      {
        path: 'productos',
        name: 'productos',
        component: () => import('pages/ProductoPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'inventario',
        name: 'inventario',
        component: () => import('pages/InventarioPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
