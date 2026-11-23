import { useGetStreak } from "@/features/journal/stores/journal-store";
import { MdLocalFireDepartment } from "react-icons/md";
import { useMemo } from "react";

const StreakCounter = () => {
  const getStreak = useGetStreak();
  const streak = useMemo(() => getStreak(), [getStreak]);

  if (streak === 0) {
    return (
      <div className="streak-counter bg-base-100 rounded-box p-4 shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-2">
          <MdLocalFireDepartment size={20} className="text-base-content/30" />
          <span className="text-base-content/40 text-sm">
            Start your first session to build a streak!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="streak-counter bg-base-100 rounded-box p-4 shadow-sm transition-colors duration-500">
      <div className="flex items-center gap-2">
        <MdLocalFireDepartment size={24} className="text-warning" />
        <div>
          <p className="text-base-content text-2xl font-bold">{streak}</p>
          <p className="text-base-content/50 text-xs">
            {streak === 1 ? "day" : "days"} streak
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
