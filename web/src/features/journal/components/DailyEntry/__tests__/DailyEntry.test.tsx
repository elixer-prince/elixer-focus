import { afterEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen } from "@testing-library/react";

import DailyEntryView from "@/features/journal/components/DailyEntry/Index";

const mocks = vi.hoisted(() => ({
  trackedIntervals: [] as Array<{
    id: string;
    kind: "idle" | "overrun";
    startedAt: number;
    endedAt: number | null;
    sessionId: string | null;
    userId: string | null;
    createdAt: number;
    updatedAt: number;
  }>,
  saveEntry: vi.fn(),
}));

vi.mock("@/features/journal/stores/journal-store", () => {
  const entry = {
    id: "entry-1",
    date: "2026-01-15",
    userId: null,
    content: "",
    createdAt: 1000,
    updatedAt: 1000,
  };
  const getEntryByDate = vi.fn((date: string) =>
    date === "2026-01-15" ? entry : undefined,
  );
  return {
    useGetEntryByDate: () => (date: string) =>
      date === "2026-01-15" ? entry : undefined,
    useJournalStore: {
      getState: () => ({
        saveEntry: mocks.saveEntry,
        getEntryByDate,
      }),
    },
    useSaveEntry: () => vi.fn(),
  };
});

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  getSessionsByDay: vi.fn(() => []),
  getTotalFocusTime: vi.fn(() => 0),
  useSessions: vi.fn(() => []),
  useTrackedIntervals: vi.fn(() => mocks.trackedIntervals),
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
  Badge: ({
    children,
    color,
    size,
  }: {
    children: React.ReactNode;
    color?: string;
    size?: string;
  }) => <span className={`badge-${color} badge-${size}`}>{children}</span>,
  Button: ({
    children,
    size,
    color,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    size?: string;
    color?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
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
  AtomicCodeMirrorEditor: ({
    markdownSource,
    onMarkdownChange,
  }: {
    markdownSource?: string;
    onMarkdownChange?: (value: string) => void;
  }) => (
    <>
      <textarea
        data-testid="journal-editor"
        value={markdownSource || ""}
        onChange={(event) => onMarkdownChange?.(event.target.value)}
      />
      <div data-testid="editor-content">
        <div contentEditable={false}>{markdownSource || ""}</div>
      </div>
    </>
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
  vi.useRealTimers();
  mocks.trackedIntervals = [];
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

    expect(screen.getByText("Focus Stats")).toBeInTheDocument();
  });

  it("shows no sessions message when there are no sessions", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(
      screen.getByText("No sessions completed today yet."),
    ).toBeInTheDocument();
  });

  it("shows tracking stats for an idle only day", () => {
    const start = new Date(2026, 0, 15).getTime();
    mocks.trackedIntervals = [
      {
        id: "idle-1",
        kind: "idle",
        startedAt: start,
        endedAt: null,
        sessionId: null,
        userId: null,
        createdAt: start,
        updatedAt: start,
      },
    ];

    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Idle Time")).toBeInTheDocument();
    expect(screen.getByText("Total Focus Time")).toBeInTheDocument();
    expect(
      screen.queryByText("No sessions completed today yet."),
    ).not.toBeInTheDocument();
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

  it("does not render a saving indicator while content is waiting to save", () => {
    vi.useFakeTimers();
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByTestId("journal-editor"), {
      target: { value: "A journal entry" },
    });

    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
  });

  it("saves journal changes after one second of inactivity", () => {
    vi.useFakeTimers();
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByTestId("journal-editor"), {
      target: { value: "A journal entry" },
    });

    act(() => vi.advanceTimersByTime(999));
    expect(mocks.saveEntry).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(mocks.saveEntry).toHaveBeenCalledWith(
      "2026-01-15",
      "A journal entry",
    );
  });

  it("renders the stats toggle button", () => {
    render(<DailyEntryView selectedDate={new Date(2026, 0, 15)} />);

    const statsButton = screen.getByText("Focus Stats").closest("button");
    expect(statsButton).toBeInTheDocument();
  });
});
