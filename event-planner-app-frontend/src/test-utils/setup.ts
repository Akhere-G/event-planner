import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// This Vitest/jsdom combination doesn't reliably expose a working
// `localStorage` on the global object, but `apiSlice.ts` reads it on every
// request (`prepareHeaders`), so every test needs a working stand-in.
if (
  typeof globalThis.localStorage === "undefined" ||
  typeof globalThis.localStorage.getItem !== "function"
) {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() {
      return this.store.size;
    }
    clear() {
      this.store.clear();
    }
    getItem(key: string) {
      return this.store.has(key) ? this.store.get(key)! : null;
    }
    key(index: number) {
      return Array.from(this.store.keys())[index] ?? null;
    }
    removeItem(key: string) {
      this.store.delete(key);
    }
    setItem(key: string, value: string) {
      this.store.set(key, String(value));
    }
  }

  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}

// jsdom doesn't implement layout geometry; react-big-calendar's mouse
// selection addon calls this on every click/drag anywhere in the document.
if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
