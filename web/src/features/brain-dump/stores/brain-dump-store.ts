import type {
  BrainDumpReadStatus,
  BrainDumpThought,
} from "@/features/brain-dump/types/brain-dump";
import {
  createPersistOptions,
  persist,
  simpleMigrate,
} from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type BrainDumpStoreState = {
  thoughts: BrainDumpThought[];
  readStatus: BrainDumpReadStatus;
  readError: string | null;
  crossTabSupported: boolean;
};

const persistenceOptions = createPersistOptions<BrainDumpStoreState>({
  name: "brain-dump-storage",
  version: 1,
  partialize: (state) => ({ thoughts: state.thoughts }),
  migrate: simpleMigrate<BrainDumpStoreState>,
});

const persistedStorage = persistenceOptions.storage;
let suppressPersistWrite = false;

export const useBrainDumpStore = create<BrainDumpStoreState>()(
  persist(
    immer(
      (): BrainDumpStoreState => ({
        thoughts: [],
        readStatus: "loading",
        readError: null,
        crossTabSupported: false,
      }),
    ),
    {
      ...persistenceOptions,
      storage: {
        getItem: (name) => persistedStorage?.getItem(name) ?? null,
        setItem: (name, value) => {
          if (suppressPersistWrite) return;
          persistedStorage?.setItem(name, value);
        },
        removeItem: (name) => persistedStorage?.removeItem(name),
      },
      skipHydration: true,
    },
  ),
);

export const setBrainDumpState = (partial: Partial<BrainDumpStoreState>) => {
  suppressPersistWrite = true;
  try {
    useBrainDumpStore.setState(partial);
  } finally {
    suppressPersistWrite = false;
  }
};

export const useBrainDumpThoughts = () =>
  useBrainDumpStore((state) => state.thoughts);

export const useBrainDumpReadStatus = () =>
  useBrainDumpStore((state) => state.readStatus);

export const useBrainDumpReadError = () =>
  useBrainDumpStore((state) => state.readError);

export const useBrainDumpCrossTabSupported = () =>
  useBrainDumpStore((state) => state.crossTabSupported);
