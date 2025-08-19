import { vi } from "vitest";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("localStorage", () => {
  let store = {} as Storage;
  return {
    default: {
      getItem(key: string) {
        return store[key];
      },

      setItem(key: string, value: string) {
        store[key] = value;
      },

      removeItem(key: string) {
        delete store[key];
      },

      clear() {
        store = {} as Storage;
      }
    }
  };
});
