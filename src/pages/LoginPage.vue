<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card flat bordered style="width: 100%; max-width: 400px">
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-xs">StockHub</div>
        <div class="text-caption text-grey-7">Iniciar sesion</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.email"
            label="Correo"
            type="email"
            outlined
            autofocus
            :rules="[(v) => !!v || 'Requerido', (v) => /.+@.+\..+/.test(v) || 'Email invalido']"
            :error="!!fieldErrors.email"
            :error-message="fieldErrors.email"
          />
          <q-input
            v-model="form.password"
            label="Contrasena"
            type="password"
            outlined
            :rules="[(v) => !!v || 'Requerido']"
            :error="!!fieldErrors.password"
            :error-message="fieldErrors.password"
          />
          <q-btn
            type="submit"
            label="Entrar"
            color="primary"
            class="full-width"
            unelevated
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="isDev" class="text-caption text-grey-7">
        <div>Usuarios de prueba (solo dev):</div>
        <div>admin@stockhub.local</div>
        <div>externo@stockhub.local</div>
        <div class="q-mt-xs">Passwords en tu .env local (SEED_*_PASSWORD).</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth.store';
import { getApiErrorMessage, getFieldErrors } from 'src/utils/error';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const fieldErrors = ref<Record<string, string>>({});
const isDev = import.meta.env.DEV;

async function onSubmit() {
  loading.value = true;
  fieldErrors.value = {};
  try {
    await authStore.login(form.email, form.password);
    $q.notify({ type: 'positive', message: 'Sesion iniciada' });
    await router.push({ name: 'empresas' });
  } catch (err) {
    fieldErrors.value = getFieldErrors(err);
    $q.notify({ type: 'negative', message: getApiErrorMessage(err, 'Credenciales invalidas') });
  } finally {
    loading.value = false;
  }
}
</script>
