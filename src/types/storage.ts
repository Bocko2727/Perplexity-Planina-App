/* Abstracts persistence: uses window.storage (Perplexity env) if available,
   falls back to localStorage for Netlify/Vercel deployments. */
export interface StorageAdapter {
  get(key: string, global: boolean): Promise<{ value: string } | null>;
  set(key: string, value: string, global: boolean): Promise<void>;
}
