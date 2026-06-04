<template>
  <q-card style="width: 460px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">{{ isEdit ? 'Editar empresa' : 'Nueva empresa' }}</div>
    </q-card-section>
    <q-separator />
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="form.nit"
          label="NIT"
          outlined
          :disable="isEdit"
          :rules="[(v) => !!v || 'Requerido']"
          :error="!!fieldErrors.nit"
          :error-message="fieldErrors.nit"
        />
        <q-input
          v-model="form.nombre"
          label="Nombre"
          outlined
          :rules="[(v) => !!v || 'Requerido']"
          :error="!!fieldErrors.nombre"
          :error-message="fieldErrors.nombre"
        />
        <q-input
          v-model="form.direccion"
          label="Direccion"
          outlined
          :error="!!fieldErrors.direccion"
          :error-message="fieldErrors.direccion"
        />
        <q-input
          v-model="form.telefono"
          label="Telefono"
          outlined
          :error="!!fieldErrors.telefono"
          :error-message="fieldErrors.telefono"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="emit('cancel')" />
        <q-btn type="submit" color="primary" :loading="loading" label="Guardar" unelevated />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { empresaService } from 'src/services/empresa.service';
import type { Empresa, EmpresaPayload } from 'src/types';
import { getApiErrorMessage, getFieldErrors } from 'src/utils/error';

const props = defineProps<{ empresa: Empresa | null }>();
const emit = defineEmits<{ saved: [Empresa]; cancel: [] }>();

const $q = useQuasar();
const loading = ref(false);
const fieldErrors = ref<Record<string, string>>({});

const isEdit = computed(() => !!props.empresa);

const form = reactive<EmpresaPayload>({
  nit: '',
  nombre: '',
  direccion: '',
  telefono: '',
});

watch(
  () => props.empresa,
  (e) => {
    form.nit = e?.nit ?? '';
    form.nombre = e?.nombre ?? '';
    form.direccion = e?.direccion ?? '';
    form.telefono = e?.telefono ?? '';
    fieldErrors.value = {};
  },
  { immediate: true },
);

async function onSubmit() {
  loading.value = true;
  fieldErrors.value = {};
  try {
    const saved = isEdit.value
      ? await empresaService.update(form.nit, form)
      : await empresaService.create(form);
    $q.notify({ type: 'positive', message: 'Empresa guardada' });
    emit('saved', saved);
  } catch (err) {
    fieldErrors.value = getFieldErrors(err);
    $q.notify({ type: 'negative', message: getApiErrorMessage(err, 'Error al guardar') });
  } finally {
    loading.value = false;
  }
}
</script>
