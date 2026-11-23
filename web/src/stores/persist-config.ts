import type { PersistStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";

/**
 * Default localStorage backend for Zustand persist middleware.
 * Parses JSON on read and serializes on write.
 */
const localStorageStorage: PersistStorage<object, unknown> = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

/**
 * Creates standardized persist options for Zustand stores.
 * All stores should use this helper so that storage, naming, and
 * versioning are consistent across the codebase.
 *
 * @param params - The store persist configuration.
 * @returns Persist options object to pass to the persist middleware.
 *
 * @example
 * ```ts
 * const useStore = create<MyStore>()(
 *   persist(
 *     (set, get) => ({ ... }),
 *     createPersistOptions({
 *       name: "my-store",
 *       version: 1,
 *     }),
 *   ),
 * );
 * ```
 */
export function createPersistOptions<T>(params: {
  name: string;
  version: number;
  partialize?: (state: T) => Partial<T>;
  migrate?: (state: unknown, version: number) => T;
}) {
  const { name, version, partialize, migrate } = params;

  return {
    name,
    version,
    storage: localStorageStorage,
    ...(partialize && { partialize }),
    ...(migrate && { migrate }),
  } as const;
}

/**
 * Migrates a persisted state by casting it to the target type.
 * Useful for simple stores where the shape has not changed between versions.
 *
 * @param state - The persisted state.
 * @param _version - The version being migrated from (unused in simple migration).
 * @returns The state cast to the target type.
 */
export function simpleMigrate<T>(state: unknown, _version: number): T {
  return state as Partial<T> as T;
}

export { persist };
