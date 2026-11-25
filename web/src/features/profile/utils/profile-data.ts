import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type { Task } from "@/features/tasks/types/task";

export type ProfileStats = {
  totalFocusHours: number;
  completedTasks: number;
  currentStreak: number;
};

export type ProfileActivity = {
  id: string;
  kind: "session" | "task";
  title: string;
  detail: string;
  completedAt: number;
};

export type ProfileBadge = {
  id: "first-session" | "first-task";
  title: string;
  description: string;
  unlocked: boolean;
};

const getLocalDayStart = (timestamp: number) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const calculateCurrentStreak = (sessions: CompletedSession[]) => {
  const focusDays = new Set<number>();

  for (const session of sessions) {
    if (session.sessionType === "Focus") {
      focusDays.add(getLocalDayStart(session.completedAt));
    }
  }

  if (focusDays.size === 0) return 0;

  let mostRecentDay = -Infinity;
  for (const day of focusDays) {
    mostRecentDay = Math.max(mostRecentDay, day);
  }

  const currentDay = new Date(mostRecentDay);
  let streak = 0;

  while (focusDays.has(currentDay.getTime())) {
    streak++;
    currentDay.setDate(currentDay.getDate() - 1);
    currentDay.setHours(0, 0, 0, 0);
  }

  return streak;
};

export const calculateProfileStats = (
  sessions: CompletedSession[],
  tasks: Task[],
): ProfileStats => {
  const totalFocusSeconds = sessions
    .filter((session) => session.sessionType === "Focus")
    .reduce((total, session) => total + session.durationInSeconds, 0);

  return {
    totalFocusHours: totalFocusSeconds / 3600,
    completedTasks: tasks.filter((task) => task.isCompleted).length,
    currentStreak: calculateCurrentStreak(sessions),
  };
};

const formatSessionDuration = (durationInSeconds: number) => {
  const minutes = Math.round(durationInSeconds / 60);
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
};

export const getRecentProfileActivity = (
  sessions: CompletedSession[],
  tasks: Task[],
  limit = 5,
): ProfileActivity[] => {
  const sessionActivity = sessions.map((session) => ({
    id: `session-${session.id}`,
    kind: "session" as const,
    title: `${session.sessionType} session`,
    detail: formatSessionDuration(session.durationInSeconds),
    completedAt: session.completedAt,
  }));

  const taskActivity = tasks
    .filter(
      (task): task is Task & { completedAt: number } =>
        task.isCompleted && typeof task.completedAt === "number",
    )
    .map((task) => ({
      id: `task-${task.id}`,
      kind: "task" as const,
      title: task.title,
      detail: "Task completed",
      completedAt: task.completedAt,
    }));

  return [...sessionActivity, ...taskActivity]
    .sort((first, second) => second.completedAt - first.completedAt)
    .slice(0, limit);
};

export const getProfileBadges = (
  sessions: CompletedSession[],
  tasks: Task[],
): ProfileBadge[] => [
  {
    id: "first-session",
    title: "First Session",
    description: "Complete your first session.",
    unlocked: sessions.length > 0,
  },
  {
    id: "first-task",
    title: "First Task",
    description: "Complete your first task.",
    unlocked: tasks.some((task) => task.isCompleted),
  },
];
