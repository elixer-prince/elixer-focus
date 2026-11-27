import JournalCalendar from "@/features/journal/components/Calendar/Index";
import DailyEntryView from "@/features/journal/components/DailyEntry/Index";
import FocusTimeChart from "@/features/journal/components/Chart/Index";
import NotesSection from "@/features/journal/components/Notes/Index";
import StreakCounter from "@/features/journal/components/Streak/Index";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import usePageTitle from "@/hooks/usePageTitle";
import { useCallback, useState } from "react";

const JournalRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!timerRunning) updatePageTitle("Elixer Focus - Journal");

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="mx-auto max-w-5xl overflow-x-clip p-8 max-sm:px-4">
      <div className="mb-6">
        <h1 className="text-base-content text-2xl font-bold">Journal</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Reflect on your focus sessions and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Left column: Calendar + Stats */}
        <div className="min-w-0 space-y-4 lg:sticky lg:top-[calc(var(--navbar-height)_+_1rem)] lg:col-span-1 lg:self-start">
          <JournalCalendar
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />
          <StreakCounter />
          <FocusTimeChart />
        </div>

        {/* Right column: Daily Entry + Notes */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <DailyEntryView selectedDate={selectedDate} />
          <NotesSection selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default JournalRoute;
