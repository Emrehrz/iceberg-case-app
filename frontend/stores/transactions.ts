import { defineStore } from 'pinia';

export type TransactionStage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed';

export interface StageHistoryEntry {
  stage: TransactionStage | string;
  changedAt: string;
}

export interface AgentSnapshot {
  agentId: string;
  name: string;
  role: 'listing' | 'selling' | 'both';
  amount: number;
}

export interface CommissionBreakdown {
  agency: number;
  agents: AgentSnapshot[];
  calculatedAt: string;
  ruleVersion: string;
}

export interface Transaction {
  _id: string;
  propertyId: string;
  listingAgentId: string;
  sellingAgentId: string;
  stage: TransactionStage;
  totalServiceFee: number;
  commissionBreakdown?: CommissionBreakdown;
  agreedAt: string;
  completedAt?: string;
  stageHistory: StageHistoryEntry[];
}

interface CreateTransactionPayload {
  propertyId: string;
  listingAgentId: string;
  sellingAgentId: string;
  totalServiceFee: number;
  agreedAt: string; // ISO string expected by backend validation
}

interface UpdateTransactionStagePayload {
  stage: TransactionStage;
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    currentTransaction: null as Transaction | null,
    isLoading: false,
    error: '' as string | null,
  }),
  getters: {
    completedTransactions(state): Transaction[] {
      return state.transactions.filter((t) => t.stage === 'completed');
    },
    totalTransactionVolume(state): number {
      return state.transactions.reduce(
        (acc, t) => acc + (t.totalServiceFee ?? 0),
        0,
      );
    },
    totalAgencyEarnings(state): number {
      return state.transactions.reduce((acc, t) => {
        if (t.stage !== 'completed' || !t.commissionBreakdown) return acc;
        return acc + (t.commissionBreakdown.agency ?? 0);
      }, 0);
    },
    isCurrentCompleted(state): boolean {
      return state.currentTransaction?.stage === 'completed';
    },
  },
  actions: {
    async fetchTransactions() {
      this.isLoading = true;
      this.error = null;
      try {
        this.transactions = await useApiFetch<Transaction[]>('/transactions');
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Transactions getirilemedi.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTransaction(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const tx = await useApiFetch<Transaction>(`/transactions/${id}`);
        this.currentTransaction = tx;

        const idx = this.transactions.findIndex((t) => t._id === tx._id);
        if (idx >= 0) this.transactions[idx] = tx;
        else this.transactions.unshift(tx);

        return tx;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Transaction getirilemedi.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createTransaction(payload: CreateTransactionPayload) {
      this.isLoading = true;
      this.error = null;
      try {
        const created = await useApiFetch<Transaction>('/transactions', {
          method: 'POST',
          body: payload,
        });
        this.transactions.unshift(created);
        return created;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Transaction eklenemedi.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateTransactionStage(id: string, payload: UpdateTransactionStagePayload) {
      // İsteğe bağlı UX koruması: frontend completed iken tekrar patch atmayalım.
      const existing =
        this.currentTransaction?._id === id ? this.currentTransaction : null;
      if (existing?.stage === 'completed') return existing;

      this.isLoading = true;
      this.error = null;
      try {
        const updated = await useApiFetch<Transaction>(`/transactions/${id}/stage`, {
          method: 'PATCH',
          body: payload,
        });

        const idx = this.transactions.findIndex((t) => t._id === updated._id);
        if (idx >= 0) this.transactions[idx] = updated;
        else this.transactions.unshift(updated);

        if (this.currentTransaction?._id === updated._id) {
          this.currentTransaction = updated;
        }

        return updated;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Stage güncellenemedi.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

