import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContext, useCallback, useContext, useState } from "react";

import NotesSection from "@/features/journal/components/Notes/Index";

const defaultEntries = [
  {
    id: "entry-1",
    date: "2026-01-15",
    userId: null,
    content: "",
    createdAt: 1000,
    updatedAt: 1000,
  },
];
const defaultNotes = [
  {
    id: "note-1",
    dailyEntryId: "entry-1",
    userId: null,
    title: "Test Note",
    content: "Note content",
    sessionId: null,
    noteType: "quick",
    createdAt: 1000,
    updatedAt: 1000,
  },
];

const createNoteFn = vi.fn();
const updateNoteFn = vi.fn();
const deleteNoteFn = vi.fn();

type MockStoreValue = {
  entries: typeof defaultEntries;
  notes: typeof defaultNotes;
  deleteNote: (noteId: string) => void;
};

const MockStoreContext = createContext<MockStoreValue | null>(null);

function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState([...defaultNotes]);
  const [entries] = useState([...defaultEntries]);

  const handleDeleteNote = useCallback((noteId: string) => {
    deleteNoteFn(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  return (
    <MockStoreContext.Provider
      value={{ entries, notes, deleteNote: handleDeleteNote }}
    >
      {children}
    </MockStoreContext.Provider>
  );
}

function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx)
    throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}

vi.mock("@/features/journal/stores/journal-store", () => {
  return {
    useEntries: () => useMockStore().entries,
    useNotes: () => useMockStore().notes,
    useCreateNote: () => createNoteFn,
    useUpdateNote: () => updateNoteFn,
    useDeleteNote: () => useMockStore().deleteNote,
    useJournalStore: {
      getState: () => ({
        entries: defaultEntries,
        notes: defaultNotes,
        createNote: createNoteFn,
        updateNote: updateNoteFn,
        deleteNote: deleteNoteFn,
      }),
      setState: vi.fn(),
    },
  };
});

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
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    size?: string;
    color?: string;
    onClick?: () => void;
    disabled?: boolean;
    "aria-label"?: string;
  }) => (
    <button
      type="button"
      className={`btn btn-${color} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
  Input: ({
    inputSize,
    placeholder,
    value,
    onChange,
    className,
    autoFocus,
  }: {
    inputSize?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    autoFocus?: boolean;
  }) => (
    <input
      type="text"
      className={`input input-${inputSize} ${className || ""}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
    />
  ),
}));

vi.mock("react-icons/md", () => ({
  MdClose: () => <span>✕</span>,
  MdEdit: () => <span>✎</span>,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("Notes component", () => {
  const renderWithMock = (ui: React.ReactNode) =>
    render(<MockStoreProvider>{ui}</MockStoreProvider>);

  it("renders the notes section header with count", () => {
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Notes (1)")).toBeInTheDocument();
  });

  it("renders the Add Note button", () => {
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("+ Add Note")).toBeInTheDocument();
  });

  it("renders existing notes with title and type badge", () => {
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("quick")).toBeInTheDocument();
  });

  it("renders edit and delete buttons for each note", () => {
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByLabelText("Edit note")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete note")).toBeInTheDocument();
  });

  it("opens the create note form when Add Note is clicked", async () => {
    const user = userEvent.setup();
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    await user.click(screen.getByText("+ Add Note"));
    expect(screen.getByPlaceholderText("Note title...")).toBeInTheDocument();
  });

  it("shows empty state when there are no notes", async () => {
    const user = userEvent.setup();
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);
    const deleteButton = screen.getByLabelText("Delete note");
    await user.click(deleteButton);

    expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
  });

  it("returns null when no entry exists for the date", () => {
    const { container } = renderWithMock(
      <NotesSection selectedDate={new Date(2026, 0, 14)} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("removes the note from the DOM immediately when deleted", async () => {
    const user = userEvent.setup();
    renderWithMock(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("Notes (1)")).toBeInTheDocument();

    const deleteButton = screen.getByLabelText("Delete note");
    await user.click(deleteButton);

    expect(screen.queryByText("Test Note")).not.toBeInTheDocument();
    expect(screen.queryByText("Notes (1)")).not.toBeInTheDocument();
  });
});
