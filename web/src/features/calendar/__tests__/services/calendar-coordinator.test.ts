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
