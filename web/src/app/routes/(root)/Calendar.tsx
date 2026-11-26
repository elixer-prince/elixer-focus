import { Button, Input, Modal } from "@/components/ui";
import {
  dispatchCalendarCommand,
  type CalendarCoordinatorCommand,
} from "@/features/calendar/services/calendar-coordinator";
import {
  createLocalDateTime,
  formatLocalDate,
  getLocalDayRange,
  parseLocalDate,
} from "@/features/calendar/utils/calendar-date";
import type {
  RecurrenceFrequency,
  RecurrenceRuleDraft,
  ScheduledOccurrence,
  WeekStartsOn,
} from "@/features/calendar/types/calendar";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import { useCalendarStore, useTasks } from "@/stores";
import usePageTitle from "@/hooks/usePageTitle";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import {
  addDays,
  addMonths,
  endOfMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MdAdd, MdArrowBack, MdArrowForward, MdClose } from "react-icons/md";
import "@fullcalendar/react/skeleton.css";
import "./calendar.css";

const quickDurations = Array.from(
  { length: 8 },
  (_, index) => (index + 1) * 15,
);

const calendarViews = [
  {
    id: "day",
    label: "Day",
    fullCalendarView: "timeGridDay",
    previousLabel: "Previous day",
    nextLabel: "Next day",
  },
  {
    id: "multi-day",
    label: "Multi Day",
    fullCalendarView: "timeGridThreeDay",
    previousLabel: "Previous 3 days",
    nextLabel: "Next 3 days",
  },
  {
    id: "week",
    label: "Week",
    fullCalendarView: "timeGridWeek",
    previousLabel: "Previous week",
    nextLabel: "Next week",
  },
  {
    id: "month",
    label: "Month",
    fullCalendarView: "dayGridMonth",
    previousLabel: "Previous month",
    nextLabel: "Next month",
  },
] as const;

type CalendarView = (typeof calendarViews)[number]["id"];

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  classNames: string[];
  display?: "background";
};

const getDateLabel = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseLocalDate(date));

const getViewDateLabel = (
  view: CalendarView,
  selectedDate: string,
  weekStartsOn: WeekStartsOn,
) => {
  const date = parseLocalDate(selectedDate);
  if (view === "day") return getDateLabel(selectedDate);
  if (view === "month") {
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  const rangeStart =
    view === "week" ? startOfWeek(date, { weekStartsOn }) : date;
  const rangeEnd = addDays(rangeStart, view === "week" ? 6 : 2);
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatter.format(rangeStart)} through ${formatter.format(rangeEnd)}`;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${minutes} min`;
  if (!remainingMinutes) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
};

const getOccurrenceTimeRange = (occurrence: ScheduledOccurrence) => {
  if (!occurrence.startTime) return undefined;

  const durationMinutes = occurrence.durationMinutes ?? 30;
  const start = createLocalDateTime(occurrence.date, occurrence.startTime);
  if (
    Number.isNaN(start.getTime()) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 1440
  ) {
    return undefined;
  }

  return {
    start,
    end: new Date(start.getTime() + durationMinutes * 60_000),
  };
};

