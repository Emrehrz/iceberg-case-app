<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionsStore } from '~/stores/transactions';
import type { TransactionStage } from '~/types/transactions';
import { useCatalogStore } from '~/stores/catalog';

const route = useRoute();
const id = route.params.id as string;

const store = useTransactionsStore();
const catalogStore = useCatalogStore();

const { currentTransaction: tx, isLoading, error } = storeToRefs(store);
const { agents, properties } = storeToRefs(catalogStore);

onMounted(() => {
  store.fetchTransaction(id);
  if (!agents.value.length || !properties.value.length) {
    catalogStore.fetchAll();
  }
});

const propertyTitle = (id: string) =>
  properties.value.find((p) => p._id === id)?.title ?? id.slice(-8);

const agentName = (id: string) =>
  agents.value.find((a) => a._id === id)?.name ?? id.slice(-8);

// ── Stage machine ──────────────────────────────────────────────
const STAGES: TransactionStage[] = ['agreement', 'earnest_money', 'title_deed', 'completed'];

const stageLabel: Record<TransactionStage, string> = {
  agreement: 'Agreement',
  earnest_money: 'Earnest Money',
  title_deed: 'Title Deed',
  completed: 'Completed',
};

const currentStageIndex = computed(() =>
  tx.value ? STAGES.indexOf(tx.value.stage) : -1,
);

const nextStage = computed<TransactionStage | null>(() => {
  const idx = currentStageIndex.value;
  if (idx < 0 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1];
});

const isUpdating = ref(false);
const updateError = ref<string | null>(null);

async function advance() {
  if (!nextStage.value || !tx.value) return;
  isUpdating.value = true;
  updateError.value = null;
  try {
    await store.updateTransactionStage(id, { stage: nextStage.value });
  } catch (e) {
    updateError.value = e instanceof Error ? e.message : 'Failed to update stage.';
  } finally {
    isUpdating.value = false;
  }
}

// ── Formatters ─────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TRY' }).format(n);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleString('en-US') : '—';
</script>

