import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { addDays, addMonths } from "date-fns";
// @ts-expect-error Node types are not included in the web project.
import { readFileSync } from "node:fs";
import type { Task } from "@/features/tasks/types/task";
import {
  formatLocalDate,
  parseLocalDate,
} from "@/features/calendar/utils/calendar-date";
import {
  initialCalendarData,
  type ScheduledOccurrence,
} from "@/features/calendar/types/calendar";
import { initialSleepScheduleData } from "@/features/sleep-schedule/types/sleep-schedule";
import CalendarRoute from "@/app/routes/(root)/Calendar";
import {
  useCalendarStore,
  useSleepScheduleStore,
  useTasksStore,
} from "@/stores";

const calendarStyles = readFileSync(
  "src/app/routes/(root)/calendar.css",
  "utf8",
);

type CalendarMockEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  display?: string;
  classNames?: string[];
  kind?: string;
};

type CalendarMockEventApi = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: { kind?: string };
};

vi.mock("@fullcalendar/react", () => ({
  default: ({
    events = [],
    eventClick,
    eventAllow,
    eventDrop,
    eventResize,
    eventContent,
    initialDate,
    initialView,
    firstDay,
    dateClick,
    nowIndicator,
    editable,
    snapDuration,
  }: {
    events?: CalendarMockEvent[];
    eventClick?: (info: {
      event: { id: string; extendedProps: { kind?: string } };
    }) => void;
    eventAllow?: (
      dropInfo: { start: Date; end: Date },
      event: CalendarMockEventApi,
    ) => boolean;
    eventDrop?: (info: {
      event: CalendarMockEventApi;
      revert: () => void;
    }) => void;
    eventResize?: (info: {
      event: CalendarMockEventApi;
      revert: () => void;
    }) => void;
    eventContent?: (info: {
      event: CalendarMockEventApi;
      timeText: string;
    }) => ReactNode | undefined;
    initialDate: string;
    initialView: string;
    firstDay?: number;
    dateClick?: (info: { dateStr: string }) => void;
    nowIndicator?: boolean;
    editable?: boolean;
    snapDuration?: string;
  }) => {
    const date = parseLocalDate(initialDate);
    const viewStart =
      initialView === "dayGridMonth"
        ? new Date(date.getFullYear(), date.getMonth(), 1)
        : date;
    const viewEnd =
      initialView === "dayGridMonth"
        ? new Date(date.getFullYear(), date.getMonth() + 1, 1)
        : addDays(
            viewStart,
            initialView === "timeGridThreeDay"
              ? 3
              : initialView === "timeGridWeek"
                ? 7
                : 1,
          );
    const visibleEvents = events.filter(
      (event) => event.start < viewEnd && event.end > viewStart,
    );
    const timeProgress = visibleEvents.find((event) =>
      event.classNames?.includes("calendar-time-progress"),
    );

    return (
      <div
        data-testid="day-calendar"
        data-date={initialDate}
        data-view={initialView}
        data-first-day={firstDay}
        data-now-indicator={nowIndicator}
        data-editable={editable}
        data-snap-duration={snapDuration}
        data-progress-start={timeProgress?.start.toISOString()}
        data-progress-end={timeProgress?.end.toISOString()}
        data-progress-title={timeProgress?.title ?? ""}
        data-sleep-event-count={
          visibleEvents.filter((event) =>
            event.classNames?.includes("calendar-sleep-event"),
          ).length
        }
        data-sleep-rail-count={
          visibleEvents.filter((event) =>
            event.classNames?.includes("calendar-sleep-rail"),
          ).length
        }
      >
        {visibleEvents
          .filter((event) => event.display !== "background")
          .map((event) => {
            const eventApi: CalendarMockEventApi = {
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              extendedProps: { kind: event.kind },
            };

            return (
              <div
                key={event.id}
                data-can-drop-next-day={eventAllow?.(
                  {
                    start: addDays(event.start, 1),
                    end: addDays(event.end, 1),
                  },
                  eventApi,
                )}
              >
                <button
                  type="button"
                  className={event.classNames?.join(" ")}
                  aria-label={event.title}
                  onClick={() =>
                    eventClick?.({
                      event: {
                        id: event.id,
                        extendedProps: { kind: event.kind },
                      },
                    })
                  }
                >
                  {eventContent?.({
                    event: eventApi,
                    timeText: "9:00 AM - 9:45 AM",
                  }) ?? event.title}
                </button>
                {event.kind === "task" && (
                  <>
                    <button
                      type="button"
                      data-testid={`move-calendar-event-${event.id}`}
                      hidden
                      onClick={() =>
                        eventDrop?.({
                          event: {
                            ...eventApi,
                            start: new Date(event.start.getTime() + 300_000),
                            end: new Date(event.end.getTime() + 300_000),
                          },
                          revert: vi.fn(),
                        })
                      }
                    />
                    <button
                      type="button"
                      data-testid={`resize-calendar-event-${event.id}`}
                      hidden
                      onClick={() =>
                        eventResize?.({
                          event: {
                            ...eventApi,
                            end: new Date(event.end.getTime() + 300_000),
                          },
                          revert: vi.fn(),
                        })
                      }
                    />
                  </>
                )}
              </div>
            );
          })}
        {initialView === "dayGridMonth" && dateClick && (
          <button
            type="button"
            onClick={() => dateClick({ dateStr: "2026-11-27" })}
          >
            Choose a date
          </button>
        )}
      </div>
    );
  },
}));

