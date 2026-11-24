import { useEntries, useNotes } from "@/features/journal/stores/journal-store";
import { startOfMonth, subMonths, addMonths } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { DayPicker, useDayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const TODAY = new Date();

type JournalCalendarProps = {
  onSelectDate: (date: Date) => void;
  selectedDate: Date | undefined;
};

const JournalCalendar = ({
  onSelectDate,
  selectedDate,
}: JournalCalendarProps) => {
  const entries = useEntries();
  const notes = useNotes();
  const today = useMemo(() => startOfMonth(TODAY), []);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(TODAY));

  const isViewingCurrentMonth = useMemo(
    () =>
      viewMonth.getMonth() === today.getMonth() &&
      viewMonth.getFullYear() === today.getFullYear(),
    [viewMonth, today],
  );

  // Build set of dates that have entries or notes
  const activeDates = new Set<string>();
  for (const entry of entries) {
    activeDates.add(entry.date);
  }
  for (const note of notes) {
    const entry = entries.find((e) => e.id === note.dailyEntryId);
    if (entry) activeDates.add(entry.date);
  }

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onSelectDate(date);
      }
    },
    [onSelectDate],
  );

  return (
    <div className="journal-calendar bg-base-100 rounded-box p-4 shadow-sm transition-colors duration-500">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        month={viewMonth}
        onMonthChange={setViewMonth}
        hideNavigation
        modifiers={{
          hasEntry: activeDates.size
            ? Array.from(activeDates).map((d) => new Date(d + "T12:00:00"))
            : [],
        }}
        modifiersClassNames={{
          hasEntry: "day-with-entry",
        }}
        components={{
          MonthCaption: (props) => {
            const { goToMonth } = useDayPicker();
            const handleGoToToday = useCallback(() => {
              goToMonth(startOfMonth(TODAY));
              onSelectDate(TODAY);
            }, [goToMonth, onSelectDate]);
            return (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => {
                      goToMonth(subMonths(props.calendarMonth.date, 1));
                    }}
                  >
                    <svg
                      className="h-5 w-5 fill-current"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <polygon points="15.41,16.59 10.83,12 15.41,7.41 14,6 8,12 14,18 15.41,16.59" />
                    </svg>
                  </button>
                  <span className="text-base-content text-lg font-semibold">
                    {props.calendarMonth.date.toLocaleString("en", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => {
                      goToMonth(addMonths(props.calendarMonth.date, 1));
                    }}
                  >
                    <svg
                      className="h-5 w-5 fill-current"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <polygon points="8.59,16.59 13.17,12 8.59,7.41 10,6 16,12 10,18 8.59,16.59" />
                    </svg>
                  </button>
                </div>
                {!isViewingCurrentMonth && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-primary"
                    onClick={handleGoToToday}
                  >
                    Today
                  </button>
                )}
              </>
            );
          },
        }}
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "w-full",
          month_grid: "w-full border-collapse",
          weekdays: "flex justify-between mb-2",
          weekday: "text-xs font-medium text-base-content/50 w-10 text-center",
          week: "flex justify-between",
          day: "w-10 h-10 rounded-full text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/10",
          selected:
            "bg-primary text-primary-content hover:bg-primary/90 hover:text-primary-content font-semibold",
          day_button:
            "w-full h-full rounded-full flex items-center justify-center",
        }}
      />
      <style>{`
        .day-with-entry::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: hsl(var(--p));
        }
        .day-with-entry {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default JournalCalendar;
