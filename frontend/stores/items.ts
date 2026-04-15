import { defineStore } from 'pinia';

export interface Item {
  _id: string;
  title: string;
  description: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateItemPayload {
  title: string;
  description?: string;
}

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: [] as Item[],
    isLoading: false,
    error: '' as string | null,
  }),
  actions: {
    async fetchItems() {
      this.isLoading = true;
      this.error = null;
      try {
        this.items = await useApiFetch<Item[]>('/items');
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Items getirilemedi.';
      } finally {
        this.isLoading = false;
      }
    },
    async addItem(payload: CreateItemPayload) {
      this.error = null;
      try {
        const item = await useApiFetch<Item>('/items', {
          method: 'POST',
          body: payload,
        });
        this.items.unshift(item);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Item eklenemedi.';
      }
    },
  },
});
