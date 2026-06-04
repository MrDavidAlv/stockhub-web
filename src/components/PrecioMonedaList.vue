<template>
  <div>
    <div class="row items-center q-mb-sm">
      <div class="text-subtitle2 col">Precios</div>
      <q-btn
        flat
        dense
        icon="add"
        label="Agregar"
        color="primary"
        :disable="monedasDisponibles.length === 0"
        @click="add"
      />
    </div>

    <div v-if="modelValue.length === 0" class="text-caption text-grey-7 q-py-sm">
      Sin precios. Agrega al menos uno.
    </div>

    <div
      v-for="(item, idx) in modelValue"
      :key="idx"
      class="row q-col-gutter-sm items-center q-mb-xs"
    >
      <div class="col-4">
        <q-select
          :model-value="item.moneda"
          :options="monedasParaFila(item.moneda)"
          label="Moneda"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="(v) => updateMoneda(idx, v)"
        />
      </div>
      <div class="col-6">
        <q-input
          :model-value="item.precio"
          type="number"
          step="0.01"
          min="0"
          label="Precio"
          outlined
          dense
          @update:model-value="(v) => updatePrecio(idx, v)"
        />
      </div>
      <div class="col-2 text-right">
        <q-btn flat round dense icon="delete" color="negative" aria-label="Quitar precio" @click="remove(idx)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Moneda, PrecioMoneda } from 'src/types';

const props = defineProps<{ modelValue: PrecioMoneda[] }>();
const emit = defineEmits<{ 'update:modelValue': [PrecioMoneda[]] }>();

const TODAS: Moneda[] = ['COP', 'USD', 'EUR', 'GBP'];

const monedasUsadas = computed(() => new Set(props.modelValue.map((p) => p.moneda)));

const monedasDisponibles = computed(() => TODAS.filter((m) => !monedasUsadas.value.has(m)));

function monedasParaFila(actual: Moneda): Moneda[] {
  return TODAS.filter((m) => m === actual || !monedasUsadas.value.has(m));
}

function update(items: PrecioMoneda[]) {
  emit('update:modelValue', items);
}

function add() {
  const siguiente = monedasDisponibles.value[0];
  if (!siguiente) return;
  update([...props.modelValue, { moneda: siguiente, precio: 0 }]);
}

function remove(idx: number) {
  const copy = [...props.modelValue];
  copy.splice(idx, 1);
  update(copy);
}

function updateMoneda(idx: number, moneda: Moneda) {
  const copy = [...props.modelValue];
  const item = copy[idx];
  if (!item) return;
  copy[idx] = { moneda, precio: item.precio };
  update(copy);
}

function updatePrecio(idx: number, valor: string | number | null) {
  const copy = [...props.modelValue];
  const item = copy[idx];
  if (!item) return;
  const precio = typeof valor === 'number' ? valor : Number(valor ?? 0);
  copy[idx] = { moneda: item.moneda, precio: Number.isFinite(precio) ? precio : 0 };
  update(copy);
}
</script>
