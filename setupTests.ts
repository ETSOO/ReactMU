import { vi } from "vitest";

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
