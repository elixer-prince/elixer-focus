import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Journal from "@/app/routes/(root)/Journal";

vi.mock("@/features/journal/stores/journal-store", () => {
  const entries: Array<{
    id: string;
    date: string;
    userId: string | null;
    content: string;
    createdAt: number;
    updatedAt: number;
  }> = [];
  const notes: Array<{
    id: string;
    dailyEntryId: string;
    userId: string | null;
    title: string;
    content: string;
    sessionId: string | null;
    noteType: string;
    createdAt: number;
    updatedAt: number;
  }> = [];
  const getEntryByDate = vi.fn(() => undefined);
  const saveEntry = vi.fn();
  const getNotesByDate = vi.fn(() => []);
  const createNote = vi.fn();
  const updateNote = vi.fn();
  const deleteNote = vi.fn();
  const getStreak = vi.fn(() => 0);
  return {
    useEntries: () => entries,
    useNotes: () => notes,
    useGetEntryByDate: () => getEntryByDate,
    useSaveEntry: () => saveEntry,
    useGetNotesByDate: () => getNotesByDate,
    useCreateNote: () => createNote,
    useUpdateNote: () => updateNote,
    useDeleteNote: () => deleteNote,
    useGetStreak: () => getStreak,
    useJournalStore: {
      getState: () => ({
        entries,
        notes,
        getEntryByDate,
        saveEntry,
        getNotesByDate,
        createNote,
        updateNote,
        deleteNote,
        getStreak,
      }),
      setState: vi.fn(),
    },
  };
});

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  getSessionsByDateRange: vi.fn(() => []),
  getSessionsByDay: vi.fn(() => []),
  getTotalFocusTime: vi.fn(() => 0),
  getSessionCountsByType: vi.fn(() => ({
    Focus: 0,
    "Short Break": 0,
    "Long Break": 0,
  })),
  useLastCompletedSession: vi.fn(() => null),
  useClearLastCompletedSession: vi.fn(() => vi.fn()),
}));

vi.mock("@/utils/formatting", () => ({
  formatElapsedTime: vi.fn(() => "0s"),
}));

vi.mock("@/hooks/usePageTitle", () => ({
  default: vi.fn(() => ({
    updatePageTitle: vi.fn(),
  })),
}));

vi.mock("@/components/ui", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({
    placeholder,
    value,
    onChange,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

vi.mock("@/features/journal/components/Calendar/Index", () => ({
  default: () => <div data-testid="calendar">Calendar</div>,
}));

vi.mock("@/features/journal/components/DailyEntry/Index", () => ({
  default: () => <div data-testid="daily-entry">Daily Entry</div>,
}));

vi.mock("@/features/journal/components/Notes/Index", () => ({
  default: () => <div data-testid="notes">Notes</div>,
}));

vi.mock("@/features/journal/components/Chart/Index", () => ({
  default: () => <div data-testid="chart">Chart</div>,
}));

vi.mock("@/features/journal/components/Streak/Index", () => ({
  default: () => <div data-testid="streak">Streak</div>,
}));

vi.mock("@/features/journal/components/SessionReflection/Index", () => ({
  default: () => null,
}));

vi.mock("@tiptap/react", () => ({
  useEditor: () => null,
  EditorContent: () => null,
}));

vi.mock("@tiptap/starter-kit", () => ({ default: {} }));
vi.mock("@tiptap/extension-placeholder", () => ({
  default: { configure: () => ({}) },
}));
vi.mock("@tiptap/markdown", () => ({ Markdown: {} }));

vi.mock("react-icons/md", () => ({
  MdExpandLess: () => <span>▼</span>,
  MdExpandMore: () => <span>▶</span>,
  MdNoteAdd: () => <span>+</span>,
  MdClose: () => <span>✕</span>,
  MdEdit: () => <span>✎</span>,
  MdLocalFireDepartment: () => <span>🔥</span>,
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock("react-chartjs-2", () => ({
  Bar: () => <canvas />,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("Journal page", () => {
  it("renders the page title", () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    );

    expect(screen.getByText("Journal")).toBeInTheDocument();
  });

  it("renders the calendar component", () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("calendar")).toBeInTheDocument();
  });

  it("renders the daily entry component", () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("daily-entry")).toBeInTheDocument();
  });

  it("renders the notes component", () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("notes")).toBeInTheDocument();
  });

  it("renders the focus time chart", () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("chart")).toBeInTheDocument();
  });

  it("renders the streak counter", () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("streak")).toBeInTheDocument();
  });
});
