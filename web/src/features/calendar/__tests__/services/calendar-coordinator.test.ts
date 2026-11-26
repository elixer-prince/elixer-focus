import { waitFor } from "@testing-library/react";
import {
  applyCalendarCoordinatorCommand,
  dispatchCalendarCommand,
  startCalendarCoordinator,
  type CalendarSnapshot,
} from "@/features/calendar/services/calendar-coordinator";
import { initialCalendarData } from "@/features/calendar/types/calendar";
import type { Task } from "@/features/tasks/types/task";
import { useCalendarStore } from "@/features/calendar/stores/calendar-store";
import { useTasksStore } from "@/features/tasks/stores/tasks-store";

const task: Task = {
  id: "task-1",
  title: "Write a proposal",
  description: "Draft the outline",
  category: "urgent-important",
  isCompleted: false,
  isSelected: false,
  createdAt: 100,
  updatedAt: 100,
  defaultDurationMinutes: 45,
};

const channels: FakeBroadcastChannel[] = [];

class FakeBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  messages: unknown[] = [];
  closed = false;

  constructor(name: string) {
    this.name = name;
    channels.push(this);
  }

  postMessage(message: unknown) {
    this.messages.push(message);
  }

  close() {
    this.closed = true;
  }
}

const createSnapshot = (): CalendarSnapshot => ({
  tasks: [{ ...task }],
  calendar: { ...initialCalendarData, scheduledOccurrences: [] },
});

let stopCoordinator: (() => void) | undefined;

beforeEach(() => {
  channels.length = 0;
  let id = 0;
  vi.stubGlobal("crypto", {
    randomUUID: () => `generated-${++id}`,
  });
});

afterEach(() => {
  stopCoordinator?.();
  stopCoordinator = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: undefined,
  });
});

