import { useSessions, useTasks } from "@/stores";
import { useMemo } from "react";
import { getProfileBadges } from "@/features/profile/utils/profile-data";
import { MdLock, MdWorkspacePremium } from "react-icons/md";

const ProfileBadges = () => {
  const sessions = useSessions();
  const tasks = useTasks();
  const badges = useMemo(
    () => getProfileBadges(sessions, tasks),
    [sessions, tasks],
  );

  return (
    <section
      aria-labelledby="profile-badges-heading"
      className="bg-base-100 rounded-box border-base-300 space-y-5 border p-6 shadow-sm transition-colors duration-500"
    >
      <header>
        <h2
          id="profile-badges-heading"
          className="text-base-content text-xl font-semibold"
        >
          Achievements
        </h2>
        <p className="text-base-content/60 mt-1 text-sm">
          Small milestones from your focus journey.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {badges.map((badge) => {
          const Icon = badge.unlocked ? MdWorkspacePremium : MdLock;

          return (
            <li key={badge.id}>
              <article
                className={`rounded-box flex h-full items-start gap-3 border p-4 transition-colors duration-500 ${
                  badge.unlocked
                    ? "border-primary/40 bg-primary/5"
                    : "border-base-300 bg-base-200/50"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`size-6 ${badge.unlocked ? "text-primary" : "text-base-content/40"}`}
                />
                <div>
                  <h3 className="text-base-content font-semibold">
                    {badge.title}
                  </h3>
                  <p className="text-base-content/60 mt-1 text-sm">
                    {badge.description}
                  </p>
                  <span
                    className={`badge mt-3 ${badge.unlocked ? "badge-primary" : "badge-neutral badge-outline"}`}
                  >
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProfileBadges;
