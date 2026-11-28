import { getCurrentTimestamp } from "./utils";
import { immer } from "zustand/middleware/immer";
import { persist, type PersistOptions } from "zustand/middleware";
import { createStore, type Mutate, type StoreApi } from "zustand/vanilla";

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  isCompleted: boolean;
  isSelected: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  defaultDurationMinutes?: number;
  archivedAt?: number;
  dueAt?: number;
};

export type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "defaultDurationMinutes" | "archivedAt">
> & {
  dueAt?: number | null;
};

export type TaskCategory =
  | "urgent-important"
  | "not-urgent-important"
  | "urgent-not-important"
  | "not-urgent-not-important"
  | "uncategorised";

export type Subtask = {
  id: string;
  taskId: string;
  parentSubtaskId: string | null;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
};

export type TaskStore = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (
    title: string,
    description?: string,
    category?: TaskCategory,
    defaultDurationMinutes?: number,
  ) => Task;
  removeTask: (id: string) => void;
  toggleTaskCompletion: (id: string, completed: boolean) => void;
  updateTask: (id: string, updates: TaskUpdate) => void;
  reorderTasks: (tasks: Task[]) => void;
};

export type TaskStoreFactoryOptions<PersistedState = Partial<TaskStore>> = {
  idGenerator: () => string;
  getCurrentTimestamp?: () => number;
  initialTasks?: Task[];
  persistOptions?: PersistOptions<TaskStore, PersistedState>;
};

const createTaskStoreState = (
  options: Pick<
    TaskStoreFactoryOptions,
    "idGenerator" | "getCurrentTimestamp" | "initialTasks"
  >,
) => {
  const timestamp = options.getCurrentTimestamp ?? getCurrentTimestamp;

  return immer<TaskStore>((set) => ({
    tasks: options.initialTasks ?? [],

    setTasks: (tasks) => set({ tasks }),

    addTask: (
      title,
      description,
      category = "uncategorised",
      defaultDurationMinutes = 30,
    ) => {
      const now = timestamp();
      const task: Task = {
        id: options.idGenerator(),
        title,
        description,
        category,
        isCompleted: false,
        isSelected: false,
        createdAt: now,
        updatedAt: now,
        defaultDurationMinutes,
      };

      set((state) => {
        state.tasks.unshift(task);
      });
      return task;
    },

    removeTask: (id) =>
      set((state) => {
        state.tasks = state.tasks.filter((task) => task.id !== id);
      }),

    toggleTaskCompletion: (id, completed) =>
      set((state) => {
        const task = state.tasks.find((item) => item.id === id);
        if (!task) return;

        const now = timestamp();
        if (completed && !task.isCompleted) task.completedAt = now;
        else if (!completed) delete task.completedAt;
        task.isCompleted = completed;
        task.updatedAt = now;
      }),

    updateTask: (id, updates) =>
      set((state) => {
        const task = state.tasks.find((item) => item.id === id);
        if (!task) return;

        const { dueAt, ...taskUpdates } = updates;
        Object.assign(task, taskUpdates);
        if (dueAt === null) delete task.dueAt;
        else if (dueAt !== undefined) task.dueAt = dueAt;
        task.updatedAt = timestamp();
      }),

    reorderTasks: (requestedTasks) =>
      set((state) => {
        const currentTasks = new Map(
          state.tasks.map((task) => [task.id, task]),
        );
        const orderedIds = new Set<string>();
        const orderedTasks = requestedTasks.flatMap((task) => {
          const currentTask = currentTasks.get(task.id);
          if (!currentTask) return [];
          orderedIds.add(task.id);
          return [{ ...currentTask, category: task.category }];
        });

        state.tasks = [
          ...orderedTasks,
          ...state.tasks.filter((task) => !orderedIds.has(task.id)),
        ];
      }),
  }));
};

type PersistedStoreApi<State, PersistedState> = Mutate<
  StoreApi<State>,
  [["zustand/persist", PersistedState]]
>;

export function createTaskStore<PersistedState>(
  options: TaskStoreFactoryOptions<PersistedState> & {
    persistOptions: PersistOptions<TaskStore, PersistedState>;
  },
): PersistedStoreApi<TaskStore, PersistedState>;
export function createTaskStore(
  options: TaskStoreFactoryOptions,
): StoreApi<TaskStore>;
export function createTaskStore<PersistedState>(
  options: TaskStoreFactoryOptions<PersistedState>,
): StoreApi<TaskStore> | PersistedStoreApi<TaskStore, PersistedState> {
  const stateCreator = createTaskStoreState(options);
  if (options.persistOptions) {
    return createStore<TaskStore>()(
      persist(stateCreator, options.persistOptions),
    ) as PersistedStoreApi<TaskStore, PersistedState>;
  }
  return createStore<TaskStore>()(stateCreator);
}