describe("calendar coordinator commands", () => {
  it("creates a shared task and a timed occurrence with independent defaults", () => {
    const result = applyCalendarCoordinatorCommand(
      createSnapshot(),
      {
        type: "create-task-and-schedule",
        title: "  Plan tomorrow  ",
        date: "2026-11-25",
        startTime: "09:15",
        durationMinutes: 60,
      },
      200,
    );

    expect(result.tasks[0]).toMatchObject({
      id: "generated-1",
      title: "Plan tomorrow",
      category: "uncategorised",
      defaultDurationMinutes: 30,
      createdAt: 200,
    });
    expect(result.calendar.scheduledOccurrences[0]).toMatchObject({
      id: "generated-2",
      taskId: "generated-1",
      date: "2026-11-25",
      startTime: "09:15",
      durationMinutes: 60,
      title: "Plan tomorrow",
      isCompleted: false,
      isSkipped: false,
    });
  });

  it("uses an existing task snapshot and its default duration", () => {
    const result = applyCalendarCoordinatorCommand(createSnapshot(), {
      type: "schedule-task",
      taskId: "task-1",
      date: "2026-11-25",
      startTime: "10:00",
    });

    expect(result.calendar.scheduledOccurrences[0]).toMatchObject({
      taskId: "task-1",
      date: "2026-11-25",
      startTime: "10:00",
      durationMinutes: 45,
      title: "Write a proposal",
      description: "Draft the outline",
      category: "urgent-important",
    });
  });

  it("keeps untimed occurrences separate from their reusable task duration", () => {
    const result = applyCalendarCoordinatorCommand(createSnapshot(), {
      type: "schedule-task",
      taskId: "task-1",
      date: "2026-11-25",
    });

    expect(result.calendar.scheduledOccurrences[0]).not.toHaveProperty(
      "startTime",
    );
    expect(result.calendar.scheduledOccurrences[0]).not.toHaveProperty(
      "durationMinutes",
    );
    expect(result.tasks[0].defaultDurationMinutes).toBe(45);
  });

  it.each([
    ["invalid calendar date", "2026-02-30", "09:00", 30],
    ["invalid local time", "2026-11-25", "25:00", 30],
    ["duration beyond one day", "2026-11-25", "09:00", 1441],
  ])("rejects %s", (_case, date, startTime, durationMinutes) => {
    expect(() =>
      applyCalendarCoordinatorCommand(createSnapshot(), {
        type: "schedule-task",
        taskId: "task-1",
        date,
        startTime,
        durationMinutes,
      }),
    ).toThrow();
  });

  it("keeps task completion independent from a scheduled occurrence", () => {
    const scheduled = applyCalendarCoordinatorCommand(createSnapshot(), {
      type: "schedule-task",
      taskId: "task-1",
      date: "2026-11-25",
    });
    const completed = applyCalendarCoordinatorCommand(
      scheduled,
      { type: "toggle-task-completion", taskId: "task-1", completed: true },
      300,
    );

    expect(completed.tasks[0].completedAt).toBe(300);
    expect(completed.calendar.scheduledOccurrences[0].isCompleted).toBe(false);
    expect(scheduled.tasks[0].isCompleted).toBe(false);
  });

  it("creates a recurring series and materializes each matching date once", () => {
    const created = applyCalendarCoordinatorCommand(createSnapshot(), {
      type: "create-recurrence",
      taskId: task.id,
      startDate: "2026-11-25",
      rule: {
        frequency: "daily",
        interval: 1,
        startTime: "09:00",
        durationMinutes: 45,
        occurrenceCount: 3,
      },
    });
    const materialized = applyCalendarCoordinatorCommand(created, {
      type: "materialize-range",
      startDate: "2026-11-24",
      endDate: "2026-11-30",
    });
    const repeated = applyCalendarCoordinatorCommand(materialized, {
      type: "materialize-range",
      startDate: "2026-11-24",
      endDate: "2026-11-30",
    });

    expect(repeated.calendar.recurrenceSeries).toHaveLength(1);
    expect(repeated.calendar.recurrenceRuleSegments).toHaveLength(1);
    expect(repeated.calendar.scheduledOccurrences).toHaveLength(3);
    expect(
      repeated.calendar.scheduledOccurrences.map(({ date }) => date),
    ).toEqual(["2026-11-25", "2026-11-26", "2026-11-27"]);
    expect(repeated.calendar.scheduledOccurrences[0]).toMatchObject({
      seriesId: repeated.calendar.recurrenceSeries[0].id,
      segmentId: repeated.calendar.recurrenceRuleSegments[0].id,
      startTime: "09:00",
      durationMinutes: 45,
    });
  });

  it("edits an entire series while retaining dated rule segment boundaries", () => {
    const snapshot = createSnapshot();
    snapshot.calendar.recurrenceSeries = [
      {
        id: "series-1",
        taskId: task.id,
        startDate: "2026-11-23",
        isActive: true,
      },
    ];
    snapshot.calendar.recurrenceRuleSegments = [
      {
        id: "segment-1",
        seriesId: "series-1",
        effectiveFrom: "2026-11-23",
        effectiveThrough: "2026-11-29",
        frequency: "daily",
        interval: 1,
      },
      {
        id: "segment-2",
        seriesId: "series-1",
        effectiveFrom: "2026-11-30",
        frequency: "daily",
        interval: 1,
      },
    ];
    snapshot.calendar.scheduledOccurrences = [
      {
        id: "occurrence-1",
        taskId: task.id,
        seriesId: "series-1",
        segmentId: "segment-1",
        date: "2026-11-23",
        title: task.title,
        description: task.description,
        category: task.category,
        isCompleted: false,
        isSkipped: false,
      },
      {
        id: "occurrence-2",
        taskId: task.id,
        seriesId: "series-1",
        segmentId: "segment-2",
        date: "2026-11-30",
        title: task.title,
        description: task.description,
        category: task.category,
        isCompleted: true,
        completedAt: 500,
        isSkipped: false,
      },
    ];

    const result = applyCalendarCoordinatorCommand(snapshot, {
      type: "edit-recurrence",
      seriesId: "series-1",
      date: "2026-11-23",
      scope: "series",
      rule: {
        frequency: "weekly",
        interval: 1,
        weekdays: [1],
      },
    });

    expect(result.calendar.recurrenceRuleSegments).toMatchObject([
      {
        id: "segment-1",
        effectiveFrom: "2026-11-23",
        effectiveThrough: "2026-11-29",
      },
      { id: "segment-2", effectiveFrom: "2026-11-30" },
    ]);
    expect(result.calendar.scheduledOccurrences).toMatchObject([
      { date: "2026-11-23", segmentId: "segment-1", isCompleted: false },
      {
        date: "2026-11-30",
        segmentId: "segment-2",
        isCompleted: true,
        completedAt: 500,
      },
    ]);
    expect(result.calendar.scheduledOccurrences).toHaveLength(2);
  });

  it("splits this and future edits at the selected date", () => {
    const snapshot = createSnapshot();
    snapshot.calendar.recurrenceSeries = [
      {
        id: "series-1",
        taskId: task.id,
        startDate: "2026-11-23",
        isActive: true,
      },
    ];
    snapshot.calendar.recurrenceRuleSegments = [
      {
        id: "segment-1",
        seriesId: "series-1",
        effectiveFrom: "2026-11-23",
        frequency: "daily",
        interval: 1,
      },
    ];
    snapshot.calendar.scheduledOccurrences = [
      ...["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26"].map(
        (date, index) => ({
          id: `occurrence-${index}`,
          taskId: task.id,
          seriesId: "series-1",
          segmentId: "segment-1",
          date,
          title: task.title,
          description: task.description,
          category: task.category,
          isCompleted: date === "2026-11-25",
          ...(date === "2026-11-25" && { completedAt: 600 }),
          isSkipped: false,
        }),
      ),
    ];

    const result = applyCalendarCoordinatorCommand(snapshot, {
      type: "edit-recurrence",
      seriesId: "series-1",
      date: "2026-11-25",
      scope: "future",
      rule: {
        frequency: "daily",
        interval: 2,
      },
    });

    expect(result.calendar.recurrenceRuleSegments).toHaveLength(2);
    expect(result.calendar.recurrenceRuleSegments).toMatchObject([
      {
        id: "segment-1",
        effectiveFrom: "2026-11-23",
        effectiveThrough: "2026-11-24",
      },
      { effectiveFrom: "2026-11-25", frequency: "daily", interval: 2 },
    ]);
    expect(
      result.calendar.scheduledOccurrences.map(({ date }) => date),
    ).toEqual(["2026-11-23", "2026-11-24", "2026-11-25"]);
    expect(result.calendar.scheduledOccurrences[2]).toMatchObject({
      isCompleted: true,
      completedAt: 600,
    });
  });

  it("keeps a removed occurrence skipped when its date is materialized again", () => {
    const snapshot = createSnapshot();
    snapshot.calendar.recurrenceSeries = [
      {
        id: "series-1",
        taskId: task.id,
        startDate: "2026-11-25",
        isActive: true,
      },
    ];
    snapshot.calendar.recurrenceRuleSegments = [
      {
        id: "segment-1",
        seriesId: "series-1",
        effectiveFrom: "2026-11-25",
        frequency: "daily",
        interval: 1,
      },
    ];

    const materialized = applyCalendarCoordinatorCommand(snapshot, {
      type: "materialize-range",
      startDate: "2026-11-25",
      endDate: "2026-11-25",
    });
    const skipped = applyCalendarCoordinatorCommand(materialized, {
      type: "delete-scheduled-occurrence",
      occurrenceId: materialized.calendar.scheduledOccurrences[0].id,
      scope: "occurrence",
    });
    const materializedAgain = applyCalendarCoordinatorCommand(skipped, {
      type: "materialize-range",
      startDate: "2026-11-25",
      endDate: "2026-11-25",
    });

    expect(materializedAgain.calendar.scheduledOccurrences).toHaveLength(1);
    expect(materializedAgain.calendar.scheduledOccurrences[0]).toMatchObject({
      isSkipped: true,
      isCompleted: false,
    });
  });

  it("ends a recurring series before a deleted future occurrence", () => {
    const snapshot = createSnapshot();
    snapshot.calendar.recurrenceSeries = [
      {
        id: "series-1",
        taskId: task.id,
        startDate: "2026-11-23",
        isActive: true,
      },
    ];
    snapshot.calendar.recurrenceRuleSegments = [
      {
        id: "segment-1",
        seriesId: "series-1",
        effectiveFrom: "2026-11-23",
        frequency: "daily",
        interval: 1,
      },
    ];
    const materialized = applyCalendarCoordinatorCommand(snapshot, {
      type: "materialize-range",
      startDate: "2026-11-23",
      endDate: "2026-11-25",
    });
    const selected = materialized.calendar.scheduledOccurrences.find(
      (occurrence) => occurrence.date === "2026-11-24",
    )!;

    const result = applyCalendarCoordinatorCommand(materialized, {
      type: "delete-scheduled-occurrence",
      occurrenceId: selected.id,
      scope: "future",
    });

    expect(result.calendar.recurrenceSeries[0].isActive).toBe(true);
    expect(result.calendar.recurrenceRuleSegments[0].effectiveThrough).toBe(
      "2026-11-23",
    );
    expect(
      result.calendar.scheduledOccurrences.map(({ date }) => date),
    ).toEqual(["2026-11-23"]);
  });

  it("deactivates a series when deletion starts at its first occurrence", () => {
    const snapshot = createSnapshot();
    snapshot.calendar.recurrenceSeries = [
      {
        id: "series-1",
        taskId: task.id,
        startDate: "2026-11-25",
        isActive: true,
      },
    ];
    snapshot.calendar.recurrenceRuleSegments = [
      {
        id: "segment-1",
        seriesId: "series-1",
        effectiveFrom: "2026-11-25",
        frequency: "daily",
        interval: 1,
      },
    ];
    const materialized = applyCalendarCoordinatorCommand(snapshot, {
      type: "materialize-range",
      startDate: "2026-11-25",
      endDate: "2026-11-25",
    });

    const result = applyCalendarCoordinatorCommand(materialized, {
      type: "delete-scheduled-occurrence",
      occurrenceId: materialized.calendar.scheduledOccurrences[0].id,
      scope: "future",
    });

    expect(result.calendar.recurrenceSeries[0].isActive).toBe(false);
    expect(result.calendar.recurrenceRuleSegments).toHaveLength(0);
    expect(result.calendar.scheduledOccurrences).toHaveLength(0);
  });

  it("keeps occurrence snapshots and stops generation when a task is archived", () => {
    const snapshot = createSnapshot();
    snapshot.calendar.recurrenceSeries = [
      {
        id: "series-1",
        taskId: task.id,
        startDate: "2026-11-25",
        isActive: true,
      },
    ];
    snapshot.calendar.recurrenceRuleSegments = [
      {
        id: "segment-1",
        seriesId: "series-1",
        effectiveFrom: "2026-11-25",
        frequency: "daily",
        interval: 1,
      },
    ];
    const materialized = applyCalendarCoordinatorCommand(snapshot, {
      type: "materialize-range",
      startDate: "2026-11-25",
      endDate: "2026-11-25",
    });

    const archived = applyCalendarCoordinatorCommand(
      materialized,
      {
        type: "update-task",
        taskId: task.id,
        updates: { title: "Renamed task", archivedAt: 700 },
      },
      700,
    );
    const nextDate = applyCalendarCoordinatorCommand(archived, {
      type: "materialize-range",
      startDate: "2026-11-26",
      endDate: "2026-11-26",
    });

    expect(nextDate.tasks[0].title).toBe("Renamed task");
    expect(nextDate.calendar.recurrenceSeries[0].isActive).toBe(false);
    expect(nextDate.calendar.scheduledOccurrences).toHaveLength(1);
    expect(nextDate.calendar.scheduledOccurrences[0].title).toBe(task.title);
  });

  it("applies task reordering without replacing newer task details", () => {
    const snapshot = createSnapshot();
    snapshot.tasks.push({ ...task, id: "task-2", title: "Latest title" });

    const result = applyCalendarCoordinatorCommand(snapshot, {
      type: "reorder-tasks",
      tasks: [
        {
          ...task,
          id: "task-2",
          title: "Stale title",
          category: "uncategorised",
        },
        task,
      ],
    });

    expect(result.tasks.map(({ id }) => id)).toEqual(["task-2", "task-1"]);
    expect(result.tasks[0].title).toBe("Latest title");
  });

  it("persists a coordinator command and updates both stores", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });

    const result = await dispatchCalendarCommand({
      type: "schedule-task",
      taskId: task.id,
      date: "2026-11-25",
    });

    expect(result.success).toBe(true);
    expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(1);
    expect(
      JSON.parse(localStorage.getItem("tasks-storage")!).state.tasks,
    ).toHaveLength(1);
    expect(
      JSON.parse(localStorage.getItem("calendar-storage")!).state
        .scheduledOccurrences,
    ).toHaveLength(1);
  });

  it("holds the Web Lock while persisting and broadcasting owner commands", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });

    stopCoordinator = startCalendarCoordinator();

    await waitFor(() =>
      expect(channels[0].messages).toContainEqual(
        expect.objectContaining({ type: "state" }),
      ),
    );
    expect(channels[0].messages).toContainEqual({ type: "request-state" });

    const result = await dispatchCalendarCommand({
      type: "schedule-task",
      taskId: task.id,
      date: "2026-11-25",
      startTime: "09:00",
      durationMinutes: 45,
    });

    expect(result.success).toBe(true);
    expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(1);
    expect(channels[0].messages).toContainEqual(
      expect.objectContaining({ type: "state" }),
    );
  });

  it("sends follower commands to the owner and applies its broadcast state", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [] });
    useCalendarStore.setState({ ...initialCalendarData });
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request: () => new Promise<void>(() => undefined) },
    });

    stopCoordinator = startCalendarCoordinator();
    const resultPromise = dispatchCalendarCommand({
      type: "add-task",
      title: "A task from another tab",
    });
    const snapshot = createSnapshot();
    channels[0].onmessage?.({
      data: { type: "state", snapshot },
    } as MessageEvent);

    const commandMessage = channels[0].messages.find(
      (message) => (message as { type?: string }).type === "command",
    ) as { id: string; type: string };
    expect(commandMessage.type).toBe("command");
    expect(useTasksStore.getState().tasks).toHaveLength(1);

    channels[0].onmessage?.({
      data: {
        type: "result",
        id: commandMessage.id,
        result: { success: true },
      },
    } as MessageEvent);

    await expect(resultPromise).resolves.toMatchObject({ success: true });
  });

  it("keeps single tab scheduling available when coordination APIs are missing", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });

    stopCoordinator = startCalendarCoordinator();
    const result = await dispatchCalendarCommand({
      type: "schedule-task",
      taskId: task.id,
      date: "2026-11-25",
    });

    expect(result.success).toBe(true);
    expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(1);
  });

  it("keeps stores unchanged when the calendar write fails", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });
    const previousTasks = localStorage.getItem("tasks-storage");
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === "calendar-storage") throw new Error("storage is full");
      originalSetItem.call(this, key, value);
    });

    const result = await dispatchCalendarCommand({
      type: "schedule-task",
      taskId: task.id,
      date: "2026-11-25",
    });

    expect(result.success).toBe(false);
    expect(useCalendarStore.getState().scheduledOccurrences).toHaveLength(0);
    expect(localStorage.getItem("tasks-storage")).toBe(previousTasks);
    expect(
      JSON.parse(localStorage.getItem("calendar-storage")!).state,
    ).toHaveProperty("scheduledOccurrences", []);
  });
});
