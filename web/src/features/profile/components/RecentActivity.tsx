import { useSessions, useTasks } from "@/stores";
import { useMemo } from "react";
import { getRecentProfileActivity } from "@/features/profile/utils/profile-data";
import { MdCheckCircle, MdHistory, MdTimer } from "react-icons/md";

const RecentActivity = () => {
  const sessions = useSessions();
  const tasks = useTasks();
  const activity = useMemo(
    () => getRecentProfileActivity(sessions, tasks),
    [sessions, tasks],
  );

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="bg-base-100 rounded-box border-base-300 space-y-5 border p-6 shadow-sm transition-colors duration-500"
    >
      <header>
        <h2
          id="recent-activity-heading"
          className="text-base-content text-xl font-semibold"
        >
          Recent activity
        </h2>
        <p className="text-base-content/60 mt-1 text-sm">
          Your five latest completed sessions and tasks.
        </p>
      </header>

      {activity.length === 0 ? (
        <div className="border-base-300 rounded-box border border-dashed p-6 text-center">
          <MdHistory
            aria-hidden="true"
            className="text-base-content/40 mx-auto mb-2 size-7"
          />
          <h3 className="text-base-content font-medium">No activity yet</h3>
          <p className="text-base-content/60 mt-1 text-sm">
            Complete a focus session or task and it will appear here.
          </p>
        </div>
      ) : (
        <ol aria-label="Recent activity" className="divide-base-300 divide-y">
          {activity.map((item) => {
            const Icon = item.kind === "session" ? MdTimer : MdCheckCircle;
            const completedAt = new Date(item.completedAt);

            return (
              <li
                key={item.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className="bg-primary/10 text-primary mt-1 grid size-10 shrink-0 place-items-center rounded-full">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-base-content font-medium break-words">
                      {item.title}
                    </h3>
                    <time
                      className="text-base-content/50 text-sm"
                      dateTime={completedAt.toISOString()}
                    >
                      {completedAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                  <p className="text-base-content/60 mt-1 text-sm">
                    {item.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default RecentActivity;