export type SubtaskStore = {
  subtasks: Subtask[];
  setSubtasks: (subtasks: Subtask[]) => void;
  addSubtask: (
    taskId: string,
    parentSubtaskId: string | null,
    title: string,
  ) => Subtask;
  updateSubtask: (subtaskId: string, title: string) => void;
  toggleSubtaskCompletion: (subtaskId: string, completed: boolean) => void;
  removeSubtask: (subtaskId: string) => void;
  reorderSubtask: (
    subtaskId: string,
    targetSubtaskId: string | null,
    before: boolean,
  ) => void;
};

export type SubtaskStoreFactoryOptions<PersistedState = Partial<SubtaskStore>> =
  {
    idGenerator: () => string;
    getTasks: () => Task[];
    getCurrentTimestamp?: () => number;
    initialSubtasks?: Subtask[];
    persistOptions?: PersistOptions<SubtaskStore, PersistedState>;
  };

const createSubtaskStoreState = (
  options: Pick<
    SubtaskStoreFactoryOptions,
    "idGenerator" | "getTasks" | "getCurrentTimestamp" | "initialSubtasks"
  >,
) => {
  const timestamp = options.getCurrentTimestamp ?? getCurrentTimestamp;

  return immer<SubtaskStore>((set, get) => ({
    subtasks: options.initialSubtasks ?? [],

    setSubtasks: (subtasks) => set({ subtasks }),

    addSubtask: (taskId, parentSubtaskId, value) => {
      if (!options.getTasks().some((task) => task.id === taskId)) {
        throw new Error("This task is no longer available.");
      }
      const title = value.trim();
      if (!title) throw new Error("Enter a subtask title.");
      if (
        parentSubtaskId !== null &&
        !get().subtasks.some(
          (subtask) =>
            subtask.id === parentSubtaskId && subtask.taskId === taskId,
        )
      ) {
        throw new Error("This parent subtask is no longer available.");
      }

      const subtasks = get().subtasks;
      const id = options.idGenerator();
      if (subtasks.some((subtask) => subtask.id === id)) {
        throw new Error("Unable to create a unique subtask.");
      }
      const now = timestamp();
      const subtask: Subtask = {
        id,
        taskId,
        parentSubtaskId,
        title,
        isCompleted: false,
        position: getSubtasksForParent(subtasks, taskId, parentSubtaskId)
          .length,
        createdAt: now,
        updatedAt: now,
      };

      set((state) => {
        state.subtasks.push(subtask);
      });
      return subtask;
    },

    updateSubtask: (subtaskId, value) =>
      set((state) => {
        const subtask = state.subtasks.find((item) => item.id === subtaskId);
        if (!subtask) throw new Error("This subtask is no longer available.");
        const title = value.trim();
        if (!title) throw new Error("A subtask title cannot be empty.");
        subtask.title = title;
        subtask.updatedAt = timestamp();
      }),

    toggleSubtaskCompletion: (subtaskId, completed) =>
      set((state) => {
        const subtask = state.subtasks.find((item) => item.id === subtaskId);
        if (!subtask) throw new Error("This subtask is no longer available.");
        subtask.isCompleted = completed;
        subtask.updatedAt = timestamp();
      }),

    removeSubtask: (subtaskId) =>
      set((state) => {
        state.subtasks = removeSubtaskTree(state.subtasks, subtaskId);
      }),

    reorderSubtask: (subtaskId, targetSubtaskId, before) =>
      set((state) => {
        state.subtasks = reorderSubtasks(
          state.subtasks,
          subtaskId,
          targetSubtaskId,
          before,
        );
      }),
  }));
};

export function createSubtaskStore<PersistedState>(
  options: SubtaskStoreFactoryOptions<PersistedState> & {
    persistOptions: PersistOptions<SubtaskStore, PersistedState>;
  },
): PersistedStoreApi<SubtaskStore, PersistedState>;
export function createSubtaskStore(
  options: SubtaskStoreFactoryOptions,
): StoreApi<SubtaskStore>;
export function createSubtaskStore<PersistedState>(
  options: SubtaskStoreFactoryOptions<PersistedState>,
): StoreApi<SubtaskStore> | PersistedStoreApi<SubtaskStore, PersistedState> {
  const stateCreator = createSubtaskStoreState(options);
  if (options.persistOptions) {
    return createStore<SubtaskStore>()(
      persist(stateCreator, options.persistOptions),
    ) as PersistedStoreApi<SubtaskStore, PersistedState>;
  }
  return createStore<SubtaskStore>()(stateCreator);
}

