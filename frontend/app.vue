<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useItemsStore } from '~/stores/items';

const itemsStore = useItemsStore();
const { items, isLoading, error } = storeToRefs(itemsStore);

const title = ref('');
const description = ref('');

onMounted(async () => {
  await itemsStore.fetchItems();
});

const submit = async () => {
  if (!title.value.trim()) {
    return;
  }

  await itemsStore.addItem({
    title: title.value.trim(),
    description: description.value.trim(),
  });

  title.value = '';
  description.value = '';
};
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl p-6">
    <section class="rounded-xl bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold">Iceberg Case App</h1>
      <p class="mt-1 text-sm text-slate-600">
        Nuxt 3 + Pinia frontend, NestJS + MongoDB backend boilerplate.
      </p>
    </section>

    <section class="mt-6 rounded-xl bg-white p-6 shadow-sm">
      <h2 class="text-lg font-medium">Yeni Item Ekle</h2>
      <form class="mt-4 space-y-3" @submit.prevent="submit">
        <input
          v-model="title"
          type="text"
          class="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Baslik"
        />
        <textarea
          v-model="description"
          class="w-full rounded-md border border-slate-300 px-3 py-2"
          rows="3"
          placeholder="Aciklama (opsiyonel)"
        />
        <button
          type="submit"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Ekle
        </button>
      </form>
    </section>

    <section class="mt-6 rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-medium">Items</h2>
        <button
          class="rounded-md border border-slate-300 px-3 py-1 text-sm"
          @click="itemsStore.fetchItems"
        >
          Yenile
        </button>
      </div>
      <p v-if="isLoading" class="text-sm text-slate-600">Yukleniyor...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <ul v-else class="space-y-2">
        <li
          v-for="item in items"
          :key="item._id"
          class="rounded-md border border-slate-200 p-3"
        >
          <p class="font-medium">{{ item.title }}</p>
          <p v-if="item.description" class="text-sm text-slate-600">
            {{ item.description }}
          </p>
        </li>
      </ul>
    </section>
  </main>
</template>
