import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type { Task } from "@/features/tasks/types/task";
import {
  calculateCurrentStreak,
  calculateProfileStats,
  getProfileBadges,
  getRecentProfileActivity,
} from "@/features/profile/utils/profile-data";

const createSession = (
  id: string,
  sessionType: CompletedSession["sessionType"],
  completedAt: number,
  durationInSeconds = 3600,
): CompletedSession => ({ id, sessionType, completedAt, durationInSeconds });

const createTask = (
  id: string,
  isCompleted = false,
  completedAt?: number,
): Task => ({
  id,
  title: `Task ${id}`,
  category: "uncategorised",
  isCompleted,
  isSelected: false,
  createdAt: 0,
  updatedAt: 0,
  completedAt,
});

describe("profile data", () => {
  it("AC-2, AC-8: calculates focus hours and completed tasks from store data", () => {
    const sessions = [
      createSession("focus-1", "Focus", 1, 3600),
      createSession("focus-2", "Focus", 2, 1800),
      createSession("break", "Short Break", 3, 900),
    ];
    const tasks = [
      createTask("done-1", true),
      createTask("open"),
      createTask("done-2", true),
    ];

    expect(calculateProfileStats(sessions, tasks)).toEqual({
      totalFocusHours: 1.5,
      completedTasks: 2,
      currentStreak: 1,
    });
  });

  it("AC-2: counts consecutive local days from the most recent focus day", () => {
    const sessions = [
      createSession("day-1", "Focus", new Date(2026, 0, 1, 9).getTime()),
      createSession("day-3", "Focus", new Date(2026, 0, 3, 9).getTime()),
      createSession("day-4", "Focus", new Date(2026, 0, 4, 9).getTime()),
      createSession("break", "Short Break", new Date(2026, 0, 5, 9).getTime()),
    ];

    expect(calculateCurrentStreak(sessions)).toBe(2);
  });

  it("AC-2: counts sessions on either side of local midnight separately", () => {
    const sessions = [
      createSession(
        "before-midnight",
        "Focus",
        new Date(2026, 0, 1, 23, 59).getTime(),
      ),
      createSession(
        "after-midnight",
        "Focus",
        new Date(2026, 0, 2, 0, 1).getTime(),
      ),
    ];

    expect(calculateCurrentStreak(sessions)).toBe(2);
  });

  it("AC-2: returns a zero streak when there are no focus sessions", () => {
    expect(
      calculateCurrentStreak([
        createSession("break", "Long Break", new Date(2026, 0, 1).getTime()),
      ]),
    ).toBe(0);
    expect(calculateCurrentStreak([])).toBe(0);
  });

  it("AC-4: sorts mixed activity by completion time and keeps five entries", () => {
    const sessions = [
      createSession("session-1", "Focus", 100),
      createSession("session-2", "Focus", 200),
      createSession("session-3", "Focus", 300),
      createSession("session-4", "Focus", 400),
    ];
    const tasks = [
      createTask("task-1", true, 250),
      createTask("task-2", true, 350),
      createTask("task-3", true, 450),
      createTask("open", false, 500),
      createTask("missing-time", true),
    ];

    expect(getRecentProfileActivity(sessions, tasks)).toEqual([
      expect.objectContaining({ id: "task-task-3", completedAt: 450 }),
      expect.objectContaining({ id: "session-session-4", completedAt: 400 }),
      expect.objectContaining({ id: "task-task-2", completedAt: 350 }),
      expect.objectContaining({ id: "session-session-3", completedAt: 300 }),
      expect.objectContaining({ id: "task-task-1", completedAt: 250 }),
    ]);
  });

  it("AC-5: unlocks starter badges when the related activity exists", () => {
    const sessions = [createSession("break", "Short Break", 1)];
    const tasks = [createTask("done", true)];

    expect(
      getProfileBadges([], [createTask("open")]).map((badge) => badge.unlocked),
    ).toEqual([false, false]);
    expect(
      getProfileBadges(sessions, tasks).map((badge) => badge.unlocked),
    ).toEqual([true, true]);
  });
});
