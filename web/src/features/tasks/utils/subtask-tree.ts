import type { Subtask } from "@/features/tasks/types/subtask";
import type { Task } from "@/features/tasks/types/task";

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
