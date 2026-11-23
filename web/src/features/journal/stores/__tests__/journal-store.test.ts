import { afterEach, describe, expect, it, vi } from "vitest";

import { useJournalStore } from "@/features/journal/stores/journal-store";

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  getSessionsByDateRange: vi.fn(() => []),
}));

vi.mock("@/utils/date", () => ({
  getCurrentTimestamp: vi.fn(() => 1000),
}));

afterEach(() => {
  useJournalStore.setState({ entries: [], notes: [] });
  vi.clearAllMocks();
});

describe("journal store", () => {
  describe("saveEntry", () => {
    it("creates a new entry when none exists for the date", () => {
      useJournalStore.setState({ entries: [], notes: [] });
      const entry = useJournalStore
        .getState()
        .saveEntry("2026-01-15", "# Hello");

      expect(entry).toBeDefined();
      expect(entry.date).toBe("2026-01-15");
      expect(entry.content).toBe("# Hello");
      expect(entry.userId).toBeNull();
    });

    it("updates an existing entry when one exists for the date", () => {
      const existingEntry = {
        id: "existing-id",
        date: "2026-01-15",
        userId: null,
        content: "Old content",
        createdAt: 500,
        updatedAt: 500,
      };
      useJournalStore.setState({ entries: [existingEntry], notes: [] });

      const entry = useJournalStore
        .getState()
        .saveEntry("2026-01-15", "New content");

      expect(entry.content).toBe("New content");
      expect(entry.id).toBe("existing-id");
    });

    it("preserves the original createdAt timestamp on update", () => {
      const existingEntry = {
        id: "existing-id",
        date: "2026-01-15",
        userId: null,
        content: "Old",
        createdAt: 100,
        updatedAt: 200,
      };
      useJournalStore.setState({ entries: [existingEntry], notes: [] });

      useJournalStore.getState().saveEntry("2026-01-15", "Updated");

      const entries = useJournalStore.getState().entries;
      const updated = entries.find((e) => e.date === "2026-01-15");
      expect(updated?.createdAt).toBe(100);
    });
  });

  describe("getEntryByDate", () => {
    it("returns the entry for a matching date", () => {
      const entry = {
        id: "1",
        date: "2026-01-15",
        userId: null,
        content: "Test",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({ entries: [entry], notes: [] });

      const result = useJournalStore.getState().getEntryByDate("2026-01-15");

      expect(result).toEqual(entry);
    });

    it("returns undefined when no entry exists for the date", () => {
      useJournalStore.setState({ entries: [], notes: [] });

      const result = useJournalStore.getState().getEntryByDate("2026-01-15");

      expect(result).toBeUndefined();
    });
  });

  describe("createNote", () => {
    it("creates a note linked to a daily entry", () => {
      useJournalStore.setState({ entries: [], notes: [] });

      const note = useJournalStore
        .getState()
        .createNote("entry-id", "My Note", "Note content", "quick");

      expect(note).toBeDefined();
      expect(note.dailyEntryId).toBe("entry-id");
      expect(note.title).toBe("My Note");
      expect(note.content).toBe("Note content");
      expect(note.noteType).toBe("quick");
      expect(note.sessionId).toBeNull();
    });

    it("creates a reflection note with a session ID", () => {
      useJournalStore.setState({ entries: [], notes: [] });

      const note = useJournalStore
        .getState()
        .createNote(
          "entry-id",
          "Reflection",
          "Great session",
          "reflection",
          "session-123",
        );

      expect(note.noteType).toBe("reflection");
      expect(note.sessionId).toBe("session-123");
    });
  });

  describe("getNotesByDate", () => {
    it("returns notes for the given date", () => {
      const entry = {
        id: "entry-1",
        date: "2026-01-15",
        userId: null,
        content: "",
        createdAt: 1000,
        updatedAt: 1000,
      };
      const note = {
        id: "note-1",
        dailyEntryId: "entry-1",
        userId: null,
        title: "Note",
        content: "Content",
        sessionId: null,
        noteType: "quick",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({ entries: [entry], notes: [note] });

      const results = useJournalStore.getState().getNotesByDate("2026-01-15");

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("note-1");
    });

    it("returns empty array when no entry exists for the date", () => {
      useJournalStore.setState({ entries: [], notes: [] });

      const results = useJournalStore.getState().getNotesByDate("2026-01-15");

      expect(results).toEqual([]);
    });
  });

  describe("updateNote", () => {
    it("updates the title and content of a note", () => {
      const note = {
        id: "note-1",
        dailyEntryId: "entry-1",
        userId: null,
        title: "Old Title",
        content: "Old Content",
        sessionId: null,
        noteType: "quick",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({ entries: [], notes: [note] });

      useJournalStore
        .getState()
        .updateNote("note-1", { title: "New Title", content: "New Content" });

      const notes = useJournalStore.getState().notes;
      const updated = notes.find((n) => n.id === "note-1");
      expect(updated?.title).toBe("New Title");
      expect(updated?.content).toBe("New Content");
    });

    it("updates only the provided fields", () => {
      const note = {
        id: "note-1",
        dailyEntryId: "entry-1",
        userId: null,
        title: "Title",
        content: "Content",
        sessionId: null,
        noteType: "quick",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({ entries: [], notes: [note] });

      useJournalStore.getState().updateNote("note-1", { title: "New Title" });

      const notes = useJournalStore.getState().notes;
      const updated = notes.find((n) => n.id === "note-1");
      expect(updated?.title).toBe("New Title");
      expect(updated?.content).toBe("Content");
    });

    it("does nothing when note is not found", () => {
      useJournalStore.setState({ entries: [], notes: [] });

      useJournalStore.getState().updateNote("nonexistent", { title: "New" });

      const notes = useJournalStore.getState().notes;
      expect(notes).toEqual([]);
    });
  });

  describe("deleteNote", () => {
    it("removes a note by id", () => {
      const note = {
        id: "note-1",
        dailyEntryId: "entry-1",
        userId: null,
        title: "Note",
        content: "Content",
        sessionId: null,
        noteType: "quick",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({ entries: [], notes: [note] });

      useJournalStore.getState().deleteNote("note-1");

      const notes = useJournalStore.getState().notes;
      expect(notes).toEqual([]);
    });

    it("leaves other notes intact", () => {
      const note1 = {
        id: "note-1",
        dailyEntryId: "e1",
        userId: null,
        title: "A",
        content: "",
        sessionId: null,
        noteType: "quick",
        createdAt: 1000,
        updatedAt: 1000,
      };
      const note2 = {
        id: "note-2",
        dailyEntryId: "e1",
        userId: null,
        title: "B",
        content: "",
        sessionId: null,
        noteType: "quick",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({ entries: [], notes: [note1, note2] });

      useJournalStore.getState().deleteNote("note-1");

      const notes = useJournalStore.getState().notes;
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe("note-2");
    });
  });

  describe("getStreak", () => {
    it("returns 0 when there are no entries or sessions", () => {
      useJournalStore.setState({ entries: [], notes: [] });

      expect(useJournalStore.getState().getStreak()).toBe(0);
    });

    it("counts consecutive days from today backward", () => {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const entryToday = {
        id: "1",
        date: todayStr,
        userId: null,
        content: "x",
        createdAt: 1000,
        updatedAt: 1000,
      };
      const entryYesterday = {
        id: "2",
        date: yesterdayStr,
        userId: null,
        content: "x",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({
        entries: [entryToday, entryYesterday],
        notes: [],
      });

      expect(useJournalStore.getState().getStreak()).toBeGreaterThanOrEqual(2);
    });

    it("breaks the streak when a day is missing", () => {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

      const entryToday = {
        id: "1",
        date: todayStr,
        userId: null,
        content: "x",
        createdAt: 1000,
        updatedAt: 1000,
      };
      const entryTwoDaysAgo = {
        id: "2",
        date: twoDaysAgoStr,
        userId: null,
        content: "x",
        createdAt: 1000,
        updatedAt: 1000,
      };
      useJournalStore.setState({
        entries: [entryToday, entryTwoDaysAgo],
        notes: [],
      });

      expect(useJournalStore.getState().getStreak()).toBe(1);
    });
  });
});
