<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionsStore } from '~/stores/transactions';
import { useCatalogStore } from '~/stores/catalog';

// ── stores ────────────────────────────────────────────────────
const txStore = useTransactionsStore();
const catalogStore = useCatalogStore();

const { transactions, isLoading, error } = storeToRefs(txStore);
const { agents, properties, isLoading: catalogLoading } = storeToRefs(catalogStore);

onMounted(() => {
  txStore.fetchTransactions();
  if (!agents.value.length || !properties.value.length) {
    catalogStore.fetchAll();
  }
});

const propertyTitle = (id: string) =>
  properties.value.find((p) => p._id === id)?.title ?? id.slice(-8);

const agentName = (id: string) =>
  agents.value.find((a) => a._id === id)?.name ?? id.slice(-8);

// ── modal state ───────────────────────────────────────────────
const showModal = ref(false);

const emptyForm = () => ({
  propertyId: '',
  listingAgentId: '',
  sellingAgentId: '',
  totalServiceFee: null as number | null,
  agreedAt: new Date().toISOString().slice(0, 10), // default: today
});

const form = ref(emptyForm());
const submitError = ref<string | null>(null);
const isSubmitting = ref(false);

async function openModal() {
  form.value = emptyForm();
  submitError.value = null;
  // Load dropdown data only once per session
  if (!agents.value.length && !properties.value.length) {
    await catalogStore.fetchAll();
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function handleSubmit() {
  if (
    !form.value.propertyId ||
    !form.value.listingAgentId ||
    !form.value.sellingAgentId ||
    !form.value.totalServiceFee ||
    !form.value.agreedAt
  ) {
    submitError.value = 'Please fill in all fields.';
    return;
  }

  isSubmitting.value = true;
  submitError.value = null;
  try {
    await txStore.createTransaction({
      propertyId: form.value.propertyId,
      listingAgentId: form.value.listingAgentId,
      sellingAgentId: form.value.sellingAgentId,
      totalServiceFee: Number(form.value.totalServiceFee),
      agreedAt: new Date(form.value.agreedAt).toISOString(),
    });
    closeModal();
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : 'Failed to create transaction.';
  } finally {
    isSubmitting.value = false;
  }
}

// ── formatting ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TRY' }).format(n);

// Close modal on Escape
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
</script>

<template>
  <div>
    <!-- ── Header ────────────────────────────────────────────── -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Transactions</h1>
        <p class="mt-1 text-sm text-slate-500">All real estate transactions</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          @click="txStore.fetchTransactions()"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
          Refresh
        </button>

        <!-- New transaction button -->
        <button
          class="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          @click="openModal"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          New Transaction
        </button>
      </div>
    </div>

    <!-- ── List loading / error ───────────────────────────────── -->
    <div v-if="isLoading" class="flex items-center gap-2 text-sm text-slate-500">
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading…
    </div>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-else>
      <div
        v-if="transactions.length === 0"
        class="rounded-xl border border-dashed border-slate-300 p-16 text-center text-sm text-slate-400"
      >
        No transactions found.
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Property</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agents</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Service Fee</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agreement Date</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="tx in transactions"
              :key="tx._id"
              class="transition hover:bg-slate-50"
            >
              <!-- Property -->
              <td class="px-4 py-3">
                <p class="font-medium text-slate-800">{{ propertyTitle(tx.propertyId) }}</p>
                <p class="font-mono text-xs text-slate-400">{{ tx._id.slice(-8) }}</p>
              </td>
              <!-- Agents -->
              <td class="px-4 py-3">
                <p class="text-xs text-slate-700">
                  <span class="font-medium text-slate-500">L:</span>
                  {{ agentName(tx.listingAgentId) }}
                </p>
                <p class="text-xs text-slate-700">
                  <span class="font-medium text-slate-500">S:</span>
                  {{ agentName(tx.sellingAgentId) }}
                </p>
              </td>
              <td class="px-4 py-3 font-semibold text-slate-800">{{ fmt(tx.totalServiceFee) }}</td>
              <td class="px-4 py-3"><StageBadge :stage="tx.stage" /></td>
              <td class="px-4 py-3 text-slate-500">
                {{ new Date(tx.agreedAt).toLocaleDateString('en-US') }}
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink
                  :to="`/transactions/${tx._id}`"
                  class="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Details →
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="closeModal" />

          <!-- Panel -->
          <div
            class="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            @click.stop
          >
            <!-- Modal header -->
            <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 class="text-base font-semibold text-slate-900">New Transaction</h2>
              <button
                class="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                @click="closeModal"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal body -->
            <div class="px-6 py-5">
              <!-- Catalog loading indicator -->
              <div
                v-if="catalogLoading"
                class="mb-4 flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-600"
              >
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading properties and agents…
              </div>

              <form class="space-y-4" @submit.prevent="handleSubmit">
                <!-- Property -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">
                    Property <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.propertyId"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    :disabled="catalogLoading"
                  >
                    <option value="" disabled>Select a property…</option>
                    <option
                      v-for="p in properties"
                      :key="p._id"
                      :value="p._id"
                    >
                      {{ p.title }} — {{ p.address }}
                    </option>
                  </select>
                </div>

                <!-- Listing Agent -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">
                    Listing Agent <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.listingAgentId"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    :disabled="catalogLoading"
                  >
                    <option value="" disabled>Select an agent…</option>
                    <option
                      v-for="a in agents"
                      :key="a._id"
                      :value="a._id"
                    >
                      {{ a.name }}
                    </option>
                  </select>
                </div>

                <!-- Selling Agent -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">
                    Selling Agent <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.sellingAgentId"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    :disabled="catalogLoading"
                  >
                    <option value="" disabled>Select an agent…</option>
                    <option
                      v-for="a in agents"
                      :key="a._id"
                      :value="a._id"
                    >
                      {{ a.name }}
                    </option>
                  </select>
                  <p
                    v-if="form.listingAgentId && form.sellingAgentId && form.listingAgentId === form.sellingAgentId"
                    class="mt-1 text-xs text-amber-600"
                  >
                    Same agent selected — the full agent pool will go to this agent.
                  </p>
                </div>

                <!-- Total Service Fee -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">
                    Service Fee (₺) <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="form.totalServiceFee"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 50000"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <!-- Agreed At -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">
                    Agreement Date <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.agreedAt"
                    type="date"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <!-- Submit error -->
                <p v-if="submitError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {{ submitError }}
                </p>
              </form>
            </div>

            <!-- Modal footer -->
            <div class="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isSubmitting || catalogLoading"
                @click="handleSubmit"
              >
                <svg
                  v-if="isSubmitting"
                  class="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {{ isSubmitting ? 'Saving…' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(-8px);
  opacity: 0;
}
</style>
