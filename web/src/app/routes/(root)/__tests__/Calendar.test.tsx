import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { addDays, addMonths } from "date-fns";
import type { Task } from "@/features/tasks/types/task";
import {
  formatLocalDate,
  parseLocalDate,
} from "@/features/calendar/utils/calendar-date";
import {
  initialCalendarData,
  type ScheduledOccurrence,
} from "@/features/calendar/types/calendar";
import CalendarRoute from "@/app/routes/(root)/Calendar";
import { useCalendarStore, useTasksStore } from "@/stores";

type CalendarMockEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  display?: string;
  classNames?: string[];
};

vi.mock("@fullcalendar/react", () => ({
  default: ({
    events = [],
    eventClick,
    initialDate,
    initialView,
    firstDay,
    dateClick,
    nowIndicator,
  }: {
    events?: CalendarMockEvent[];
    eventClick?: (info: { event: { id: string } }) => void;
    initialDate: string;
    initialView: string;
    firstDay?: number;
    dateClick?: (info: { dateStr: string }) => void;
    nowIndicator?: boolean;
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
        data-progress-start={timeProgress?.start.toISOString()}
        data-progress-end={timeProgress?.end.toISOString()}
        data-progress-title={timeProgress?.title ?? ""}
      >
        {visibleEvents
          .filter((event) => event.display !== "background")
          .map((event) => (
            <button
              key={event.id}
              type="button"
              className={event.classNames?.join(" ")}
              onClick={() => eventClick?.({ event: { id: event.id } })}
            >
              {event.title}
            </button>
          ))}
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
  });
};

beforeEach(() => {
  let id = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `calendar-id-${++id}` });
});

afterEach(() => {
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

    expect(
      screen.getByRole("button", { name: existingTask.title }),
    ).toHaveClass(
      "calendar-task-event",
      "calendar-task-event--urgent-important",
      "calendar-task-event--completed",
    );
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