vi.mock("@fullcalendar/react/timegrid", () => ({ default: {} }));

const existingTask: Task = {
  id: "task-1",
  title: "Prepare the outline",
  description: "Start with the main ideas",
  category: "urgent-important",
  isCompleted: false,
  isSelected: false,
  createdAt: 100,
  updatedAt: 100,
  defaultDurationMinutes: 45,
};

const setupStores = (tasks: Task[] = []) => {
  localStorage.clear();
  act(() => {
    useTasksStore.setState({ tasks });
    useCalendarStore.setState({ ...initialCalendarData });
    useSleepScheduleStore.setState(initialSleepScheduleData);
  });
};

beforeEach(() => {
  let id = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `calendar-id-${++id}` });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Calendar route", () => {
  it("fills today's timeline through the current local time", () => {
    setupStores();
    render(<CalendarRoute />);

    const calendar = screen.getByTestId("day-calendar");
    const progressStart = calendar.getAttribute("data-progress-start");
    const progressEnd = calendar.getAttribute("data-progress-end");

    expect(calendar).toHaveAttribute("data-now-indicator", "true");
    expect(calendar).toHaveAttribute("data-progress-title", "");
    expect(progressStart).not.toBeNull();
    expect(progressEnd).not.toBeNull();

    const start = new Date(progressStart!);
    const end = new Date(progressEnd!);
    const expectedStart = new Date();
    expectedStart.setHours(0, 0, 0, 0);

    expect(start.getTime()).toBe(expectedStart.getTime());
    expect(Math.abs(end.getTime() - Date.now())).toBeLessThan(60_000);
  });

  it("marks scheduled blocks with their category and completion state", () => {
    const today = formatLocalDate(new Date());
    setupStores([existingTask]);
    act(() =>
      useCalendarStore.setState({
        ...initialCalendarData,
        scheduledOccurrences: [
          {
            id: "occurrence-1",
            taskId: existingTask.id,
            date: today,
            startTime: "09:00",
            durationMinutes: 45,
            title: existingTask.title,
            category: existingTask.category,
            isCompleted: true,
            isSkipped: false,
          },
        ],
      }),
    );
    render(<CalendarRoute />);

    const taskEvent = screen.getByRole("button", {
      name: existingTask.title,
    });
    expect(taskEvent).toHaveClass(
      "calendar-task-event",
      "calendar-task-event--urgent-important",
      "calendar-task-event--completed",
    );
    expect(screen.getByText("45 min")).toHaveClass(
      "calendar-task-event-duration",
    );
    expect(within(taskEvent).getByText(existingTask.title)).toHaveClass(
      "calendar-task-event-title",
    );
    expect(calendarStyles).toContain(
      ".calendar-planner .calendar-task-event-content {",
    );
  });

  it("keeps short task blocks compact while showing the start time", () => {
    const today = formatLocalDate(new Date());
    setupStores([existingTask]);
    act(() =>
      useCalendarStore.setState({
        ...initialCalendarData,
        scheduledOccurrences: [
          {
            id: "short-occurrence",
            taskId: existingTask.id,
            date: today,
            startTime: "09:00",
            durationMinutes: 30,
            title: existingTask.title,
            category: existingTask.category,
            isCompleted: false,
            isSkipped: false,
          },
        ],
      }),
    );
    render(<CalendarRoute />);

    const taskEvent = screen.getByRole("button", {
      name: existingTask.title,
    });
    expect(within(taskEvent).getByText("09:00")).toHaveClass(
      "calendar-task-event-time--compact",
    );
    expect(within(taskEvent).getByText(existingTask.title)).toHaveClass(
      "calendar-task-event-title",
    );
    expect(taskEvent.children[0]).toHaveClass(
      "calendar-task-event-content--compact",
    );
  });

  it("renders planned sleep events, actual markers, and the awake rail", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 12));
    setupStores();
    const today = formatLocalDate(new Date());
    const yesterday = formatLocalDate(addDays(new Date(), -1));
    useSleepScheduleStore.setState({
      settings: {
        wakeTime: "07:00",
        targetSleepDurationMinutes: 480,
        bedTimeOverride: null,
      },
      actualRecords: [
        {
          id: "actual-night",
          sleepDate: yesterday,
          bedAt: new Date(`${yesterday}T22:30:00`).getTime(),
          wakeAt: new Date(`${today}T06:30:00`).getTime(),
        },
      ],
      recoveryEntries: [],
    });

    render(<CalendarRoute />);

    const calendar = screen.getByTestId("day-calendar");
    expect(
      Number(calendar.getAttribute("data-sleep-event-count")),
    ).toBeGreaterThan(0);
    expect(
      Number(calendar.getAttribute("data-sleep-rail-count")),
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Wake Up" })).toHaveClass(
      "calendar-sleep-event--planned",
    );
    expect(screen.getByRole("button", { name: "Actual wake" })).toHaveClass(
      "calendar-sleep-event--actual",
    );
    expect(screen.getByText("06:30")).toHaveClass("calendar-sleep-event-time");
    expect(screen.getByText("Wake Up")).toHaveClass(
      "calendar-sleep-event-title",
    );
    expect(screen.getByText(/8 hr sleep/)).toBeInTheDocument();
  });

  it("keeps sleep events and rails unavailable without a valid wake schedule", () => {
    setupStores();
    render(<CalendarRoute />);

    expect(screen.getByText(/No valid wake time is set/)).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-sleep-event-count",
      "0",
    );
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-sleep-rail-count",
      "0",
    );
  });

  it("shows sleep markers in Month without awake rails or daily totals", () => {
    setupStores();
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      settings: {
        wakeTime: "07:00",
        targetSleepDurationMinutes: 480,
        bedTimeOverride: null,
      },
    });
    render(<CalendarRoute />);

    fireEvent.click(screen.getByRole("button", { name: "Month" }));

    const calendar = screen.getByTestId("day-calendar");
    expect(
      Number(calendar.getAttribute("data-sleep-event-count")),
    ).toBeGreaterThan(0);
    expect(calendar).toHaveAttribute("data-sleep-rail-count", "0");
    expect(screen.queryByText("Awake idle time")).not.toBeInTheDocument();
  });

  it("shows one local day and navigates to the previous day", async () => {
    setupStores();
    render(<CalendarRoute />);

    const today = formatLocalDate(new Date());
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-date",
      today,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));

    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-date",
      formatLocalDate(addDays(new Date(), -1)),
    );
  }, 15_000);

  it("offers four views and navigates by the selected view interval", () => {
    setupStores();
    render(<CalendarRoute />);

    const today = formatLocalDate(new Date());
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-view",
      "timeGridDay",
    );

    fireEvent.click(screen.getByRole("button", { name: "Multi Day" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-view",
      "timeGridThreeDay",
    );
    fireEvent.click(screen.getByRole("button", { name: "Next 3 days" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-date",
      formatLocalDate(addDays(parseLocalDate(today), 3)),
    );

    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-view",
      "timeGridWeek",
    );
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    const dateAfterWeek = addDays(parseLocalDate(today), 10);
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-date",
      formatLocalDate(dateAfterWeek),
    );

    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-view",
      "dayGridMonth",
    );
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-date",
      formatLocalDate(addMonths(dateAfterWeek, 1)),
    );
  }, 15_000);

  it("opens a selected Month date in Day view", () => {
    setupStores();
    render(<CalendarRoute />);

    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose a date" }));

    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-view",
      "timeGridDay",
    );
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-date",
      "2026-11-27",
    );
  }, 15_000);

  it("applies the saved week start to Week and Month views", () => {
    setupStores();
    act(() =>
      useCalendarStore.setState({ ...initialCalendarData, weekStartsOn: 3 }),
    );
    render(<CalendarRoute />);

    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-first-day",
      "3",
    );

    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(screen.getByTestId("day-calendar")).toHaveAttribute(
      "data-first-day",
      "3",
    );
  }, 15_000);

  it("creates a shared task and keeps an untimed occurrence off the timeline", async () => {
    setupStores();
    render(<CalendarRoute />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add a task to this day" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Add a task to your day" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Create a task" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Task name" }), {
      target: { value: "Plan a study session" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add to day" }));

    await waitFor(() => {
      expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(1);
    });
    const occurrence = useCalendarStore.getState().scheduledOccurrences[0];
    expect(occurrence).toMatchObject({
      title: "Plan a study session",
      isCompleted: false,
      isSkipped: false,
    });
    expect(occurrence).not.toHaveProperty("startTime");
    expect(useTasksStore.getState().tasks[0]).toMatchObject({
      title: "Plan a study session",
      defaultDurationMinutes: 30,
    });
  }, 15_000);

  it("schedules a selected task using its default duration", async () => {
    setupStores([existingTask]);
    render(<CalendarRoute />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add a task to this day" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Set a time on the calendar" }),
    );

    expect(screen.getByRole("combobox", { name: "Duration" })).toHaveValue(
      "45",
    );
    fireEvent.click(screen.getByRole("button", { name: "Add to day" }));

    await waitFor(() => {
      expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(1);
    });
    expect(useCalendarStore.getState().scheduledOccurrences[0]).toMatchObject({
      taskId: "task-1",
      title: "Prepare the outline",
      startTime: "09:00",
      durationMinutes: 45,
    });
  }, 15_000);

  it("saves five minute drag and resize changes for a timed plan", async () => {
    const today = formatLocalDate(new Date());
    const occurrence: ScheduledOccurrence = {
      id: "timed-plan",
      taskId: existingTask.id,
      date: today,
      startTime: "09:00",
      durationMinutes: 45,
      title: existingTask.title,
      category: existingTask.category,
      isCompleted: false,
      isSkipped: false,
    };
    setupStores([existingTask]);
    useCalendarStore.setState({
      ...initialCalendarData,
      scheduledOccurrences: [occurrence],
    });

    render(<CalendarRoute />);

    const calendar = screen.getByTestId("day-calendar");
    expect(calendar).toHaveAttribute("data-editable", "true");
    expect(calendar).toHaveAttribute("data-snap-duration", "00:05:00");
    expect(
      screen.getByTestId("move-calendar-event-timed-plan").parentElement,
    ).toHaveAttribute("data-can-drop-next-day", "false");

    fireEvent.click(screen.getByTestId("move-calendar-event-timed-plan"));
    await waitFor(() => {
      expect(
        useCalendarStore.getState().scheduledOccurrences[0].startTime,
      ).toBe("09:05");
    });

    fireEvent.click(screen.getByTestId("resize-calendar-event-timed-plan"));
    await waitFor(() => {
      expect(useCalendarStore.getState().scheduledOccurrences[0]).toMatchObject(
        {
          startTime: "09:05",
          durationMinutes: 50,
        },
      );
    });
  }, 15_000);

  it("shows overlap warnings and next available times for the selected date", () => {
    const today = formatLocalDate(new Date());
    const firstOccurrence: ScheduledOccurrence = {
      id: "first-overlap",
      taskId: existingTask.id,
      date: today,
      startTime: "09:00",
      durationMinutes: 60,
      title: "First block",
      category: existingTask.category,
      isCompleted: false,
      isSkipped: false,
    };
    const secondOccurrence: ScheduledOccurrence = {
      ...firstOccurrence,
      id: "second-overlap",
      startTime: "09:30",
      title: "Second block",
    };
    setupStores([existingTask]);
    useCalendarStore.setState({
      ...initialCalendarData,
      scheduledOccurrences: [firstOccurrence, secondOccurrence],
    });

    render(<CalendarRoute />);

    expect(
      screen.getByRole("status", { name: "Schedule conflicts" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Overlaps with Second block.")).toBeInTheDocument();
    expect(
      screen.getByText("Next available: 10:30 (1 hr)."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First block" })).toHaveClass(
      "calendar-task-event--conflict",
    );
  });

  it("creates, edits, and removes a recurring plan through the calendar", async () => {
    setupStores([existingTask]);
    render(<CalendarRoute />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add a task to this day" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Repeat this plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Add recurring plan" }));

    await waitFor(() => {
      expect(useCalendarStore.getState().recurrenceSeries).toHaveLength(1);
      expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(1);
    });
    expect(useCalendarStore.getState().scheduledOccurrences[0]).toMatchObject({
      seriesId: useCalendarStore.getState().recurrenceSeries[0].id,
      segmentId: useCalendarStore.getState().recurrenceRuleSegments[0].id,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Prepare the outline/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Entire series" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Frequency" }), {
      target: { value: "daily" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(
        useCalendarStore.getState().recurrenceRuleSegments[0].frequency,
      ).toBe("daily");
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Prepare the outline/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove plan" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Removal scope" }), {
      target: { value: "series" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Remove plan" }));

    await waitFor(() => {
      expect(useCalendarStore.getState().recurrenceSeries).toHaveLength(0);
      expect(useCalendarStore.getState().recurrenceRuleSegments).toHaveLength(
        0,
      );
      expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(0);
    });
  }, 15_000);

  it("shows a timed task on the next day when it crosses midnight", () => {
    const overnightOccurrence: ScheduledOccurrence = {
      id: "overnight-1",
      taskId: existingTask.id,
      date: formatLocalDate(addDays(new Date(), -1)),
      startTime: "23:30",
      durationMinutes: 60,
      title: "Overnight focus",
      category: existingTask.category,
      isCompleted: false,
      isSkipped: false,
    };
    const finishedYesterday: ScheduledOccurrence = {
      ...overnightOccurrence,
      id: "finished-1",
      startTime: "08:00",
      durationMinutes: 30,
      title: "Finished yesterday",
    };
    setupStores([existingTask]);
    useCalendarStore.setState({
      ...initialCalendarData,
      scheduledOccurrences: [overnightOccurrence, finishedYesterday],
    });

    render(<CalendarRoute />);

    expect(
      screen.getByRole("button", { name: "Overnight focus" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Finished yesterday" }),
    ).not.toBeInTheDocument();
  }, 15_000);
});
