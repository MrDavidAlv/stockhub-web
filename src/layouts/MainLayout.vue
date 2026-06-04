<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">StockHub</q-toolbar-title>

        <q-tabs v-if="authStore.isAuthenticated" align="left" no-caps inline-label>
          <q-route-tab :to="{ name: 'empresas' }" label="Empresas" icon="apartment" />
          <q-route-tab
            v-if="authStore.isAdmin"
            :to="{ name: 'productos' }"
            label="Productos"
            icon="inventory_2"
          />
          <q-route-tab
            v-if="authStore.isAdmin"
            :to="{ name: 'inventario' }"
            label="Inventario"
            icon="assessment"
          />
        </q-tabs>

        <q-space />

        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-sm">
          <q-chip
            :label="authStore.user?.rol"
            :color="authStore.isAdmin ? 'accent' : 'grey-7'"
            text-color="white"
            dense
          />
          <span class="text-caption">{{ authStore.user?.nombre }}</span>
          <q-btn flat dense icon="logout" aria-label="Salir" @click="onLogout" />
        </div>
        <q-btn v-else flat label="Iniciar sesion" :to="{ name: 'login' }" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

async function onLogout() {
  await authStore.logout();
  await router.push({ name: 'login' });
}
</script>
