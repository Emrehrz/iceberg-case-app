<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- Top navigation -->
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-lg font-bold tracking-tight text-slate-900">Iceberg</span>
          <span class="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
            Real Estate
          </span>
        </NuxtLink>
        <nav class="flex items-center gap-1">
          <NuxtLink
            to="/"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-100 text-slate-900"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/transactions"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-100 text-slate-900"
          >
            Transactions
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Page content -->
    <main class="mx-auto max-w-6xl px-6 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
