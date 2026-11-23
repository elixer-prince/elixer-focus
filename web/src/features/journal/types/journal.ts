export type NoteType = "quick" | "reflection";

export type DailyEntry = {
  id: string;
  date: string;
  userId: string | null;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type JournalNote = {
  id: string;
  dailyEntryId: string;
  userId: string | null;
  title: string;
  content: string;
  sessionId: string | null;
  noteType: NoteType;
  createdAt: number;
  updatedAt: number;
};
