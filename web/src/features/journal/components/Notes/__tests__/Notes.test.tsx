import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NotesSection from "@/features/journal/components/Notes/Index";

const mockEntries = [
  {
    id: "entry-1",
    date: "2026-01-15",
    userId: null,
    content: "",
    createdAt: 1000,
    updatedAt: 1000,
  },
];
const mockNotes = [
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

vi.mock("@/features/journal/stores/journal-store", () => {
  const createNote = vi.fn();
  const updateNote = vi.fn();
  const deleteNote = vi.fn();
  return {
    useEntries: () => mockEntries,
    useNotes: () => mockNotes,
    useCreateNote: () => createNote,
    useUpdateNote: () => updateNote,
    useDeleteNote: () => deleteNote,
    useJournalStore: {
      getState: () => ({
        entries: mockEntries,
        notes: mockNotes,
        createNote,
        updateNote,
        deleteNote,
      }),
      setState: vi.fn(),
    },
  };
});

vi.mock("@/components/ui", () => ({
  Badge: ({ children, color, size }) => (
    <span className={`badge-${color} badge-${size}`}>{children}</span>
  ),
  Button: ({
    children,
    size,
    color,
    onClick,
    disabled,
    "aria-label": ariaLabel,
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
  // Reset mock data
  mockEntries.length = 0;
  mockNotes.length = 0;
  mockEntries.push({
    id: "entry-1",
    date: "2026-01-15",
    userId: null,
    content: "",
    createdAt: 1000,
    updatedAt: 1000,
  });
  mockNotes.push({
    id: "note-1",
    dailyEntryId: "entry-1",
    userId: null,
    title: "Test Note",
    content: "Note content",
    sessionId: null,
    noteType: "quick",
    createdAt: 1000,
    updatedAt: 1000,
  });
});

describe("Notes component", () => {
  it("renders the notes section header with count", () => {
    render(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Notes (1)")).toBeInTheDocument();
  });

  it("renders the Add Note button", () => {
    render(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("+ Add Note")).toBeInTheDocument();
  });

  it("renders existing notes with title and type badge", () => {
    render(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("quick")).toBeInTheDocument();
  });

  it("renders edit and delete buttons for each note", () => {
    render(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByLabelText("Edit note")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete note")).toBeInTheDocument();
  });

  it("opens the create note form when Add Note is clicked", async () => {
    const user = userEvent.setup();
    render(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    await user.click(screen.getByText("+ Add Note"));
    expect(screen.getByPlaceholderText("Note title...")).toBeInTheDocument();
  });

  it("shows empty state when there are no notes", () => {
    mockNotes.length = 0;
    render(<NotesSection selectedDate={new Date(2026, 0, 15)} />);

    expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
  });

  it("returns null when no entry exists for the date", () => {
    mockEntries.length = 0;
    mockNotes.length = 0;
    const { container } = render(
      <NotesSection selectedDate={new Date(2026, 0, 14)} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
