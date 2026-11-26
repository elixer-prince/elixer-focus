import { useJournalStore } from "@/features/journal/stores/journal-store";
import {
  getSessionsByDay,
  getSessionCountsByType,
  useGetTotalFocusTime,
} from "@/features/countdown-timer/stores/session-history-store";
import useTrackedTimeTotalsForRanges from "@/features/countdown-timer/hooks/useTrackedTimeTotals";
import { formatElapsedTime } from "@/utils/formatting";
import { Badge, Button } from "@/components/ui";
import { format } from "date-fns";
import { AtomicCodeMirrorEditor } from "@atomic-editor/editor";
import "@atomic-editor/editor/styles.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdEdit,
  MdExpandLess,
  MdExpandMore,
  MdVisibility,
} from "react-icons/md";
type DailyEntryViewProps = {
  selectedDate: Date;
};

const DailyEntryView = ({ selectedDate }: DailyEntryViewProps) => {
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const [statsOpen, setStatsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track which date we've created an entry for, to avoid re-creating
  const entryCreatedDateRef = useRef<string | null>(null);

  // Session stats for this day
  const sessions = getSessionsByDay(selectedDate);
  const dayStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  ).getTime();
  const dayEnd = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();
  const focusTime = useGetTotalFocusTime(dayStart, dayEnd);
  const sessionCounts = getSessionCountsByType(dayStart, dayEnd);
  const trackedRanges = useMemo(
    () => [{ start: dayStart, end: dayEnd + 1 }],
    [dayStart, dayEnd],
  );
  const [trackedTotals] = useTrackedTimeTotalsForRanges(trackedRanges);
  const hasTrackedStats =
    trackedTotals.idleSeconds > 0 ||
    Object.values(trackedTotals.overrunBySessionType).some(
      (seconds) => seconds > 0,
    );
  const hasStats = sessions.length > 0 || focusTime > 0 || hasTrackedStats;

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
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      useJournalStore.getState().saveEntry(dateStrRef.current, value);
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
          <Button
            size="sm"
            color={isEditing ? "primary" : "ghost"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <MdVisibility size={16} className="mr-1" />
                View
              </>
            ) : (
              <>
                <MdEdit size={16} className="mr-1" />
                Edit
              </>
            )}
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
            Focus Stats
          </span>
          {statsOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
        </button>

        {statsOpen && (
          <div className="border-base-300 border-t p-4">
            {hasStats ? (
              <>
                <div className="mb-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-base-content/60 text-sm">
                      Total Focus Time
                    </span>
                    <p className="text-primary text-2xl font-bold break-words">
                      {formatElapsedTime(focusTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-base-content/60 text-sm">
                      Idle Time
                    </span>
                    <p className="text-base-content text-2xl font-bold break-words">
                      {formatElapsedTime(trackedTotals.idleSeconds)}
                    </p>
                  </div>
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
                {Object.entries(trackedTotals.overrunBySessionType).some(
                  ([, seconds]) => seconds > 0,
                ) && (
                  <div className="mt-3">
                    <p className="text-base-content/60 mb-2 text-sm">
                      Overrun by session type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(["Focus", "Short Break", "Long Break"] as const).map(
                        (sessionType) => {
                          const seconds =
                            trackedTotals.overrunBySessionType[sessionType];
                          if (seconds === 0) return null;
                          return (
                            <Badge key={sessionType} color="error" size="sm">
                              {sessionType}: {formatElapsedTime(seconds)}
                            </Badge>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-base-content/40 text-sm italic">
                No sessions completed today yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Markdown Editor / View */}
      <div className="border-base-300 bg-base-100 rounded-lg border transition-colors duration-500">
        {isEditing ? (
          <AtomicCodeMirrorEditor
            documentId={dateStr}
            markdownSource={entryContent}
            onMarkdownChange={handleMarkdownChange}
          />
        ) : (
          <div className="min-h-[200px]">
            {entryContent ? (
              <AtomicCodeMirrorEditor
                documentId={`${dateStr}-view`}
                markdownSource={entryContent}
                readOnly={true}
              />
            ) : (
              <div className="p-4">
                <p className="text-base-content/40 py-8 text-center text-sm italic">
                  Click Edit to start writing your journal entry.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyEntryView;
