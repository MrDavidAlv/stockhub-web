<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-col-gutter-md">
      <div class="text-h5 col">Productos</div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="filtroEmpresa"
          :options="empresaOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Filtrar por empresa"
          outlined
          dense
          clearable
          @update:model-value="load"
        />
      </div>
      <q-btn color="primary" icon="add" label="Nuevo producto" unelevated @click="openForm(null)" />
    </div>

    <q-table
      :rows="productos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50, 0]"
      no-data-label="Sin productos"
    >
      <template v-slot:body-cell-precios="props">
        <q-td :props="props">
          <q-chip
            v-for="p in props.row.precios"
            :key="p.moneda"
            dense
            size="sm"
            color="primary"
            text-color="white"
          >
            {{ p.moneda }} {{ p.precio }}
          </q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-categorias="props">
        <q-td :props="props">
          <q-chip v-for="c in props.row.categorias" :key="c.id" dense size="sm">
            {{ c.nombre }}
          </q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn flat round dense icon="edit" color="primary" aria-label="Editar producto" @click="openForm(props.row)" />
          <q-btn flat round dense icon="delete" color="negative" aria-label="Eliminar producto" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <ProductoForm :producto="selected" @saved="onSaved" @cancel="showForm = false" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar, type QTableProps } from 'quasar';
import { productoService } from 'src/services/producto.service';
import { empresaService } from 'src/services/empresa.service';
import ProductoForm from 'components/ProductoForm.vue';
import type { Producto } from 'src/types';
import { getApiErrorMessage } from 'src/utils/error';

const $q = useQuasar();

const productos = ref<Producto[]>([]);
const empresaOptions = ref<{ value: string; label: string }[]>([]);
const filtroEmpresa = ref<string | null>(null);
const loading = ref(false);
const showForm = ref(false);
const selected = ref<Producto | null>(null);

const columns: QTableProps['columns'] = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'empresa', label: 'Empresa', field: 'empresaNombre', align: 'left' },
  { name: 'categorias', label: 'Categorias', field: 'categorias', align: 'left' },
  { name: 'precios', label: 'Precios', field: 'precios', align: 'left' },
  { name: 'acciones', label: '', field: 'id', align: 'right' },
];

async function load() {
  loading.value = true;
  try {
    productos.value = filtroEmpresa.value
      ? await productoService.findByEmpresa(filtroEmpresa.value)
      : await productoService.findAll();
  } catch (err) {
    $q.notify({ type: 'negative', message: getApiErrorMessage(err) });
  } finally {
    loading.value = false;
  }
}

async function loadEmpresas() {
  try {
    const empresas = await empresaService.findAll();
    empresaOptions.value = empresas.map((e) => ({ value: e.nit, label: `${e.nombre} (${e.nit})` }));
  } catch (err) {
    $q.notify({ type: 'negative', message: getApiErrorMessage(err) });
  }
}

function openForm(producto: Producto | null) {
  selected.value = producto;
  showForm.value = true;
}

function onSaved() {
  showForm.value = false;
  void load();
}

function confirmDelete(producto: Producto) {
  $q.dialog({
    title: 'Eliminar producto',
    message: `Seguro de eliminar ${producto.nombre}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        await productoService.delete(producto.id);
        $q.notify({ type: 'positive', message: 'Producto eliminado' });
        await load();
      } catch (err) {
        $q.notify({ type: 'negative', message: getApiErrorMessage(err) });
      }
    })();
  });
}

onMounted(async () => {
  await loadEmpresas();
  await load();
});
</script>
