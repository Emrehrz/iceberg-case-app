export function useApiFetch<T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  const config = useRuntimeConfig();

  return $fetch<T>(path, {
    baseURL: config.public.apiBase,
    ...options,
  });
}
