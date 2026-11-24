import {
  useCreateNote,
  useDeleteNote,
  useEntries,
  useNotes,
  useUpdateNote,
} from "@/features/journal/stores/journal-store";
import type { JournalNote, NoteType } from "@/features/journal/types/journal";
import { Badge, Button, Input } from "@/components/ui";
import { format } from "date-fns";
import { useState } from "react";
import { MdClose, MdEdit } from "react-icons/md";

type NotesSectionProps = {
  selectedDate: Date;
};

type NoteFilter = "all" | NoteType;

const noteFilters: { value: NoteFilter; label: string }[] = [
  { value: "all", label: "All notes" },
  { value: "reflection", label: "Reflection notes" },
  { value: "quick", label: "Quick notes" },
];

const NotesSection = ({ selectedDate }: NotesSectionProps) => {
  const entries = useEntries();
  const allNotes = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [noteFilter, setNoteFilter] = useState<NoteFilter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const entry = entries.find((e) => e.date === dateStr);

  // Get notes for this day
  const notes = entry
    ? allNotes
        .filter((n: JournalNote) => n.dailyEntryId === entry.id)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];
  const filteredNotes =
    noteFilter === "all"
      ? notes
      : notes.filter((note) => note.noteType === noteFilter);

  const handleCreateNote = () => {
    if (!entry || !newTitle.trim()) return;
    createNote(entry.id, newTitle.trim(), newContent.trim(), "quick");
    setNewTitle("");
    setNewContent("");
    setIsCreating(false);
  };

  const handleStartEdit = (note: {
    id: string;
    title: string;
    content: string;
  }) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = (noteId: string) => {
    if (editTitle.trim()) {
      updateNote(noteId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
    }
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
  };

  if (!entry) return null;

  return (
    <div className="notes-section mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base-content text-lg font-semibold">
          Notes ({filteredNotes.length})
        </h3>
        {!isCreating && (
          <Button size="sm" color="ghost" onClick={() => setIsCreating(true)}>
            + Add Note
          </Button>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter notes by type"
        className="mb-3 flex flex-wrap gap-2"
      >
        {noteFilters.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            color={noteFilter === value ? "primary" : "ghost"}
            className="min-h-11"
            aria-pressed={noteFilter === value}
            onClick={() => setNoteFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <div className="border-base-300 bg-base-200/30 mb-4 rounded-lg border p-4">
          <Input
            inputSize="sm"
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="mb-2"
            autoFocus
          />
          <textarea
            className="textarea textarea-bordered textarea-primary mb-2 w-full"
            placeholder="Write your note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="xs"
              color="ghost"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              onClick={handleCreateNote}
              disabled={!newTitle.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 && !isCreating && (
        <p className="text-base-content/40 py-4 text-center text-sm italic">
          {notes.length === 0
            ? 'No notes yet. Click "Add Note" to create one.'
            : noteFilter === "reflection"
              ? "No reflection notes for this day."
              : "No quick notes for this day."}
        </p>
      )}

      <div className="space-y-3">
        {filteredNotes.map((note: JournalNote) => (
          <div
            key={note.id}
            className="border-base-300 bg-base-200/20 rounded-lg border p-4 transition-colors duration-500"
          >
            {editingNoteId === note.id ? (
              <div>
                <Input
                  inputSize="sm"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mb-2"
                />
                <textarea
                  className="textarea textarea-bordered textarea-primary mb-2 w-full"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="xs"
                    color="ghost"
                    onClick={() => setEditingNoteId(null)}
                  >
                    Cancel
                  </Button>
                  <Button size="xs" onClick={() => handleSaveEdit(note.id)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base-content font-medium">
                      {note.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        color={
                          note.noteType === "reflection"
                            ? "accent"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {note.noteType}
                      </Badge>
                      <span className="text-base-content/40 text-xs">
                        {format(new Date(note.createdAt), "h:mm a")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="xs"
                      color="ghost"
                      onClick={() => handleStartEdit(note)}
                      aria-label="Edit note"
                    >
                      <MdEdit size={14} />
                    </Button>
                    <Button
                      size="xs"
                      color="ghost"
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Delete note"
                    >
                      <MdClose size={14} />
                    </Button>
                  </div>
                </div>
                {note.content && (
                  <p className="text-base-content/70 text-sm whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesSection;
