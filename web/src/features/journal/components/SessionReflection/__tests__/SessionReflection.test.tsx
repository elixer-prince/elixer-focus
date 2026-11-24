import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import SessionReflection from "@/features/journal/components/SessionReflection/Index";

const mockSession: CompletedSession = {
  id: "session-1",
  sessionType: "Focus",
  durationInSeconds: 1500,
  completedAt: Date.now(),
};

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

vi.mock("react-icons/md", () => ({
  MdClose: () => <span>✕</span>,
}));

afterEach(() => {
  vi.clearAllMocks();
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
