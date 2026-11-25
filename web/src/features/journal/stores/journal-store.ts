import type { DailyEntry, JournalNote } from "@/features/journal/types/journal";
import { getSessionsByDateRange } from "@/features/countdown-timer/stores/session-history-store";
import { getCurrentTimestamp } from "@/utils/date";
import { calculateFocusSessionStreak } from "@/utils/streak";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type JournalState = {
  entries: DailyEntry[];
  notes: JournalNote[];
};

type JournalActions = {
  getEntryByDate: (date: string) => DailyEntry | undefined;
  saveEntry: (date: string, content: string) => DailyEntry;
  getNotesByDate: (date: string) => JournalNote[];
  createNote: (
    dailyEntryId: string,
    title: string,
    content: string,
    noteType: "quick" | "reflection",
    sessionId?: string | null,
  ) => JournalNote;
  updateNote: (
    noteId: string,
    updates: { title?: string; content?: string },
  ) => void;
  deleteNote: (noteId: string) => void;
  getStreak: () => number;
};

type JournalStore = JournalState & JournalActions;

export const useJournalStore = create<JournalStore>()(
  persist(
    immer((set, get) => ({
      entries: [],
      notes: [],

      getEntryByDate: (date) => {
        return get().entries.find((e) => e.date === date);
      },

      saveEntry: (date, content) => {
        const now = getCurrentTimestamp();
        const existing = get().entries.find((e) => e.date === date);

        if (existing) {
          set((state) => {
            const entry = state.entries.find((e) => e.date === date);
            if (entry) {
              entry.content = content;
              entry.updatedAt = now;
            }
          });
          return get().entries.find((e) => e.date === date)!;
        } else {
          const newEntry: DailyEntry = {
            id: crypto.randomUUID(),
            date,
            userId: null,
            content,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => {
            state.entries.push(newEntry);
          });
          return newEntry;
        }
      },

      getNotesByDate: (date) => {
        const entry = get().entries.find((e) => e.date === date);
        if (!entry) return [];
        return get().notes.filter((n) => n.dailyEntryId === entry.id);
      },

      createNote: (
        dailyEntryId,
        title,
        content,
        noteType,
        sessionId = null,
      ) => {
        if (noteType === "reflection" && sessionId) {
          const existing = get().notes.find(
            (note) =>
              note.noteType === "reflection" && note.sessionId === sessionId,
          );
          if (existing) return existing;
        }

        const now = getCurrentTimestamp();
        const newNote: JournalNote = {
          id: crypto.randomUUID(),
          dailyEntryId,
          userId: null,
          title,
          content,
          sessionId,
          noteType,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.notes.push(newNote);
        });
        return newNote;
      },

      updateNote: (noteId, updates) => {
        set((state) => {
          const note = state.notes.find((n) => n.id === noteId);
          if (note) {
            if (updates.title !== undefined) note.title = updates.title;
            if (updates.content !== undefined) note.content = updates.content;
            note.updatedAt = getCurrentTimestamp();
          }
        });
      },

      deleteNote: (noteId) => {
        set((state) => {
          state.notes = state.notes.filter((n) => n.id !== noteId);
        });
      },

      getStreak: () => {
        const sessions = getSessionsByDateRange(0, Date.now());
        return calculateFocusSessionStreak(sessions);
      },
    })),
    createPersistOptions<JournalStore>({
      name: "journal-storage",
      version: 1,
    }),
  ),
);

/*-------------------------------------
| JOURNAL STORE EXPORTS
|--------------------------------------
|
*/

// STATES

export const useEntries = () => useJournalStore((state) => state.entries);

export const useNotes = () => useJournalStore((state) => state.notes);

// ACTIONS

export const useGetEntryByDate = () =>
  useJournalStore((state) => state.getEntryByDate);

export const useSaveEntry = () => useJournalStore((state) => state.saveEntry);

export const useGetNotesByDate = () =>
  useJournalStore((state) => state.getNotesByDate);

export const useCreateNote = () => useJournalStore((state) => state.createNote);

export const useUpdateNote = () => useJournalStore((state) => state.updateNote);

export const useDeleteNote = () => useJournalStore((state) => state.deleteNote);

export const useGetStreak = () => useJournalStore((state) => state.getStreak);
