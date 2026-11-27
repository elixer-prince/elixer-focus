import { dispatchCalendarCommand } from "@/features/calendar/services/calendar-coordinator";
import { useCalendarStore } from "@/features/calendar/stores/calendar-store";
import type { WeekStartsOn } from "@/features/calendar/types/calendar";
import SleepScheduleSettings from "@/features/sleep-schedule/components/SleepScheduleSettings";

const weekDays: { value: WeekStartsOn; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const CalendarSettings = () => {
  const weekStartsOn = useCalendarStore((state) => state.weekStartsOn);

  return (
    <section className="size-full">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-base-content mb-1 text-2xl font-semibold tracking-tight">
          Calendar Settings
        </h1>
        <p className="text-base-content/70 text-sm sm:text-base">
          Set the first weekday for your planner. Changes save automatically.
        </p>
      </header>

      <section className="card border-base-300/60 bg-base-200 max-w-3xl border shadow-sm">
        <div className="card-body p-5 sm:p-6">
          <h2 className="card-title text-base">Week layout</h2>
          <p className="text-base-content/70 text-sm">
            Calendar week and month views, and the Journal chart, use this
            preference.
          </p>
          <label className="form-control mt-3 w-full max-w-sm">
            <span className="label-text mb-2 font-medium">Week starts on</span>
            <select
              className="select select-bordered select-primary min-h-12 w-full"
              aria-label="Week starts on"
              value={weekStartsOn}
              onChange={(event) =>
                void dispatchCalendarCommand({
                  type: "set-week-start",
                  weekStartsOn: Number(
                    event.currentTarget.value,
                  ) as WeekStartsOn,
                })
              }
            >
              {weekDays.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <SleepScheduleSettings />
    </section>
  );
};

export default CalendarSettings;
