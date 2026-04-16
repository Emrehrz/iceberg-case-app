<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionsStore } from '~/stores/transactions';

const store = useTransactionsStore();
const { transactions, isLoading, error, totalTransactionVolume, totalAgencyEarnings } =
  storeToRefs(store);

onMounted(() => store.fetchTransactions());

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">Tüm işlemlerin özeti</p>
    </div>

    <!-- Loading / error states -->
    <div v-if="isLoading" class="flex items-center gap-2 text-sm text-slate-500">
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Yükleniyor…
    </div>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <!-- Stat cards -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Total transactions -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Toplam İşlem
        </p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ transactions.length }}</p>
      </div>

      <!-- Total volume -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Toplam Hizmet Bedeli
        </p>
        <p class="mt-2 text-3xl font-bold text-slate-900">
          {{ fmt(totalTransactionVolume) }}
        </p>
      </div>

      <!-- Agency earnings (completed only) -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Agency Kazancı (Tamamlanan)
        </p>
        <p class="mt-2 text-3xl font-bold text-indigo-600">
          {{ fmt(totalAgencyEarnings) }}
        </p>
      </div>
    </div>

    <!-- Recent transactions preview -->
    <div v-if="!isLoading && !error" class="mt-8">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-base font-semibold text-slate-800">Son İşlemler</h2>
        <NuxtLink
          to="/transactions"
          class="text-xs font-medium text-indigo-600 hover:underline"
        >
          Tümünü gör →
        </NuxtLink>
      </div>
      <div
        v-if="transactions.length === 0"
        class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400"
      >
        Henüz işlem yok.
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="tx in transactions.slice(0, 5)"
          :key="tx._id"
          class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ tx._id }}</p>
            <p class="text-xs text-slate-400">
              {{ new Date(tx.agreedAt).toLocaleDateString('tr-TR') }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-700">
              {{ fmt(tx.totalServiceFee) }}
            </span>
            <StageBadge :stage="tx.stage" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