export const TASK_CATEGORY_ORDER: TaskCategory[] = [
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
  "uncategorised",
];

export type CompletedTaskGroup = {
  category: TaskCategory;
  tasks: Task[];
};

export const getActiveTasks = (tasks: Task[]) =>
  tasks.filter((task) => !task.isCompleted);

export const mergeActiveTaskOrder = (
  tasks: Task[],
  reorderedActiveTasks: Task[],
) => {
  let activeIndex = 0;
  return tasks.map((task) =>
    task.isCompleted ? task : (reorderedActiveTasks[activeIndex++] ?? task),
  );
};

export const getCompletedTaskGroups = (tasks: Task[]): CompletedTaskGroup[] =>
  TASK_CATEGORY_ORDER.flatMap((category) => {
    const completedTasks = tasks
      .map((task, position) => ({ task, position }))
      .filter(({ task }) => task.isCompleted && task.category === category)
      .sort(
        (a, b) =>
          (b.task.completedAt ?? b.task.updatedAt) -
            (a.task.completedAt ?? a.task.updatedAt) || a.position - b.position,
      )
      .map(({ task }) => task);

    return completedTasks.length > 0
      ? [{ category, tasks: completedTasks }]
      : [];
  });

export const getHighestPriorityActiveCategory = (tasks: Task[]): TaskCategory =>
  TASK_CATEGORY_ORDER.find((category) =>
    tasks.some((task) => task.category === category && !task.isCompleted),
  ) ?? "uncategorised";

export const normalizeTasks = (tasks: Task[]): Task[] =>
  tasks.map((task) => ({
    ...task,
    updatedAt: task.updatedAt ?? task.createdAt,
    defaultDurationMinutes: task.defaultDurationMinutes ?? 30,
  }));

export type TaskSortMode = "manual" | "due-date";

export const sortTasksByDueAt = (tasks: Task[]) =>
  TASK_CATEGORY_ORDER.flatMap((category) =>
    tasks
      .filter((task) => task.category === category)
      .sort((left, right) => {
        if (left.dueAt === undefined) {
          return right.dueAt === undefined ? 0 : 1;
        }
        if (right.dueAt === undefined) return -1;
        return left.dueAt - right.dueAt;
      }),
  );

export const filterTasksByQuery = (tasks: Task[], query: string): Task[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return tasks;

  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(normalizedQuery) ||
      (task.description ?? "").toLowerCase().includes(normalizedQuery),
  );
};

export const getSubtasksForParent = (
  subtasks: Subtask[],
  taskId: string,
  parentSubtaskId: string | null,
) =>
  subtasks
    .filter(
      (subtask) =>
        subtask.taskId === taskId &&
        subtask.parentSubtaskId === parentSubtaskId,
    )
    .sort((left, right) => left.position - right.position);

export const getSubtaskDescendantIds = (
  subtasks: Subtask[],
  rootSubtaskId: string,
) => {
  const childrenByParent = new Map<string, Subtask[]>();
  for (const subtask of subtasks) {
    if (!subtask.parentSubtaskId) continue;
    const siblings = childrenByParent.get(subtask.parentSubtaskId) ?? [];
    siblings.push(subtask);
    childrenByParent.set(subtask.parentSubtaskId, siblings);
  }

  const descendants = new Set<string>();
  const pending = [rootSubtaskId];
  while (pending.length > 0) {
    const parentId = pending.pop()!;
    for (const child of childrenByParent.get(parentId) ?? []) {
      if (child.id === rootSubtaskId || descendants.has(child.id)) continue;
      descendants.add(child.id);
      pending.push(child.id);
    }
  }

  return descendants;
};