const getWeekdayOrdinal = (date: string): 1 | 2 | 3 | 4 | 5 | "last" => {
  const parsedDate = parseLocalDate(date);
  const ordinal = Math.ceil(parsedDate.getDate() / 7);
  return addDays(parsedDate, 7).getMonth() === parsedDate.getMonth()
    ? (ordinal as 1 | 2 | 3 | 4 | 5)
    : "last";
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();
  const tasks = useTasks();
  const scheduledOccurrences = useCalendarStore(
    (state) => state.scheduledOccurrences,
  );
  const weekStartsOn = useCalendarStore((state) => state.weekStartsOn);
  const recurrenceSeries = useCalendarStore((state) => state.recurrenceSeries);
  const recurrenceRuleSegments = useCalendarStore(
    (state) => state.recurrenceRuleSegments,
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const activeTasks = useMemo(
    () => tasks.filter((task) => task.archivedAt === undefined),
    [tasks],
  );

  const today = formatLocalDate(currentTime);
  const currentTimeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(currentTime);
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarView, setCalendarView] = useState<CalendarView>("day");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [planDate, setPlanDate] = useState(today);
  const [editingOccurrenceScope, setEditingOccurrenceScope] = useState<
    "occurrence" | "future" | "series" | null
  >(null);
  const [planMode, setPlanMode] = useState<"existing" | "new">(
    activeTasks.length ? "existing" : "new",
  );
  const [selectedTaskId, setSelectedTaskId] = useState(
    activeTasks[0]?.id ?? "",
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isTimed, setIsTimed] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [durationChoice, setDurationChoice] = useState("30");
  const [customDuration, setCustomDuration] = useState("30");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<RecurrenceFrequency>("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState("1");
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
  const [monthlyMode, setMonthlyMode] = useState<
    "dayOfMonth" | "weekdayOrdinal"
  >("dayOfMonth");
  const [monthDay, setMonthDay] = useState("1");
  const [monthlyWeekday, setMonthlyWeekday] = useState("0");
  const [weekdayOrdinal, setWeekdayOrdinal] = useState<
    1 | 2 | 3 | 4 | 5 | "last"
  >(1);
  const [recurrenceEndMode, setRecurrenceEndMode] = useState<
    "never" | "date" | "count"
  >("never");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(today);
  const [occurrenceCount, setOccurrenceCount] = useState("10");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<
    string | null
  >(null);
  const [editingOccurrenceId, setEditingOccurrenceId] = useState<string | null>(
    null,
  );
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
  const [deleteScope, setDeleteScope] = useState<
    "occurrence" | "future" | "series"
  >("occurrence");

  if (!timerRunning) updatePageTitle("Elixer Focus | Calendar");

  const dayOccurrences = useMemo(() => {
    const selectedDayRange = getLocalDayRange(selectedDate);

    return scheduledOccurrences.filter((occurrence) => {
      if (occurrence.isSkipped) return false;
      if (occurrence.date === selectedDate) return true;

      const timeRange = getOccurrenceTimeRange(occurrence);
      return (
        timeRange !== undefined &&
        timeRange.start < selectedDayRange.end &&
        timeRange.end > selectedDayRange.start
      );
    });
  }, [scheduledOccurrences, selectedDate]);
  const timedOccurrences = useMemo(
    () => dayOccurrences.filter((occurrence) => occurrence.startTime),
    [dayOccurrences],
  );
  const untimedOccurrences = useMemo(
    () => dayOccurrences.filter((occurrence) => !occurrence.startTime),
    [dayOccurrences],
  );
  const selectedOccurrence = scheduledOccurrences.find(
    (occurrence) => occurrence.id === selectedOccurrenceId,
  );
  const editingOccurrence = scheduledOccurrences.find(
    (occurrence) => occurrence.id === editingOccurrenceId,
  );
  const recurrenceSignature = useMemo(
    () => JSON.stringify([recurrenceSeries, recurrenceRuleSegments]),
    [recurrenceRuleSegments, recurrenceSeries],
  );

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setCurrentTime(new Date()),
      60_000,
    );
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!recurrenceSeries.length) return;
    const date = parseLocalDate(selectedDate);
    const rangeStart =
      calendarView === "week"
        ? startOfWeek(date, { weekStartsOn })
        : calendarView === "month"
          ? startOfMonth(date)
          : date;
    const rangeEnd =
      calendarView === "week"
        ? addDays(rangeStart, 6)
        : calendarView === "multi-day"
          ? addDays(date, 2)
          : calendarView === "month"
            ? endOfMonth(date)
            : date;

    void dispatchCalendarCommand({
      type: "materialize-range",
      startDate: formatLocalDate(rangeStart),
      endDate: formatLocalDate(rangeEnd),
    });
  }, [
    calendarView,
    recurrenceSignature,
    recurrenceSeries.length,
    selectedDate,
    weekStartsOn,
  ]);

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = scheduledOccurrences.flatMap(
      (occurrence) => {
        if (occurrence.isSkipped) return [];
        const timeRange = getOccurrenceTimeRange(occurrence);
        if (!timeRange) return [];

        return [
          {
            id: occurrence.id,
            title: occurrence.title,
            start: timeRange.start,
            end: timeRange.end,
            classNames: [
              "calendar-task-event",
              `calendar-task-event--${occurrence.category}`,
              ...(occurrence.isCompleted
                ? ["calendar-task-event--completed"]
                : []),
            ],
          },
        ];
      },
    );
    const currentDay = getLocalDayRange(today);

    if (
      calendarView !== "month" &&
      currentTime.getTime() > currentDay.start.getTime()
    ) {
      events.push({
        id: "calendar-time-progress",
        title: "",
        start: currentDay.start,
        end: currentTime,
        display: "background",
        classNames: ["calendar-time-progress"],
      });
    }

    return events;
  }, [calendarView, currentTime, scheduledOccurrences, today]);

  const currentView =
    calendarViews.find((view) => view.id === calendarView) ?? calendarViews[0];

  const openScheduleDialog = () => {
    const defaultDuration = activeTasks[0]?.defaultDurationMinutes ?? 30;
    setPlanDate(selectedDate);
    setEditingOccurrenceScope(null);
    setEditingOccurrenceId(null);
    setPlanMode(activeTasks.length ? "existing" : "new");
    setSelectedTaskId(activeTasks[0]?.id ?? "");
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsTimed(false);
    setStartTime("09:00");
    setDurationChoice(
      quickDurations.includes(defaultDuration)
        ? String(defaultDuration)
        : "custom",
    );
    setCustomDuration(String(defaultDuration));
    setIsRecurring(false);
    setRecurrenceFrequency("weekly");
    setRecurrenceInterval("1");
    setRecurrenceWeekdays([parseLocalDate(selectedDate).getDay()]);
    setMonthlyMode("dayOfMonth");
    setMonthDay(String(parseLocalDate(selectedDate).getDate()));
    setMonthlyWeekday(String(parseLocalDate(selectedDate).getDay()));
    setWeekdayOrdinal(getWeekdayOrdinal(selectedDate));
    setRecurrenceEndMode("never");
    setRecurrenceEndDate(selectedDate);
    setOccurrenceCount("10");
    setIsScheduleDialogOpen(true);
  };

  const openEditDialog = (
    occurrence: ScheduledOccurrence,
    scope: "occurrence" | "future" | "series",
  ) => {
    const task = activeTasks.find((item) => item.id === occurrence.taskId);
    const date = parseLocalDate(occurrence.date);
    const defaultDuration =
      occurrence.durationMinutes ?? task?.defaultDurationMinutes ?? 30;
    const segment = recurrenceRuleSegments.find(
      (item) => item.id === occurrence.segmentId,
    );

    setSelectedOccurrenceId(null);
    setEditingOccurrenceId(occurrence.id);
    setEditingOccurrenceScope(scope);
    setPlanDate(occurrence.date);
    setPlanMode("existing");
    setSelectedTaskId(occurrence.taskId);
    setIsTimed(Boolean(occurrence.startTime));
    setStartTime(occurrence.startTime ?? "09:00");
    setDurationChoice(
      quickDurations.includes(defaultDuration)
        ? String(defaultDuration)
        : "custom",
    );
    setCustomDuration(String(defaultDuration));
    setIsRecurring(Boolean(occurrence.seriesId && scope !== "occurrence"));
    setRecurrenceFrequency(segment?.frequency ?? "weekly");
    setRecurrenceInterval(String(segment?.interval ?? 1));
    setRecurrenceWeekdays(segment?.weekdays ?? [date.getDay()]);
    setMonthlyMode(segment?.monthlyMode ?? "dayOfMonth");
    setMonthDay(String(segment?.monthDay ?? date.getDate()));
    setMonthlyWeekday(String(segment?.weekday ?? date.getDay()));
    setWeekdayOrdinal(
      segment?.weekdayOrdinal ?? getWeekdayOrdinal(occurrence.date),
    );
    setRecurrenceEndMode(
      segment?.endDate ? "date" : segment?.occurrenceCount ? "count" : "never",
    );
    setRecurrenceEndDate(segment?.endDate ?? occurrence.date);
    setOccurrenceCount(String(segment?.occurrenceCount ?? 10));
    setIsScheduleDialogOpen(true);
  };

  const handleSubmitPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const durationMinutes =
      durationChoice === "custom"
        ? Number(customDuration)
        : Number(durationChoice);
    const rule: RecurrenceRuleDraft = {
      frequency: recurrenceFrequency,
      interval: Number(recurrenceInterval),
      ...(recurrenceFrequency === "weekly" && {
        weekdays: recurrenceWeekdays,
      }),
      ...(recurrenceFrequency === "monthly" &&
        (monthlyMode === "dayOfMonth"
          ? { monthlyMode, monthDay: Number(monthDay) }
          : {
              monthlyMode,
              weekday: Number(monthlyWeekday),
              weekdayOrdinal,
            })),
      ...(isTimed && { startTime, durationMinutes }),
      ...(recurrenceEndMode === "date" && { endDate: recurrenceEndDate }),
      ...(recurrenceEndMode === "count" && {
        occurrenceCount: Number(occurrenceCount),
      }),
    };
    let command: CalendarCoordinatorCommand;
    if (editingOccurrenceScope === "occurrence" && editingOccurrence) {
      command = {
        type: "edit-occurrence",
        occurrenceId: editingOccurrence.id,
        ...(isTimed && { startTime, durationMinutes }),
      };
    } else if (
      (editingOccurrenceScope === "future" ||
        editingOccurrenceScope === "series") &&
      editingOccurrence?.seriesId
    ) {
      command = {
        type: "edit-recurrence",
        seriesId: editingOccurrence.seriesId,
        date: planDate,
        scope: editingOccurrenceScope,
        rule,
      };
    } else if (isRecurring) {
      command =
        planMode === "new"
          ? {
              type: "create-task-and-recurrence",
              title: newTaskTitle,
              description: newTaskDescription,
              startDate: planDate,
              rule,
            }
          : {
              type: "create-recurrence",
              taskId: selectedTaskId,
              startDate: planDate,
              rule,
            };
    } else {
      command =
        planMode === "new"
          ? {
              type: "create-task-and-schedule",
              title: newTaskTitle,
              description: newTaskDescription,
              date: planDate,
              ...(isTimed && { startTime, durationMinutes }),
            }
          : {
              type: "schedule-task",
              taskId: selectedTaskId,
              date: planDate,
              ...(isTimed && { startTime, durationMinutes }),
            };
    }

    const result = await dispatchCalendarCommand(command);
    if (result.success) {
      setIsScheduleDialogOpen(false);
      setEditingOccurrenceScope(null);
      setEditingOccurrenceId(null);
    }
  };

  const handleRemoveOccurrence = async () => {
    if (!selectedOccurrence) return;
    const result = await dispatchCalendarCommand({
      type: "delete-scheduled-occurrence",
      occurrenceId: selectedOccurrence.id,
      scope: deleteScope,
    });
    if (result.success) {
      setSelectedOccurrenceId(null);
      setIsConfirmingRemoval(false);
    }
  };

  const handleToggleOccurrenceCompletion = async () => {
    if (!selectedOccurrence) return;
    await dispatchCalendarCommand({
      type: "set-occurrence-completion",
      occurrenceId: selectedOccurrence.id,
      completed: !selectedOccurrence.isCompleted,
    });
  };

  const showOccurrence = (occurrenceId: string) => {
    setIsConfirmingRemoval(false);
    setDeleteScope("occurrence");
    setSelectedOccurrenceId(occurrenceId);
  };

  const movePeriod = (direction: number) => {
    const date = parseLocalDate(selectedDate);
    const nextDate =
      calendarView === "month"
        ? addMonths(date, direction)
        : addDays(
            date,
            direction *
              (calendarView === "day"
                ? 1
                : calendarView === "multi-day"
                  ? 3
                  : 7),
          );
    setSelectedDate(formatLocalDate(nextDate));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <header className="border-base-content/10 bg-base-200 flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-base-content/75 mb-2 text-sm font-semibold tracking-wide uppercase">
            Make space for focused work
          </p>
          <h1 className="text-base-content text-3xl font-bold text-balance sm:text-4xl">
            Your Calendar
          </h1>
          <p className="text-base-content/75 mt-2 max-w-xl">
            Shape today around the tasks that matter. Your plans stay separate
            from task completion and due dates.
          </p>
        </div>
        <Button
          className="min-h-11 shrink-0 gap-2"
          onClick={openScheduleDialog}
          aria-label="Add a task to this day"
        >
          <MdAdd aria-hidden="true" size={20} />
          Add to day
        </Button>
      </header>

      <section
        aria-label={`${currentView.label} planner`}
        className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]"
      >
        <div className="calendar-panel border-base-content/10 bg-base-100 min-w-0 rounded-2xl border p-4 shadow-sm sm:p-6">
          <div className="mb-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  color="ghost"
                  className="min-h-11 min-w-11 px-2"
                  aria-label={currentView.previousLabel}
                  onClick={() => movePeriod(-1)}
                >
                  <MdArrowBack aria-hidden="true" size={20} />
                </Button>
                <Button
                  color="ghost"
                  className="min-h-11 min-w-11 px-2"
                  aria-label={currentView.nextLabel}
                  onClick={() => movePeriod(1)}
                >
                  <MdArrowForward aria-hidden="true" size={20} />
                </Button>
                <div className="ml-1 min-w-0">
                  <h2 className="text-base-content text-lg font-semibold">
                    {getViewDateLabel(calendarView, selectedDate, weekStartsOn)}
                  </h2>
                  <p
                    className="text-base-content/75 text-sm"
                    role="status"
                    aria-live="polite"
                  >
                    {timedOccurrences.length} timed
                    {" · "}
                    {untimedOccurrences.length} untimed on the selected date
                  </p>
                </div>
              </div>
              <Button
                color="outline"
                className="min-h-11"
                disabled={selectedDate === today}
                onClick={() => setSelectedDate(today)}
              >
                Today
              </Button>
            </div>
            <div
              className="join max-w-full"
              role="group"
              aria-label="Calendar view"
            >
              {calendarViews.map((view) => (
                <Button
                  key={view.id}
                  color={calendarView === view.id ? "primary" : "ghost"}
                  className="join-item min-h-11 px-2 sm:px-3"
                  aria-pressed={calendarView === view.id}
                  onClick={() => setCalendarView(view.id)}
                >
                  {view.label}
                </Button>
              ))}
            </div>
          </div>

          <div
            className={`calendar-planner calendar-planner--${calendarView} min-w-0 overflow-x-auto`}
          >
            <time className="sr-only" dateTime={currentTime.toISOString()}>
              Current local time is {currentTimeLabel}. Today’s timeline is
              shaded through this time in the day, multi day, and week views.
            </time>
            <FullCalendar
              key={`${calendarView}-${selectedDate}-${weekStartsOn}`}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView.fullCalendarView}
              views={{
                timeGridThreeDay: {
                  type: "timeGrid",
                  duration: { days: 3 },
                },
              }}
              initialDate={selectedDate}
              headerToolbar={false}
              timeZone="local"
              firstDay={weekStartsOn}
              events={calendarEvents}
              eventClick={(info) => showOccurrence(info.event.id)}
              dateClick={(info) => {
                if (calendarView !== "month") return;
                setSelectedDate(info.dateStr);
                setCalendarView("day");
              }}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              slotDuration="00:30:00"
              scrollTime="08:00:00"
              allDaySlot={false}
              nowIndicator
              height="auto"
              eventDisplay={calendarView === "month" ? "list-item" : "block"}
              slotHeaderFormat={{
                hour: "numeric",
                minute: "2-digit",
                hour12: false,
              }}
              eventTimeFormat={{ hour: "numeric", minute: "2-digit" }}
              noEventsContent="No timed plans yet. Add a task to shape this day."
            />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--navbar-height)_+_1rem)] lg:self-start">
          <section className="border-base-content/10 bg-base-100 rounded-2xl border p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base-content text-lg font-semibold">
                  Without a time
                </h2>
                <p className="text-base-content/75 mt-1 text-sm">
                  Keep flexible tasks close without placing them on the
                  timeline.
                </p>
              </div>
              <span className="badge badge-primary badge-soft">
                {untimedOccurrences.length}
              </span>
            </div>

            {untimedOccurrences.length ? (
              <ul className="space-y-2">
                {untimedOccurrences.map((occurrence) => (
                  <li key={occurrence.id}>
                    <button
                      type="button"
                      className="group border-base-content/10 bg-base-200/60 hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-primary flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-500 focus-visible:ring-2"
                      onClick={() => showOccurrence(occurrence.id)}
                    >
                      <span className="min-w-0">
                        <span className="text-base-content block truncate font-medium">
                          {occurrence.title}
                        </span>
                        <span className="text-base-content/75 block text-xs capitalize">
                          {occurrence.category.replaceAll("-", " ")}
                        </span>
                      </span>
                      <MdArrowForward
                        aria-hidden="true"
                        className="text-base-content/45 shrink-0 transition-transform group-hover:translate-x-1"
                        size={18}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-base-content/20 bg-base-200/40 rounded-xl border border-dashed px-4 py-5 text-center">
                <p className="text-base-content font-medium">
                  Nothing flexible planned
                </p>
                <p className="text-base-content/75 mt-1 text-sm">
                  Add an untimed task here, then fit it in when you are ready.
                </p>
                <Button
                  color="ghost"
                  className="mt-3 min-h-11"
                  onClick={openScheduleDialog}
                >
                  <MdAdd aria-hidden="true" size={18} />
                  Add a task
                </Button>
              </div>
            )}
          </section>

          <section className="border-base-content/10 bg-base-200/70 rounded-2xl border p-5">
            <h2 className="text-base-content font-semibold">
              A plan that bends
            </h2>
            <p className="text-base-content/75 mt-2 text-sm leading-relaxed">
              Plans are a guide, not a deadline. Moving a task here never marks
              its reusable task as complete.
            </p>
          </section>
        </aside>
      </section>

      <Modal
        isOpen={isScheduleDialogOpen}
        onClose={() => {
          setIsScheduleDialogOpen(false);
          setEditingOccurrenceScope(null);
          setEditingOccurrenceId(null);
        }}
        title={
          editingOccurrenceScope
            ? "Edit planned task"
            : "Add a task to your day"
        }
        size="md"
        showCloseButton={false}
      >
        <form className="space-y-4" onSubmit={handleSubmitPlan}>
          {editingOccurrenceScope ? (
            <p className="text-base-content/75 text-sm">
              Editing {editingOccurrence?.title} on {getDateLabel(planDate)}.
            </p>
          ) : (
            <>
              <div
                className="join w-full"
                role="group"
                aria-label="Task source"
              >
                <Button
                  color={planMode === "existing" ? "primary" : "outline"}
                  className="join-item min-h-11 flex-1"
                  aria-pressed={planMode === "existing"}
                  disabled={!activeTasks.length}
                  onClick={() => setPlanMode("existing")}
                >
                  Choose a task
                </Button>
                <Button
                  color={planMode === "new" ? "primary" : "outline"}
                  className="join-item min-h-11 flex-1"
                  aria-pressed={planMode === "new"}
                  onClick={() => setPlanMode("new")}
                >
                  Create a task
                </Button>
              </div>

              {planMode === "existing" ? (
                <label className="form-control w-full">
                  <span className="label-text mb-2 font-medium">Task</span>
                  <select
                    className="select select-bordered select-primary min-h-12 w-full"
                    name="taskId"
                    required
                    value={selectedTaskId}
                    onChange={(event) => {
                      const taskId = event.currentTarget.value;
                      setSelectedTaskId(taskId);
                      const task = activeTasks.find(
                        (item) => item.id === taskId,
                      );
                      const defaultDuration =
                        task?.defaultDurationMinutes ?? 30;
                      setDurationChoice(
                        quickDurations.includes(defaultDuration)
                          ? String(defaultDuration)
                          : "custom",
                      );
                      setCustomDuration(String(defaultDuration));
                    }}
                  >
                    <option value="" disabled>
                      Choose a task to schedule
                    </option>
                    {activeTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Task name"
                    name="title"
                    placeholder="What would you like to work on…"
                    autoComplete="off"
                    required
                    value={newTaskTitle}
                    onChange={(event) =>
                      setNewTaskTitle(event.currentTarget.value)
                    }
                  />
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">
                      Description{" "}
                      <span className="text-base-content/75">(optional)</span>
                    </span>
                    <textarea
                      className="textarea textarea-bordered textarea-primary min-h-20 w-full"
                      name="description"
                      placeholder="Add a little context…"
                      value={newTaskDescription}
                      onChange={(event) =>
                        setNewTaskDescription(event.currentTarget.value)
                      }
                    />
                  </label>
                  <p className="text-base-content/75 text-sm">
                    New tasks are added to your Uncategorised list with a 30
                    minute default duration.
                  </p>
                </div>
              )}
            </>
          )}

          <label className="label border-base-content/15 min-h-12 cursor-pointer justify-start gap-3 rounded-xl border px-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={isTimed}
              onChange={(event) => setIsTimed(event.currentTarget.checked)}
            />
            <span className="label-text font-medium">
              Set a time on the calendar
            </span>
          </label>

          {editingOccurrenceScope === null && (
            <label className="label border-base-content/15 min-h-12 cursor-pointer justify-start gap-3 rounded-xl border px-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isRecurring}
                onChange={(event) =>
                  setIsRecurring(event.currentTarget.checked)
                }
              />
              <span className="label-text font-medium">Repeat this plan</span>
            </label>
          )}

          {isTimed && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">Start time</span>
                <input
                  className="input input-bordered input-primary min-h-12 w-full"
                  type="time"
                  name="startTime"
                  step={60}
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.currentTarget.value)}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-2 font-medium">Duration</span>
                <select
                  className="select select-bordered select-primary min-h-12 w-full"
                  name="duration"
                  value={durationChoice}
                  onChange={(event) =>
                    setDurationChoice(event.currentTarget.value)
                  }
                >
                  {quickDurations.map((duration) => (
                    <option key={duration} value={duration}>
                      {formatDuration(duration)}
                    </option>
                  ))}
                  <option value="custom">Custom duration</option>
                </select>
                {durationChoice === "custom" && (
                  <Input
                    className="mt-2"
                    aria-label="Custom duration in minutes"
                    type="number"
                    name="customDuration"
                    min={1}
                    max={1440}
                    step={1}
                    required
                    value={customDuration}
                    onChange={(event) =>
                      setCustomDuration(event.currentTarget.value)
                    }
                  />
                )}
              </label>
            </div>
          )}

          {isRecurring && (
            <fieldset className="border-base-content/15 space-y-3 rounded-xl border p-4">
              <legend className="px-1 font-semibold">Repeat pattern</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label-text mb-2 font-medium">Frequency</span>
                  <select
                    className="select select-bordered select-primary min-h-12 w-full"
                    value={recurrenceFrequency}
                    onChange={(event) =>
                      setRecurrenceFrequency(
                        event.currentTarget.value as RecurrenceFrequency,
                      )
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
                <label className="form-control w-full">
                  <span className="label-text mb-2 font-medium">
                    Repeat every
                  </span>
                  <input
                    className="input input-bordered input-primary min-h-12 w-full"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={recurrenceInterval}
                    onChange={(event) =>
                      setRecurrenceInterval(event.currentTarget.value)
                    }
                  />
                </label>
              </div>

              {recurrenceFrequency === "weekly" && (
                <div>
                  <p className="label-text mb-2 font-medium">Repeat on</p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Repeat on weekdays"
                  >
                    {weekdays.map((weekday, index) => {
                      const selected = recurrenceWeekdays.includes(index);
                      return (
                        <Button
                          key={weekday}
                          type="button"
                          color={selected ? "primary" : "outline"}
                          className="min-h-11 min-w-11"
                          aria-pressed={selected}
                          onClick={() =>
                            setRecurrenceWeekdays((current) =>
                              selected
                                ? current.filter((day) => day !== index)
                                : [...current, index].sort(),
                            )
                          }
                        >
                          {weekday}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {recurrenceFrequency === "monthly" && (
                <div className="space-y-3">
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">
                      Monthly pattern
                    </span>
                    <select
                      className="select select-bordered select-primary min-h-12 w-full"
                      value={monthlyMode}
                      onChange={(event) =>
                        setMonthlyMode(
                          event.currentTarget.value as
                            | "dayOfMonth"
                            | "weekdayOrdinal",
                        )
                      }
                    >
                      <option value="dayOfMonth">Day of the month</option>
                      <option value="weekdayOrdinal">
                        A weekday of the month
                      </option>
                    </select>
                  </label>
                  {monthlyMode === "dayOfMonth" ? (
                    <label className="form-control w-full">
                      <span className="label-text mb-2 font-medium">
                        Day of the month
                      </span>
                      <input
                        className="input input-bordered input-primary min-h-12 w-full"
                        type="number"
                        min={1}
                        max={31}
                        required
                        value={monthDay}
                        onChange={(event) =>
                          setMonthDay(event.currentTarget.value)
                        }
                      />
                    </label>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="form-control w-full">
                        <span className="label-text mb-2 font-medium">
                          Week
                        </span>
                        <select
                          className="select select-bordered select-primary min-h-12 w-full"
                          value={weekdayOrdinal}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            setWeekdayOrdinal(
                              value === "last"
                                ? "last"
                                : (Number(value) as 1 | 2 | 3 | 4 | 5),
                            );
                          }}
                        >
                          <option value={1}>First</option>
                          <option value={2}>Second</option>
                          <option value={3}>Third</option>
                          <option value={4}>Fourth</option>
                          <option value={5}>Fifth</option>
                          <option value="last">Last</option>
                        </select>
                      </label>
                      <label className="form-control w-full">
                        <span className="label-text mb-2 font-medium">
                          Weekday
                        </span>
                        <select
                          className="select select-bordered select-primary min-h-12 w-full"
                          value={monthlyWeekday}
                          onChange={(event) =>
                            setMonthlyWeekday(event.currentTarget.value)
                          }
                        >
                          {weekdays.map((weekday, index) => (
                            <option key={weekday} value={index}>
                              {weekday}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <label className="form-control w-full">
                  <span className="label-text mb-2 font-medium">Ends</span>
                  <select
                    className="select select-bordered select-primary min-h-12 w-full"
                    value={recurrenceEndMode}
                    onChange={(event) =>
                      setRecurrenceEndMode(
                        event.currentTarget.value as "never" | "date" | "count",
                      )
                    }
                  >
                    <option value="never">Never</option>
                    <option value="date">On a date</option>
                    <option value="count">After a number of occurrences</option>
                  </select>
                </label>
                {recurrenceEndMode === "date" && (
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">
                      End date
                    </span>
                    <input
                      className="input input-bordered input-primary min-h-12 w-full"
                      type="date"
                      min={planDate}
                      required
                      value={recurrenceEndDate}
                      onChange={(event) =>
                        setRecurrenceEndDate(event.currentTarget.value)
                      }
                    />
                  </label>
                )}
                {recurrenceEndMode === "count" && (
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">
                      Number of occurrences
                    </span>
                    <input
                      className="input input-bordered input-primary min-h-12 w-full"
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={occurrenceCount}
                      onChange={(event) =>
                        setOccurrenceCount(event.currentTarget.value)
                      }
                    />
                  </label>
                )}
              </div>
            </fieldset>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              color="ghost"
              className="min-h-11"
              onClick={() => {
                setIsScheduleDialogOpen(false);
                setEditingOccurrenceScope(null);
                setEditingOccurrenceId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 gap-2">
              {!editingOccurrenceScope && (
                <MdAdd aria-hidden="true" size={18} />
              )}
              {editingOccurrenceScope
                ? "Save changes"
                : isRecurring
                  ? "Add recurring plan"
                  : "Add to day"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={selectedOccurrence !== undefined}
        onClose={() => {
          setSelectedOccurrenceId(null);
          setIsConfirmingRemoval(false);
          setDeleteScope("occurrence");
        }}
        title={selectedOccurrence?.title}
        size="sm"
        showCloseButton={false}
      >
        {selectedOccurrence && (
          <div className="space-y-4">
            {selectedOccurrence.description && (
              <p className="text-base-content/70">
                {selectedOccurrence.description}
              </p>
            )}
            <div className="bg-base-200 rounded-xl px-4 py-3 text-sm">
              <p>{getDateLabel(selectedOccurrence.date)}</p>
              <p className="text-base-content/75 mt-1">
                {selectedOccurrence.startTime
                  ? `${selectedOccurrence.startTime} · ${formatDuration(selectedOccurrence.durationMinutes ?? 30)}`
                  : "No time set"}
              </p>
            </div>
            <Button
              color={selectedOccurrence.isCompleted ? "outline" : "primary"}
              className="min-h-11 w-full"
              aria-pressed={selectedOccurrence.isCompleted}
              onClick={() => void handleToggleOccurrenceCompletion()}
            >
              {selectedOccurrence.isCompleted
                ? "Mark as not done"
                : "Mark as done"}
            </Button>
            {isConfirmingRemoval ? (
              <div
                className="border-error/30 bg-error/5 space-y-3 rounded-xl border p-4"
                aria-live="polite"
              >
                <p className="font-medium">
                  {selectedOccurrence.seriesId
                    ? "Remove recurring plans?"
                    : "Remove this plan from the day?"}
                </p>
                {selectedOccurrence.seriesId && (
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">Remove</span>
                    <select
                      className="select select-bordered select-primary min-h-12 w-full"
                      aria-label="Removal scope"
                      value={deleteScope}
                      onChange={(event) =>
                        setDeleteScope(
                          event.currentTarget.value as
                            | "occurrence"
                            | "future"
                            | "series",
                        )
                      }
                    >
                      <option value="occurrence">This occurrence</option>
                      <option value="future">This and following</option>
                      <option value="series">Entire series</option>
                    </select>
                  </label>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    color="ghost"
                    className="min-h-11"
                    onClick={() => {
                      setIsConfirmingRemoval(false);
                      setDeleteScope("occurrence");
                    }}
                  >
                    Keep plan
                  </Button>
                  <Button
                    type="button"
                    color="neutral"
                    className="min-h-11"
                    onClick={() => void handleRemoveOccurrence()}
                  >
                    Remove plan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-base-content/75 text-sm font-medium">
                    Edit
                  </p>
                  <Button
                    color="outline"
                    className="min-h-11 w-full"
                    onClick={() =>
                      openEditDialog(selectedOccurrence, "occurrence")
                    }
                  >
                    {selectedOccurrence.seriesId
                      ? "This occurrence"
                      : "Edit plan"}
                  </Button>
                  {selectedOccurrence.seriesId && (
                    <>
                      <Button
                        color="outline"
                        className="min-h-11 w-full"
                        onClick={() =>
                          openEditDialog(selectedOccurrence, "future")
                        }
                      >
                        This and following
                      </Button>
                      <Button
                        color="outline"
                        className="min-h-11 w-full"
                        onClick={() =>
                          openEditDialog(selectedOccurrence, "series")
                        }
                      >
                        Entire series
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    type="button"
                    color="ghost"
                    className="min-h-11 gap-2"
                    onClick={() => setSelectedOccurrenceId(null)}
                  >
                    <MdClose aria-hidden="true" size={18} />
                    Close
                  </Button>
                  <Button
                    type="button"
                    color="neutral"
                    className="min-h-11"
                    onClick={() => setIsConfirmingRemoval(true)}
                  >
                    Remove plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarRoute;
