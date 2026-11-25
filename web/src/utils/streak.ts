import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";

const getLocalDayStart = (timestamp: number) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const calculateFocusSessionStreak = (sessions: CompletedSession[]) => {
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
