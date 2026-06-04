<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-col-gutter-md">
      <div class="text-h5 col">Inventario</div>
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
      <q-btn
        color="secondary"
        icon="download"
        label="Descargar PDF"
        :loading="downloading"
        :disable="!hasInventario"
        @click="onDownload"
        unelevated
      >
        <q-tooltip v-if="!hasInventario">Sin productos para exportar</q-tooltip>
      </q-btn>
      <q-btn
        color="primary"
        icon="mail"
        label="Enviar por email"
        :disable="!hasInventario"
        @click="openEmailDialog"
        unelevated
      >
        <q-tooltip v-if="!hasInventario">Sin productos para enviar</q-tooltip>
      </q-btn>
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
    </q-table>

    <q-dialog v-model="showEmail">
      <q-card style="width: 380px">
        <q-card-section>
          <div class="text-h6">Enviar inventario por email</div>
        </q-card-section>
        <q-separator />
        <q-form @submit.prevent="onSendEmail">
          <q-card-section>
            <q-input
              v-model="emailDestino"
              label="Email destinatario"
              type="email"
              outlined
              :rules="[(v) => !!v || 'Requerido', (v) => /.+@.+\..+/.test(v) || 'Email invalido']"
            />
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" @click="showEmail = false" />
            <q-btn type="submit" color="primary" label="Enviar" :loading="sending" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableProps } from 'quasar';
import { inventarioService } from 'src/services/inventario.service';
import { empresaService } from 'src/services/empresa.service';
import type { Producto } from 'src/types';
import { getApiErrorMessage } from 'src/utils/error';

const $q = useQuasar();

const productos = ref<Producto[]>([]);
const hasInventario = computed(() => productos.value.length > 0);
const empresaOptions = ref<{ value: string; label: string }[]>([]);
const filtroEmpresa = ref<string | null>(null);
const loading = ref(false);
const downloading = ref(false);
const sending = ref(false);
const showEmail = ref(false);
const emailDestino = ref('');

const columns: QTableProps['columns'] = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'empresa', label: 'Empresa', field: 'empresaNombre', align: 'left' },
  { name: 'categorias', label: 'Categorias', field: 'categorias', align: 'left' },
  { name: 'precios', label: 'Precios', field: 'precios', align: 'left' },
];

async function load() {
  loading.value = true;
  try {
    productos.value = await inventarioService.list(filtroEmpresa.value);
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

function openEmailDialog() {
  if (!hasInventario.value) {
    warnEmpty();
    return;
  }
  showEmail.value = true;
}

function warnEmpty() {
  $q.notify({
    type: 'warning',
    message: 'El inventario esta vacio. Crea productos antes de descargar o enviar.',
    icon: 'warning',
    timeout: 4000,
  });
}

async function onDownload() {
  if (!hasInventario.value) {
    warnEmpty();
    return;
  }
  downloading.value = true;
  try {
    const blob = await inventarioService.downloadPdf(filtroEmpresa.value);
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.pdf';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    $q.notify({ type: 'negative', message: getApiErrorMessage(err, 'No se pudo descargar') });
  } finally {
    downloading.value = false;
  }
}

async function onSendEmail() {
  if (!hasInventario.value) {
    warnEmpty();
    return;
  }
  sending.value = true;
  try {
    await inventarioService.sendByEmail({
      email: emailDestino.value,
      empresaNit: filtroEmpresa.value,
    });
    $q.notify({ type: 'positive', message: 'Email enviado' });
    showEmail.value = false;
    emailDestino.value = '';
  } catch (err) {
    $q.notify({ type: 'negative', message: getApiErrorMessage(err, 'No se pudo enviar') });
  } finally {
    sending.value = false;
  }
}

onMounted(async () => {
  await loadEmpresas();
  await load();
});
</script>
