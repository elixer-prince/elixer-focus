import { useJournalStore } from "@/features/journal/stores/journal-store";
import {
  getSessionsByDay,
  getSessionCountsByType,
  getTotalFocusTime,
} from "@/features/countdown-timer/stores/session-history-store";
import { formatElapsedTime } from "@/utils/formatting";
import { Badge, Button } from "@/components/ui";
import { format } from "date-fns";
import { AtomicCodeMirrorEditor } from "@atomic-editor/editor";
import "@atomic-editor/editor/styles.css";
import { useEffect, useRef, useState } from "react";
import { MdExpandLess, MdExpandMore, MdNoteAdd } from "react-icons/md";

type DailyEntryViewProps = {
  selectedDate: Date;
  onNewNote: () => void;
};

const DailyEntryView = ({ selectedDate, onNewNote }: DailyEntryViewProps) => {
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const [statsOpen, setStatsOpen] = useState(true);
  const [draftIndicator, setDraftIndicator] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track which date we've created an entry for, to avoid re-creating
  const entryCreatedDateRef = useRef<string | null>(null);

  // Session stats for this day
  const sessions = getSessionsByDay(selectedDate);
  const focusTime = getTotalFocusTime(
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    ).getTime(),
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59,
      999,
    ).getTime(),
  );
  const sessionCounts = getSessionCountsByType(
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    ).getTime(),
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59,
      999,
    ).getTime(),
  );

  // Refs for stable access in effects
  const dateStrRef = useRef(dateStr);
  dateStrRef.current = dateStr;

  // Create entry when clicking a day with no entry
  useEffect(() => {
    if (entryCreatedDateRef.current === dateStr) return;
    entryCreatedDateRef.current = dateStr;
    const entry = useJournalStore.getState().getEntryByDate(dateStr);
    if (!entry) {
      useJournalStore.getState().saveEntry(dateStr, "");
    }
  }, [dateStr]);

  // Get current entry content for the editor
  const entryContent =
    useJournalStore.getState().getEntryByDate(dateStr)?.content || "";

  // Sync content when date changes
  useEffect(() => {
    // date change tracked by entryCreatedDateRef
  }, [dateStr]);

  const handleMarkdownChange = (value: string) => {
    setDraftIndicator(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      useJournalStore.getState().saveEntry(dateStrRef.current, value);
      setDraftIndicator(false);
    }, 1000);
  };

  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");

  return (
    <div className="daily-entry bg-base-100 rounded-box p-6 shadow-sm transition-colors duration-500">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base-content text-xl font-semibold">
          {formattedDate}
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" color="secondary" onClick={onNewNote}>
            <MdNoteAdd size={16} className="mr-1" />
            New Note
          </Button>
        </div>
      </div>

      {/* Collapsible Stats */}
      <div className="border-base-300 mb-4 overflow-hidden rounded-lg border transition-colors duration-500">
        <button
          className="hover:bg-base-200/50 flex w-full items-center justify-between p-3 transition-colors"
          onClick={() => setStatsOpen(!statsOpen)}
        >
          <span className="text-base-content truncate text-sm font-medium">
            Today&apos;s Focus Stats
          </span>
          {statsOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
        </button>

        {statsOpen && (
          <div className="border-base-300 border-t p-4">
            {sessions.length > 0 ? (
              <>
                <div className="mb-3">
                  <span className="text-base-content/60 text-sm">
                    Total Focus Time
                  </span>
                  <p className="text-primary text-2xl font-bold break-words">
                    {formatElapsedTime(focusTime)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sessionCounts.Focus > 0 && (
                    <Badge color="primary" size="sm">
                      {sessionCounts.Focus} Focus
                      {sessionCounts.Focus !== 1 ? "es" : ""}
                    </Badge>
                  )}
                  {sessionCounts["Short Break"] > 0 && (
                    <Badge color="secondary" size="sm">
                      {sessionCounts["Short Break"]} Short Break
                      {sessionCounts["Short Break"] !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {sessionCounts["Long Break"] > 0 && (
                    <Badge color="accent" size="sm">
                      {sessionCounts["Long Break"]} Long Break
                      {sessionCounts["Long Break"] !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <p className="text-base-content/40 text-sm italic">
                No sessions completed today yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Markdown Editor */}
      <div className="border-base-300 bg-base-100 rounded-lg border transition-colors duration-500">
        {draftIndicator && (
          <div className="border-base-300 border-t px-4 py-2">
            <span className="text-base-content/50 text-xs italic">
              Saving...
            </span>
          </div>
        )}
        <AtomicCodeMirrorEditor
          documentId={dateStr}
          markdownSource={entryContent}
          onMarkdownChange={handleMarkdownChange}
        />
      </div>
    </div>
  );
};

export default DailyEntryView;
