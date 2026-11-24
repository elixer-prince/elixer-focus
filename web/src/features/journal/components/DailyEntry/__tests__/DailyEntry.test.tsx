import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import DailyEntryView from "@/features/journal/components/DailyEntry/Index";

vi.mock("@/features/journal/stores/journal-store", () => {
  const entry = {
    id: "entry-1",
    date: "2026-01-15",
    userId: null,
    content: "",
    createdAt: 1000,
    updatedAt: 1000,
  };
  const getEntryByDate = vi.fn((date) =>
    date === "2026-01-15" ? entry : undefined,
  );
  return {
    useGetEntryByDate: () => (date) =>
      date === "2026-01-15" ? entry : undefined,
    useJournalStore: {
      getState: () => ({
        saveEntry: vi.fn((date, content) => ({ ...entry, date, content })),
        getEntryByDate,
      }),
    },
    useSaveEntry: () => vi.fn(),
  };
});

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  getSessionsByDay: vi.fn(() => []),
  getTotalFocusTime: vi.fn(() => 0),
  useGetTotalFocusTime: vi.fn(() => 0),
  getSessionCountsByType: vi.fn(() => ({
    Focus: 0,
    "Short Break": 0,
    "Long Break": 0,
  })),
}));

vi.mock("@/utils/formatting", () => ({
  formatElapsedTime: vi.fn(() => "0s"),
}));

vi.mock("@/components/ui", () => ({
  Badge: ({ children, color, size }) => (
    <span className={`badge-${color} badge-${size}`}>{children}</span>
  ),
  Button: ({ children, size, color, onClick, disabled }) => (
    <button
      type="button"
      className={`btn btn-${color} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock("@atomic-editor/editor", () => ({
  AtomicCodeMirrorEditor: ({ markdownSource, _onMarkdownChange }) => (
    <div data-testid="editor-content">
      <div contentEditable={false}>{markdownSource || ""}</div>
    </div>
  ),
}));

vi.mock("react-icons/md", () => ({
  MdExpandLess: () => <span>▼</span>,
  MdExpandMore: () => <span>▶</span>,
  MdEdit: () => <span>✎</span>,
  MdVisibility: () => <span>👁</span>,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("DailyEntry component", () => {
  it("renders the formatted date", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Thursday, January 15, 2026")).toBeInTheDocument();
  });

  it("renders the Edit button by default", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders the collapsible stats section", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Today's Focus Stats")).toBeInTheDocument();
  });

  it("shows no sessions message when there are no sessions", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(
      screen.getByText("No sessions completed today yet."),
    ).toBeInTheDocument();
  });

  it("shows placeholder text in view mode when entry is empty", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(
      screen.getByText("Click Edit to start writing your journal entry."),
    ).toBeInTheDocument();
  });

  it("switches to edit mode when Edit button is clicked", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("switches to view mode when View button is clicked", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("renders the stats toggle button", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    const statsButton = screen
      .getByText("Today's Focus Stats")
      .closest("button");
    expect(statsButton).toBeInTheDocument();
  });
});
