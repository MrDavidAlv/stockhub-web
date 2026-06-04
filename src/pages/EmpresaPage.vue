<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Empresas</div>
      <q-btn
        v-if="authStore.isAdmin"
        color="primary"
        icon="add"
        label="Nueva empresa"
        unelevated
        @click="openForm(null)"
      />
    </div>

    <q-table
      :rows="empresas"
      :columns="columns"
      row-key="nit"
      :loading="loading"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50, 0]"
      no-data-label="Sin empresas registradas"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-xs">
          <template v-if="authStore.isAdmin">
            <q-btn flat round dense icon="edit" color="primary" aria-label="Editar empresa" @click="openForm(props.row)" />
            <q-btn flat round dense icon="delete" color="negative" aria-label="Eliminar empresa" @click="confirmDelete(props.row)" />
          </template>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <EmpresaForm :empresa="selected" @saved="onSaved" @cancel="showForm = false" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar, type QTableProps } from 'quasar';
import { useAuthStore } from 'src/stores/auth.store';
import { empresaService } from 'src/services/empresa.service';
import EmpresaForm from 'components/EmpresaForm.vue';
import type { Empresa } from 'src/types';
import { getApiErrorMessage } from 'src/utils/error';

const $q = useQuasar();
const authStore = useAuthStore();

const empresas = ref<Empresa[]>([]);
const loading = ref(false);
const showForm = ref(false);
const selected = ref<Empresa | null>(null);

const columns: QTableProps['columns'] = [
  { name: 'nit', label: 'NIT', field: 'nit', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'direccion', label: 'Direccion', field: (r) => r.direccion ?? '-', align: 'left' },
  { name: 'telefono', label: 'Telefono', field: (r) => r.telefono ?? '-', align: 'left' },
  { name: 'acciones', label: '', field: 'nit', align: 'right' },
];

async function load() {
  loading.value = true;
  try {
    empresas.value = await empresaService.findAll();
  } catch (err) {
    $q.notify({ type: 'negative', message: getApiErrorMessage(err) });
  } finally {
    loading.value = false;
  }
}

function openForm(empresa: Empresa | null) {
  selected.value = empresa;
  showForm.value = true;
}

function onSaved() {
  showForm.value = false;
  void load();
}

function confirmDelete(empresa: Empresa) {
  $q.dialog({
    title: 'Eliminar empresa',
    message: `Seguro de eliminar la empresa ${empresa.nombre} (${empresa.nit})?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        await empresaService.delete(empresa.nit);
        $q.notify({ type: 'positive', message: 'Empresa eliminada' });
        await load();
      } catch (err) {
        $q.notify({ type: 'negative', message: getApiErrorMessage(err) });
      }
    })();
  });
}

onMounted(load);
</script>