<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/transactions"
      class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
    >
      ← Transactions
    </NuxtLink>

    <!-- Loading / error -->
    <div v-if="isLoading && !tx" class="flex items-center gap-2 text-sm text-slate-500">
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading…
    </div>
    <p v-else-if="error && !tx" class="text-sm text-red-600">{{ error }}</p>

    <template v-if="tx">
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            {{ propertyTitle(tx.propertyId) }}
          </h1>
          <p class="mt-1 font-mono text-xs text-slate-400">{{ tx._id }}</p>
        </div>
        <StageBadge :stage="tx.stage" />
      </div>

      <!-- Info grid -->
      <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Property -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Property
          </p>
          <p class="mt-1.5 text-sm font-bold text-slate-900">
            {{ propertyTitle(tx.propertyId) }}
          </p>
          <p class="mt-0.5 font-mono text-xs text-slate-400">{{ tx.propertyId.slice(-8) }}</p>
        </div>

        <!-- Agents -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Agents
          </p>
          <div class="mt-1.5 space-y-1">
            <div class="flex items-center gap-2">
              <span class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">L</span>
              <span class="text-sm font-medium text-slate-800">{{ agentName(tx.listingAgentId) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">S</span>
              <span class="text-sm font-medium text-slate-800">{{ agentName(tx.sellingAgentId) }}</span>
            </div>
          </div>
        </div>

        <!-- Service Fee -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Service Fee
          </p>
          <p class="mt-1.5 text-xl font-bold text-slate-900">
            {{ fmt(tx.totalServiceFee) }}
          </p>
        </div>

        <!-- Agreement Date -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Agreement Date
          </p>
          <p class="mt-1.5 text-sm font-semibold text-slate-900">
            {{ fmtDate(tx.agreedAt) }}
          </p>
        </div>

        <!-- Completion Date -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Completion Date
          </p>
          <p class="mt-1.5 text-sm font-semibold text-slate-900">
            {{ fmtDate(tx.completedAt) }}
          </p>
        </div>
      </div>

      <!-- ── Stage Stepper ─────────────────────────────────────── -->
      <div class="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-5 text-base font-semibold text-slate-800">Stages</h2>

        <ol class="relative flex items-start">
          <li
            v-for="(stage, idx) in STAGES"
            :key="stage"
            class="flex flex-1 flex-col items-center"
          >
            <!-- connector line before each step except first -->
            <div class="relative flex w-full items-center justify-center">
              <!-- left connector -->
              <div
                v-if="idx > 0"
                class="absolute left-0 top-4 h-0.5 w-1/2 transition-colors"
                :class="idx <= currentStageIndex ? 'bg-indigo-500' : 'bg-slate-200'"
              />
              <!-- right connector -->
              <div
                v-if="idx < STAGES.length - 1"
                class="absolute right-0 top-4 h-0.5 w-1/2 transition-colors"
                :class="idx < currentStageIndex ? 'bg-indigo-500' : 'bg-slate-200'"
              />

              <!-- Circle -->
              <div
                class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
                :class="{
                  'border-indigo-500 bg-indigo-500 text-white': idx < currentStageIndex,
                  'border-indigo-500 bg-white text-indigo-600':
                    idx === currentStageIndex && stage !== 'completed',
                  'border-emerald-500 bg-emerald-500 text-white': stage === 'completed' && idx === currentStageIndex,
                  'border-slate-300 bg-white text-slate-400': idx > currentStageIndex,
                }"
              >
                <!-- Check icon for past steps and completed -->
                <svg
                  v-if="idx < currentStageIndex || (stage === 'completed' && idx === currentStageIndex)"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <!-- Step number for current / future -->
                <span v-else class="text-xs font-bold">{{ idx + 1 }}</span>
              </div>
            </div>

            <!-- Label -->
            <p
              class="mt-2 text-center text-xs font-medium"
              :class="{
                'text-indigo-600': idx === currentStageIndex && stage !== 'completed',
                'text-emerald-600': stage === 'completed' && idx === currentStageIndex,
                'text-slate-700': idx < currentStageIndex,
                'text-slate-400': idx > currentStageIndex,
              }"
            >
              {{ stageLabel[stage] }}
            </p>
          </li>
        </ol>

        <!-- Advance button -->
        <div v-if="nextStage" class="mt-6 flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isUpdating"
            @click="advance"
          >
            <svg
              v-if="isUpdating"
              class="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Advance to {{ stageLabel[nextStage] }}
          </button>
          <p v-if="updateError" class="text-sm text-red-600">{{ updateError }}</p>
        </div>
        <p
          v-else
          class="mt-5 text-sm font-medium text-emerald-600"
        >
          ✓ Transaction completed — no further changes allowed.
        </p>
      </div>

      <!-- ── Commission Breakdown (only when completed) ────────── -->
      <Transition name="fade">
        <div
          v-if="tx.stage === 'completed' && tx.commissionBreakdown"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm"
        >
          <div class="mb-4 flex items-center gap-2">
            <svg
              class="h-5 w-5 text-emerald-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
            <h2 class="text-base font-semibold text-emerald-800">
              Commission Breakdown
            </h2>
            <span
              class="ml-auto rounded bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700"
            >
              {{ tx.commissionBreakdown.ruleVersion }}
            </span>
          </div>

          <!-- Agency share -->
          <div class="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-4 py-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Agency Share (50%)
              </p>
              <p class="mt-0.5 text-lg font-bold text-slate-900">
                {{ fmt(tx.commissionBreakdown.agency) }}
              </p>
            </div>
            <svg class="h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14v-4H7l5-8v4h4l-5 8z" />
            </svg>
          </div>

          <!-- Agent snapshots -->
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Agent Shares
          </p>
          <ul class="space-y-2">
            <li
              v-for="agent in tx.commissionBreakdown.agents"
              :key="agent.agentId"
              class="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-4 py-3"
            >
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ agent.name }}</p>
                <span
                  class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="{
                    'bg-amber-100 text-amber-700': agent.role === 'listing',
                    'bg-blue-100 text-blue-700': agent.role === 'selling',
                    'bg-violet-100 text-violet-700': agent.role === 'both',
                  }"
                >
                  {{
                    agent.role === 'listing'
                      ? 'Listing'
                      : agent.role === 'selling'
                      ? 'Selling'
                      : 'Both'
                  }}
                </span>
              </div>
              <p class="text-base font-bold text-slate-900">{{ fmt(agent.amount) }}</p>
            </li>
          </ul>

          <p class="mt-3 text-right text-xs text-slate-400">
            Calculated: {{ fmtDate(tx.commissionBreakdown.calculatedAt) }}
          </p>
        </div>
      </Transition>

      <!-- Stage history -->
      <div
        v-if="tx.stageHistory && tx.stageHistory.length"
        class="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 class="mb-3 text-base font-semibold text-slate-800">Stage History</h2>
        <ol class="space-y-2">
          <li
            v-for="(entry, i) in tx.stageHistory"
            :key="i"
            class="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
          >
            <StageBadge :stage="entry.stage as TransactionStage" />
            <span class="text-xs text-slate-400">{{ fmtDate(entry.changedAt) }}</span>
          </li>
        </ol>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
