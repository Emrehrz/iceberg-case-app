import { defineStore } from 'pinia';

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Property {
  _id: string;
  title: string;
  address: string;
  type: string;
  price: number;
  listingAgentId: string;
  createdAt: string;
}

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    agents: [] as Agent[],
    properties: [] as Property[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAll() {
      this.isLoading = true;
      this.error = null;
      try {
        const [agents, properties] = await Promise.all([
          useApiFetch<Agent[]>('/agents'),
          useApiFetch<Property[]>('/properties'),
        ]);
        this.agents = agents;
        this.properties = properties;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to load catalog data.';
      } finally {
        this.isLoading = false;
      }
    },
  },
});
