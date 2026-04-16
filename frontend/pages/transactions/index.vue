<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionsStore } from '~/stores/transactions';

const store = useTransactionsStore();
const { transactions, isLoading, error } = storeToRefs(store);

onMounted(() => store.fetchTransactions());

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Transactions</h1>
        <p class="mt-1 text-sm text-slate-500">Tüm gayrimenkul işlemleri</p>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        @click="store.fetchTransactions()"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
        Yenile
      </button>
    </div>

    <!-- States -->
    <div v-if="isLoading" class="flex items-center gap-2 text-sm text-slate-500">
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Yükleniyor…
    </div>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-else>
      <!-- Empty state -->
      <div
        v-if="transactions.length === 0"
        class="rounded-xl border border-dashed border-slate-300 p-16 text-center text-sm text-slate-400"
      >
        Henüz kayıtlı işlem yok.
      </div>

      <!-- Table -->
      <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                ID
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Hizmet Bedeli
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Durum
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Anlaşma Tarihi
              </th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="tx in transactions"
              :key="tx._id"
              class="transition hover:bg-slate-50"
            >
              <td class="px-4 py-3 font-mono text-xs text-slate-500">
                {{ tx._id.slice(-8) }}
              </td>
              <td class="px-4 py-3 font-semibold text-slate-800">
                {{ fmt(tx.totalServiceFee) }}
              </td>
              <td class="px-4 py-3">
                <StageBadge :stage="tx.stage" />
              </td>
              <td class="px-4 py-3 text-slate-500">
                {{ new Date(tx.agreedAt).toLocaleDateString('tr-TR') }}
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink
                  :to="`/transactions/${tx._id}`"
                  class="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Detay →
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
