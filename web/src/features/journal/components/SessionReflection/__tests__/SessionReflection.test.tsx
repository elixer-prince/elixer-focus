import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import SessionReflection from "@/features/journal/components/SessionReflection/Index";
import toast from "react-hot-toast";

const mockSession: CompletedSession = {
  id: "session-1",
  sessionType: "Focus",
  durationInSeconds: 1500,
  completedAt: Date.now(),
};

const mocks = vi.hoisted(() => ({
  reflection: "",
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
  broadcastReflectionDraft: vi.fn(),
  requestReflectionResolution: vi.fn(),
}));

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  useReflectionDraft: () => mocks.reflection,
  useTrackedIntervals: () => mocks.trackedIntervals,
}));

vi.mock("@/features/countdown-timer/services/timer-coordinator", () => ({
  broadcastReflectionDraft: mocks.broadcastReflectionDraft,
  requestReflectionResolution: mocks.requestReflectionResolution,
}));

vi.mock("@/features/journal/stores/journal-store", () => {
  const entries: Array<{
    id: string;
    date: string;
    userId: string | null;
    content: string;
    createdAt: number;
    updatedAt: number;
  }> = [];
  const createNote = vi.fn();
  const saveEntry = vi.fn((date, content) => ({
    id: "entry-1",
    date,
    userId: null,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  return {
    useEntries: () => entries,
    useCreateNote: () => createNote,
    useJournalStore: {
      getState: () => ({ entries, createNote, saveEntry }),
      setState: vi.fn(),
    },
  };
});

vi.mock("@/components/ui", () => ({
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

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
  },
}));

vi.mock("react-icons/md", () => ({
  MdClose: () => <span>✕</span>,
}));

afterEach(() => {
  vi.clearAllMocks();
  mocks.reflection = "";
  mocks.trackedIntervals = [];
});

describe("SessionReflection component", () => {
  it("renders the modal title when open", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Session Reflection")).toBeInTheDocument();
  });

  it("shows the session type in the description", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Focus")).toBeInTheDocument();
  });

  it("renders the reflection textarea", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByPlaceholderText("What did you accomplish? How do you feel?"),
    ).toBeInTheDocument();
  });

  it("renders Skip and Save Reflection buttons", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Skip")).toBeInTheDocument();
    expect(screen.getByText("Save Reflection")).toBeInTheDocument();
  });

  it("shows a success toast after saving a reflection", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("What did you accomplish? How do you feel?"),
      { target: { value: "Finished my important task." } },
    );
    fireEvent.click(screen.getByText("Save Reflection"));

    expect(toast.success).toHaveBeenCalledWith("Reflection saved to journal");
    expect(mocks.broadcastReflectionDraft).toHaveBeenCalledWith(
      "Finished my important task.",
    );
    expect(mocks.requestReflectionResolution).toHaveBeenCalledWith(
      mockSession.id,
      "Finished my important task.",
      true,
    );
  });

  it("does not show a success toast when the reflection is skipped", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Skip"));

    expect(toast.success).not.toHaveBeenCalled();
    expect(mocks.requestReflectionResolution).toHaveBeenCalledWith(
      mockSession.id,
      "",
      false,
    );
  });

  it("labels enabled attribution as overrun for the session type", () => {
    mocks.trackedIntervals = [
      {
        id: "overrun-1",
        kind: "overrun",
        startedAt: mockSession.completedAt,
        endedAt: null,
        sessionId: mockSession.id,
        userId: null,
        createdAt: mockSession.completedAt,
        updatedAt: mockSession.completedAt,
      },
    ];

    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Overrun for Focus")).toBeInTheDocument();
    expect(screen.queryByText("This time is counted as idle.")).toBeNull();
  });

  it("labels disabled attribution as idle time since session end", () => {
    mocks.trackedIntervals = [
      {
        id: "idle-1",
        kind: "idle",
        startedAt: mockSession.completedAt,
        endedAt: null,
        sessionId: null,
        userId: null,
        createdAt: mockSession.completedAt,
        updatedAt: mockSession.completedAt,
      },
    ];

    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Time since session end")).toBeInTheDocument();
    expect(
      screen.getByText("This time is counted as idle."),
    ).toBeInTheDocument();
  });

  it("disables Save Reflection button when reflection is empty", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Save Reflection")).toBeDisabled();
  });

  it("renders the reflection textarea with placeholder", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "What did you accomplish? How do you feel?",
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("renders the modal dialog", () => {
    render(
      <SessionReflection
        session={mockSession}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    const dialog = document.getElementById("session-reflection-modal");
    expect(dialog).toBeInTheDocument();
  });

  it("returns null when not open", () => {
    const { container } = render(
      <SessionReflection
        session={mockSession}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("returns null when session is null", () => {
    const { container } = render(
      <SessionReflection session={null} isOpen={true} onClose={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
