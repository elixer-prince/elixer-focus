import JournalCalendar from "@/features/journal/components/Calendar/Index";
import DailyEntryView from "@/features/journal/components/DailyEntry/Index";
import FocusTimeChart from "@/features/journal/components/Chart/Index";
import NotesSection from "@/features/journal/components/Notes/Index";
import SessionReflection from "@/features/journal/components/SessionReflection/Index";
import StreakCounter from "@/features/journal/components/Streak/Index";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import {
  useLastCompletedSession,
  useClearLastCompletedSession,
} from "@/features/countdown-timer/stores/session-history-store";
import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import usePageTitle from "@/hooks/usePageTitle";
import { useCallback, useEffect, useState } from "react";

const JournalRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();
  const lastCompletedSession = useLastCompletedSession();
  const clearLastCompletedSession = useClearLastCompletedSession();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState<CompletedSession | null>(
    null,
  );

  if (!timerRunning) updatePageTitle("Elixer Focus - Journal");

  // Listen for session completion events (AC-7)
  useEffect(() => {
    if (lastCompletedSession && !reflectionOpen) {
      setPendingSession(lastCompletedSession);
      setReflectionOpen(true);
    }
  }, [lastCompletedSession, reflectionOpen]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleNewNote = useCallback(() => {
    // Scroll to notes section
    const notesEl = document.querySelector(".notes-section");
    notesEl?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="mx-auto max-w-5xl overflow-hidden p-8 max-sm:px-4">
      <div className="mb-6">
        <h1 className="text-base-content text-2xl font-bold">Journal</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Reflect on your focus sessions and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Calendar + Stats */}
        <div className="min-w-0 space-y-4 lg:col-span-1">
          <JournalCalendar
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />
          <StreakCounter />
          <FocusTimeChart />
        </div>

        {/* Right column: Daily Entry + Notes */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <DailyEntryView
            selectedDate={selectedDate}
            onNewNote={handleNewNote}
          />
          <NotesSection selectedDate={selectedDate} />
        </div>
      </div>

      {/* Session Reflection Modal */}
      <SessionReflection
        session={pendingSession}
        isOpen={reflectionOpen}
        onClose={() => {
          setReflectionOpen(false);
          setPendingSession(null);
          clearLastCompletedSession();
        }}
      />
    </div>
  );
};

export default JournalRoute;
