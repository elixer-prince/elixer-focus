import { waitFor } from "@testing-library/react";
import {
  applyCalendarCoordinatorCommand,
  dispatchCalendarCommand,
  startCalendarCoordinator,
  type CalendarCoordinatorCommand,
  type CalendarSnapshot,
} from "@/features/calendar/services/calendar-coordinator";
import { initialCalendarData } from "@/features/calendar/types/calendar";
import type { Task } from "@/features/tasks/types/task";
import { useCalendarStore } from "@/features/calendar/stores/calendar-store";
import { useTasksStore } from "@/features/tasks/stores/tasks-store";
import {
  useSubtaskCoordinatorStore,
  useSubtasksStore,
} from "@/features/tasks/stores/subtasks-store";

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
  subtasks: [],
  calendar: { ...initialCalendarData, scheduledOccurrences: [] },
  supportsSubtasks: true,
});

let stopCoordinator: (() => void) | undefined;

beforeEach(() => {
  channels.length = 0;
  useSubtasksStore.setState({
    subtasks: [],
  });
  useSubtaskCoordinatorStore.setState({ supportsSubtasks: true });
  localStorage.removeItem("subtasks-storage");
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

  it("adds, edits, and completes nested subtasks without changing Tasks", () => {
    const snapshot = createSnapshot();
    const root = applyCalendarCoordinatorCommand(
      snapshot,
      {
        type: "add-subtask",
        taskId: task.id,
        parentSubtaskId: null,
        title: "  Review the draft  ",
      },
      200,
    );
    const child = applyCalendarCoordinatorCommand(
      root,
      {
        type: "add-subtask",
        taskId: task.id,
        parentSubtaskId: "generated-1",
        title: "Check the citations",
      },
      300,
    );
    const renamed = applyCalendarCoordinatorCommand(
      child,
      {
        type: "update-subtask",
        subtaskId: "generated-1",
        title: "  Review the final draft  ",
      },
      400,
    );
    const completed = applyCalendarCoordinatorCommand(
      renamed,
      {
        type: "toggle-subtask-completion",
        subtaskId: "generated-2",
        completed: true,
      },
      500,
    );

    expect(completed.tasks).toEqual(snapshot.tasks);
    expect(completed.subtasks).toEqual([
      {
        id: "generated-1",
        taskId: task.id,
        parentSubtaskId: null,
        title: "Review the final draft",
        isCompleted: false,
        position: 0,
        createdAt: 200,
        updatedAt: 400,
      },
      {
        id: "generated-2",
        taskId: task.id,
        parentSubtaskId: "generated-1",
        title: "Check the citations",
        isCompleted: true,
        position: 0,
        createdAt: 300,
        updatedAt: 500,
      },
    ]);
  });

  it("removes a whole subtree and closes the former sibling positions", () => {
    const snapshot = createSnapshot();
    snapshot.subtasks = [
      {
        id: "first",
        taskId: task.id,
        parentSubtaskId: null,
        title: "First",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "remove-me",
        taskId: task.id,
        parentSubtaskId: null,
        title: "Remove me",
        isCompleted: false,
        position: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "child",
        taskId: task.id,
        parentSubtaskId: "remove-me",
        title: "Child",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "last",
        taskId: task.id,
        parentSubtaskId: null,
        title: "Last",
        isCompleted: false,
        position: 2,
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const result = applyCalendarCoordinatorCommand(snapshot, {
      type: "remove-subtask",
      subtaskId: "remove-me",
    });

    expect(result.subtasks.map(({ id, position }) => [id, position])).toEqual([
      ["first", 0],
      ["last", 1],
    ]);
  });

  it("removes every subtask when its Task is deleted", () => {
    const snapshot = createSnapshot();
    snapshot.subtasks = [
      {
        id: "root",
        taskId: task.id,
        parentSubtaskId: null,
        title: "Root",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "child",
        taskId: task.id,
        parentSubtaskId: "root",
        title: "Child",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const result = applyCalendarCoordinatorCommand(snapshot, {
      type: "remove-task",
      taskId: task.id,
    });

    expect(result.tasks).toEqual([]);
    expect(result.subtasks).toEqual([]);
  });

  it("reorders only current siblings and rejects stale or cross-parent targets", () => {
    const snapshot = createSnapshot();
    snapshot.subtasks = [
      ...["first", "second", "third"].map((id, position) => ({
        id,
        taskId: task.id,
        parentSubtaskId: null,
        title: id,
        isCompleted: false,
        position,
        createdAt: 1,
        updatedAt: 1,
      })),
      {
        id: "nested",
        taskId: task.id,
        parentSubtaskId: "first",
        title: "Nested",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const moved = applyCalendarCoordinatorCommand(snapshot, {
      type: "reorder-subtasks",
      subtaskId: "first",
      targetSubtaskId: "third",
      before: false,
    });

    expect(
      moved.subtasks
        .filter((subtask) => subtask.parentSubtaskId === null)
        .sort((left, right) => left.position - right.position)
        .map(({ id, position }) => [id, position]),
    ).toEqual([
      ["second", 0],
      ["third", 1],
      ["first", 2],
    ]);
    expect(() =>
      applyCalendarCoordinatorCommand(moved, {
        type: "reorder-subtasks",
        subtaskId: "first",
        targetSubtaskId: "missing",
        before: true,
      }),
    ).toThrow("no longer available");
    expect(() =>
      applyCalendarCoordinatorCommand(moved, {
        type: "reorder-subtasks",
        subtaskId: "first",
        targetSubtaskId: "nested",
        before: true,
      }),
    ).toThrow("same checklist");
  });

  it("rejects missing parent links and cycles in the stored tree", () => {
    const snapshot = createSnapshot();
    expect(() =>
      applyCalendarCoordinatorCommand(snapshot, {
        type: "add-subtask",
        taskId: task.id,
        parentSubtaskId: "missing-parent",
        title: "Child",
      }),
    ).toThrow("parent subtask is no longer available");

    snapshot.subtasks = [
      {
        id: "first",
        taskId: task.id,
        parentSubtaskId: "second",
        title: "First",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "second",
        taskId: task.id,
        parentSubtaskId: "first",
        title: "Second",
        isCompleted: false,
        position: 0,
        createdAt: 1,
        updatedAt: 1,
      },
    ];
    expect(() =>
      applyCalendarCoordinatorCommand(snapshot, {
        type: "add-task",
        title: "Another task",
      }),
    ).toThrow("cannot contain cycles");
  });

  it("removes deep trees without recursive traversal", () => {
    const snapshot = createSnapshot();
    snapshot.subtasks = Array.from({ length: 2500 }, (_, index) => ({
      id: `deep-${index}`,
      taskId: task.id,
      parentSubtaskId: index === 0 ? null : `deep-${index - 1}`,
      title: `Subtask ${index}`,
      isCompleted: false,
      position: 0,
      createdAt: 1,
      updatedAt: 1,
    }));

    const result = applyCalendarCoordinatorCommand(snapshot, {
      type: "remove-subtask",
      subtaskId: "deep-0",
    });

    expect(result.subtasks).toHaveLength(0);
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
    expect(JSON.parse(localStorage.getItem("subtasks-storage")!)).toEqual({
      state: { subtasks: [] },
      version: 1,
    });
  });

  it("initializes the versioned Subtask key in single-tab mode", () => {
    localStorage.clear();
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });

    stopCoordinator = startCalendarCoordinator();

    expect(JSON.parse(localStorage.getItem("subtasks-storage")!)).toEqual({
      state: { subtasks: [] },
      version: 1,
    });
  });

  it("initializes the Subtask key when Web Locks reject after startup", async () => {
    localStorage.clear();
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: () => Promise.reject(new Error("Web Locks unavailable")),
      },
    });

    stopCoordinator = startCalendarCoordinator();

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("subtasks-storage")!)).toEqual({
        state: { subtasks: [] },
        version: 1,
      }),
    );
    expect(useSubtaskCoordinatorStore.getState().supportsSubtasks).toBe(true);
  });

  it("keeps Subtask commands available in single-tab mode", async () => {
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
      type: "add-subtask",
      taskId: task.id,
      parentSubtaskId: null,
      title: "A one tab Subtask",
    });

    expect(result.success).toBe(true);
    expect(useSubtasksStore.getState().subtasks).toHaveLength(1);
    expect(useSubtaskCoordinatorStore.getState().supportsSubtasks).toBe(true);
  });

  it("stores subtasks separately without changing Task records", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });

    const result = await dispatchCalendarCommand({
      type: "add-subtask",
      taskId: task.id,
      parentSubtaskId: null,
      title: "  Check the draft  ",
    });

    const storedTasks = JSON.parse(localStorage.getItem("tasks-storage")!);
    const storedSubtasks = JSON.parse(
      localStorage.getItem("subtasks-storage")!,
    );
    expect(result.success).toBe(true);
    expect(storedTasks.version).toBe(4);
    expect(storedTasks.state.tasks).toEqual([task]);
    expect(storedSubtasks.version).toBe(1);
    expect(storedSubtasks.state.subtasks).toMatchObject([
      {
        id: "generated-2",
        taskId: task.id,
        parentSubtaskId: null,
        title: "Check the draft",
        isCompleted: false,
        position: 0,
      },
    ]);
    expect(useTasksStore.getState().tasks).toEqual([task]);
  });

  it("serializes concurrent sibling moves against the latest Subtask tree", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });
    useSubtasksStore.setState({
      subtasks: ["a", "b", "c", "d"].map((id, position) => ({
        id,
        taskId: task.id,
        parentSubtaskId: null,
        title: id,
        isCompleted: false,
        position,
        createdAt: 1,
        updatedAt: 1,
      })),
    });
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });

    stopCoordinator = startCalendarCoordinator();
    await waitFor(() =>
      expect(useSubtaskCoordinatorStore.getState().supportsSubtasks).toBe(true),
    );

    const results = await Promise.all([
      dispatchCalendarCommand({
        type: "reorder-subtasks",
        subtaskId: "a",
        targetSubtaskId: "c",
        before: false,
      }),
      dispatchCalendarCommand({
        type: "reorder-subtasks",
        subtaskId: "d",
        targetSubtaskId: "b",
        before: true,
      }),
    ]);

    expect(results.every((result) => result.success)).toBe(true);
    expect(
      useSubtasksStore
        .getState()
        .subtasks.slice()
        .sort((left, right) => left.position - right.position)
        .map((subtask) => subtask.id),
    ).toEqual(["d", "b", "c", "a"]);
  });

  it("does not report subtask commands successful to a legacy coordinator", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });
    const storedSubtask = {
      id: "preserved",
      taskId: task.id,
      parentSubtaskId: null,
      title: "Keep me",
      isCompleted: false,
      position: 0,
      createdAt: 1,
      updatedAt: 1,
    };
    useSubtasksStore.setState({ subtasks: [storedSubtask] });
    const previousSubtasks = localStorage.getItem("subtasks-storage");
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request: () => new Promise<void>(() => undefined) },
    });

    stopCoordinator = startCalendarCoordinator();
    const resultPromise = dispatchCalendarCommand({
      type: "add-subtask",
      taskId: task.id,
      parentSubtaskId: null,
      title: "A subtask",
    });
    channels[0].onmessage?.({
      data: {
        type: "state",
        snapshot: {
          tasks: [{ ...task }],
          calendar: { ...initialCalendarData },
        } as CalendarSnapshot,
      },
    } as MessageEvent);

    await expect(resultPromise).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining("Refresh that tab"),
    });
    expect(useSubtaskCoordinatorStore.getState().supportsSubtasks).toBe(false);
    expect(useSubtasksStore.getState().subtasks).toEqual([storedSubtask]);
    expect(localStorage.getItem("subtasks-storage")).toBe(previousSubtasks);
    expect(
      channels[0].messages.some(
        (message) => (message as { type?: string }).type === "command",
      ),
    ).toBe(false);
  });

  it("reconciles subtasks whose Task was deleted by a legacy tab", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [] });
    useCalendarStore.setState({ ...initialCalendarData });
    localStorage.setItem(
      "subtasks-storage",
      JSON.stringify({
        state: {
          subtasks: [
            {
              id: "orphan",
              taskId: task.id,
              parentSubtaskId: null,
              title: "Orphaned",
              isCompleted: false,
              position: 0,
              createdAt: 1,
              updatedAt: 1,
            },
          ],
        },
        version: 1,
      }),
    );
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
    expect(useSubtasksStore.getState().subtasks).toEqual([]);
    expect(
      JSON.parse(localStorage.getItem("subtasks-storage")!).state.subtasks,
    ).toEqual([]);
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

  it("keeps prior state when the Subtask storage write fails", async () => {
    localStorage.clear();
    useTasksStore.setState({ tasks: [{ ...task }] });
    useCalendarStore.setState({ ...initialCalendarData });
    const previousTasks = localStorage.getItem("tasks-storage");
    const previousCalendar = localStorage.getItem("calendar-storage");
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === "subtasks-storage") throw new Error("storage is full");
      originalSetItem.call(this, key, value);
    });

    const result = await dispatchCalendarCommand({
      type: "add-subtask",
      taskId: task.id,
      parentSubtaskId: null,
      title: "Retry me",
    });

    expect(result.success).toBe(false);
    expect(useSubtasksStore.getState().subtasks).toEqual([]);
    expect(localStorage.getItem("tasks-storage")).toBe(previousTasks);
    expect(localStorage.getItem("calendar-storage")).toBe(previousCalendar);
    expect(localStorage.getItem("subtasks-storage")).toBeNull();
  });

  it.each([
    [
      "edit",
      {
        type: "update-subtask",
        subtaskId: "first",
        title: "Renamed",
      },
    ],
    ["delete", { type: "remove-subtask", subtaskId: "first" }],
    [
      "reorder",
      {
        type: "reorder-subtasks",
        subtaskId: "first",
        targetSubtaskId: "second",
        before: false,
      },
    ],
  ] satisfies [string, CalendarCoordinatorCommand][])(
    "does not apply a failed Subtask %s",
    async (_operation, command) => {
      localStorage.clear();
      useTasksStore.setState({ tasks: [{ ...task }] });
      useCalendarStore.setState({ ...initialCalendarData });
      const previousSubtasks = [
        {
          id: "first",
          taskId: task.id,
          parentSubtaskId: null,
          title: "First",
          isCompleted: false,
          position: 0,
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: "second",
          taskId: task.id,
          parentSubtaskId: null,
          title: "Second",
          isCompleted: false,
          position: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      ];
      useSubtasksStore.setState({ subtasks: previousSubtasks });
      const previousStorage = localStorage.getItem("subtasks-storage");
      const originalSetItem = Storage.prototype.setItem;
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
        this: Storage,
        key: string,
        value: string,
      ) {
        if (key === "subtasks-storage") throw new Error("storage is full");
        originalSetItem.call(this, key, value);
      });

      const result = await dispatchCalendarCommand(command);

      expect(result.success).toBe(false);
      expect(useSubtasksStore.getState().subtasks).toEqual(previousSubtasks);
      expect(localStorage.getItem("subtasks-storage")).toBe(previousStorage);
    },
  );
});