export const assertValidSubtasks = (tasks: Task[], subtasks: Subtask[]) => {
  const taskIds = new Set(tasks.map((task) => task.id));
  const subtasksById = new Map<string, Subtask>();
  const positionsByGroup = new Map<string, Set<number>>();
  const countsByGroup = new Map<string, number>();

  for (const subtask of subtasks) {
    if (typeof subtask.id !== "string" || !subtask.id) {
      throw new Error("Subtask IDs must be nonempty strings.");
    }
    if (subtasksById.has(subtask.id)) {
      throw new Error("Subtask IDs must be unique.");
    }
    if (!taskIds.has(subtask.taskId)) {
      throw new Error("Every subtask must belong to an existing task.");
    }
    if (
      typeof subtask.title !== "string" ||
      !subtask.title.trim() ||
      subtask.title !== subtask.title.trim()
    ) {
      throw new Error("Subtask titles must be trimmed and nonblank.");
    }
    if (typeof subtask.isCompleted !== "boolean") {
      throw new Error("Subtask completion state must be a boolean.");
    }
    if (!Number.isInteger(subtask.position) || subtask.position < 0) {
      throw new Error("Subtask positions must be nonnegative integers.");
    }
    if (
      !Number.isFinite(subtask.createdAt) ||
      !Number.isFinite(subtask.updatedAt)
    ) {
      throw new Error("Subtask timestamps must be valid numbers.");
    }
    subtasksById.set(subtask.id, subtask);

    const group = JSON.stringify([subtask.taskId, subtask.parentSubtaskId]);
    const positions = positionsByGroup.get(group) ?? new Set<number>();
    if (positions.has(subtask.position)) {
      throw new Error("Subtask sibling positions must be unique.");
    }
    positions.add(subtask.position);
    positionsByGroup.set(group, positions);
    countsByGroup.set(group, (countsByGroup.get(group) ?? 0) + 1);
  }

  for (const subtask of subtasks) {
    if (subtask.parentSubtaskId === null) continue;
    const parent = subtasksById.get(subtask.parentSubtaskId);
    if (!parent || parent.taskId !== subtask.taskId) {
      throw new Error("A subtask parent must belong to the same task.");
    }
  }

  for (const [group, positions] of positionsByGroup) {
    const siblingCount = countsByGroup.get(group) ?? 0;
    if (positions.size !== siblingCount) {
      throw new Error("Subtask sibling positions must be dense.");
    }
    for (let position = 0; position < siblingCount; position += 1) {
      if (!positions.has(position)) {
        throw new Error("Subtask sibling positions must be dense.");
      }
    }
  }

  const visitStates = new Map<string, "visiting" | "visited">();
  for (const subtask of subtasks) {
    const path: string[] = [];
    let current: Subtask | undefined = subtask;
    while (current) {
      const state = visitStates.get(current.id);
      if (state === "visiting") {
        throw new Error("Subtask parent links cannot contain cycles.");
      }
      if (state === "visited") break;

      visitStates.set(current.id, "visiting");
      path.push(current.id);
      current = current.parentSubtaskId
        ? subtasksById.get(current.parentSubtaskId)
        : undefined;
    }
    path.forEach((id) => visitStates.set(id, "visited"));
  }
};

export const removeSubtaskTree = (subtasks: Subtask[], subtaskId: string) => {
  const target = subtasks.find((subtask) => subtask.id === subtaskId);
  if (!target) throw new Error("This subtask is no longer available.");

  const removedIds = getSubtaskDescendantIds(subtasks, subtaskId);
  removedIds.add(subtaskId);
  const remaining = subtasks.filter((subtask) => !removedIds.has(subtask.id));
  const nextPositions = new Map(
    getSubtasksForParent(remaining, target.taskId, target.parentSubtaskId).map(
      (subtask, position) => [subtask.id, position],
    ),
  );

  return remaining.map((subtask) => {
    const position = nextPositions.get(subtask.id);
    return position === undefined ? subtask : { ...subtask, position };
  });
};

export const reorderSubtasks = (
  subtasks: Subtask[],
  subtaskId: string,
  targetSubtaskId: string | null,
  before: boolean,
) => {
  const source = subtasks.find((subtask) => subtask.id === subtaskId);
  if (!source) throw new Error("This subtask is no longer available.");

  const target = targetSubtaskId
    ? subtasks.find((subtask) => subtask.id === targetSubtaskId)
    : undefined;
  if (targetSubtaskId && !target) {
    throw new Error("The subtask you moved onto is no longer available.");
  }
  if (
    target &&
    (source.taskId !== target.taskId ||
      source.parentSubtaskId !== target.parentSubtaskId)
  ) {
    throw new Error("Subtasks can only be moved within the same checklist.");
  }
  if (source.id === target?.id) return subtasks;

  const siblings = getSubtasksForParent(
    subtasks,
    source.taskId,
    source.parentSubtaskId,
  );
  const ordered = siblings.filter((subtask) => subtask.id !== source.id);
  const targetIndex = target
    ? ordered.findIndex((subtask) => subtask.id === target.id)
    : ordered.length;
  if (target && targetIndex === -1) {
    throw new Error("The subtask you moved onto is no longer available.");
  }
  ordered.splice(target ? targetIndex + Number(!before) : ordered.length, 0, {
    ...source,
  });

  const nextPositions = new Map(
    ordered.map((subtask, position) => [subtask.id, position]),
  );
  return subtasks.map((subtask) => {
    const position = nextPositions.get(subtask.id);
    return position === undefined ? subtask : { ...subtask, position };
  });
};
