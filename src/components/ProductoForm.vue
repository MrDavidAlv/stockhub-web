<template>
  <q-card style="width: 560px; max-width: 95vw">
    <q-card-section>
      <div class="text-h6">{{ isEdit ? 'Editar producto' : 'Nuevo producto' }}</div>
    </q-card-section>
    <q-separator />
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="form.codigo"
          label="Codigo"
          outlined
          :rules="[(v) => !!v || 'Requerido']"
          :error="!!fieldErrors.codigo"
          :error-message="fieldErrors.codigo"
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
          v-model="form.caracteristicas"
          label="Caracteristicas"
          outlined
          type="textarea"
          autogrow
        />
        <q-select
          v-model="form.empresaNit"
          :options="empresaOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Empresa"
          outlined
          :rules="[(v) => !!v || 'Requerido']"
          :error="!!fieldErrors.empresaNit"
          :error-message="fieldErrors.empresaNit"
        />
        <q-select
          v-model="form.categoriaIds"
          :options="categoriaOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          multiple
          use-chips
          label="Categorias"
          outlined
        />

        <PrecioMonedaList v-model="form.precios" />
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { productoService } from 'src/services/producto.service';
import { empresaService } from 'src/services/empresa.service';
import { categoriaService } from 'src/services/categoria.service';
import PrecioMonedaList from 'components/PrecioMonedaList.vue';
import type { PrecioMoneda, Producto } from 'src/types';
import { getApiErrorMessage, getFieldErrors } from 'src/utils/error';

const props = defineProps<{ producto: Producto | null }>();
const emit = defineEmits<{ saved: [Producto]; cancel: [] }>();

const $q = useQuasar();
const loading = ref(false);
const fieldErrors = ref<Record<string, string>>({});

const isEdit = computed(() => !!props.producto);

interface FormState {
  codigo: string;
  nombre: string;
  caracteristicas: string;
  empresaNit: string;
  categoriaIds: number[];
  precios: PrecioMoneda[];
}

const form = reactive<FormState>({
  codigo: '',
  nombre: '',
  caracteristicas: '',
  empresaNit: '',
  categoriaIds: [],
  precios: [],
});

const empresaOptions = ref<{ value: string; label: string }[]>([]);
const categoriaOptions = ref<{ value: number; label: string }[]>([]);

watch(
  () => props.producto,
  (p) => {
    form.codigo = p?.codigo ?? '';
    form.nombre = p?.nombre ?? '';
    form.caracteristicas = p?.caracteristicas ?? '';
    form.empresaNit = p?.empresaNit ?? '';
    form.categoriaIds = p?.categorias.map((c) => c.id) ?? [];
    form.precios = p?.precios.map((pr) => ({ ...pr })) ?? [];
    fieldErrors.value = {};
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    const [empresas, categorias] = await Promise.all([
      empresaService.findAll(),
      categoriaService.findAll(),
    ]);
    empresaOptions.value = empresas.map((e) => ({ value: e.nit, label: `${e.nombre} (${e.nit})` }));
    categoriaOptions.value = categorias.map((c) => ({ value: c.id, label: c.nombre }));
  } catch (err) {
    $q.notify({ type: 'negative', message: getApiErrorMessage(err) });
  }
});

async function onSubmit() {
  if (form.precios.length === 0) {
    $q.notify({ type: 'warning', message: 'Agrega al menos un precio' });
    return;
  }
  loading.value = true;
  fieldErrors.value = {};
  try {
    const payload = {
      codigo: form.codigo,
      nombre: form.nombre,
      caracteristicas: form.caracteristicas || null,
      empresaNit: form.empresaNit,
      categoriaIds: form.categoriaIds,
      precios: form.precios,
    };
    const saved = isEdit.value
      ? await productoService.update(props.producto!.id, payload)
      : await productoService.create(payload);
    $q.notify({ type: 'positive', message: 'Producto guardado' });
    emit('saved', saved);
  } catch (err) {
    fieldErrors.value = getFieldErrors(err);
    $q.notify({ type: 'negative', message: getApiErrorMessage(err, 'Error al guardar') });
  } finally {
    loading.value = false;
  }
}
</script>
