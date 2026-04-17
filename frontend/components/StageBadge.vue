<script setup lang="ts">
import type { TransactionStage } from '~/stores/transactions';

const props = defineProps<{ stage: TransactionStage | string }>();

const config: Record<string, { label: string; classes: string }> = {
  agreement: {
    label: 'Agreement',
    classes: 'bg-amber-100 text-amber-700 ring-amber-300',
  },
  earnest_money: {
    label: 'Earnest Money',
    classes: 'bg-blue-100 text-blue-700 ring-blue-300',
  },
  title_deed: {
    label: 'Title Deed',
    classes: 'bg-violet-100 text-violet-700 ring-violet-300',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
  },
};

const current = computed(
  () => config[props.stage] ?? { label: props.stage, classes: 'bg-slate-100 text-slate-600 ring-slate-300' },
);
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1"
    :class="current.classes"
  >
    {{ current.label }}
  </span>
</template>
