import { useSessions, useTasks } from "@/stores";
import { useMemo } from "react";
import { calculateProfileStats } from "@/features/profile/utils/profile-data";

const ProfileStats = () => {
  const sessions = useSessions();
  const tasks = useTasks();
  const stats = useMemo(
    () => calculateProfileStats(sessions, tasks),
    [sessions, tasks],
  );

  const items = [
    {
      label: "Total focus hours",
      value: stats.totalFocusHours.toFixed(1),
      detail: "time spent in focus sessions",
    },
    {
      label: "Tasks completed",
      value: stats.completedTasks,
      detail: "tasks finished",
    },
    {
      label: "Current streak",
      value: stats.currentStreak,
      detail:
        stats.currentStreak === 1 ? "consecutive day" : "consecutive days",
    },
  ];

  return (
    <section aria-labelledby="profile-stats-heading">
      <h2 id="profile-stats-heading" className="sr-only">
        Productivity stats
      </h2>
      <dl className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-base-100 rounded-box border-base-300 border p-5 shadow-sm transition-colors duration-500"
          >
            <dt className="text-base-content/60 text-sm font-medium">
              {item.label}
            </dt>
            <dd className="text-base-content mt-2 text-3xl font-bold tabular-nums">
              {item.value}
            </dd>
            <p className="text-base-content/50 mt-1 text-sm">{item.detail}</p>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default ProfileStats;
