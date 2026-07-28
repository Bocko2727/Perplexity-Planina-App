import type { StorageAdapter } from "../types";

export const storageAdapter: StorageAdapter = {
  async get(key: string, _global: boolean) {
    if (typeof window !== "undefined" && (window as any).storage) {
      return (window as any).storage.get(key, _global);
    }
    if (typeof window !== "undefined" && window.localStorage) {
      const v = window.localStorage.getItem(key);
      return v ? { value: v } : null;
    }
    return null;
  },
  async set(key: string, value: string, _global: boolean) {
    if (typeof window !== "undefined" && (window as any).storage) {
      return (window as any).storage.set(key, value, _global);
    }
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
};
