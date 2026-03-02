import useHandleCountdownState from "@/features/countdown-timer/hooks/useHandleCountdownState";
import {
  useCurrentSessionCount,
  useResetCurrentSessionCount,
  useSessionCountLimit,
} from "@/features/countdown-timer/stores/session-store";

const SessionCount = () => {
  const currentSessionCount = useCurrentSessionCount();
  const sessionCountLimit = useSessionCountLimit();
  const resetCurrentSessionCount = useResetCurrentSessionCount();

  const { isEndingSoon } = useHandleCountdownState();

  return (
    <button
      onClick={() => {
        if (currentSessionCount === 0) return;
        if (confirm("Are you sure you want to reset the session count?")) {
          resetCurrentSessionCount();
        }
      }}
      className="session-count bg-base-100 from-primary/10 border-primary/25 border-t-primary peer-hover:border-primary/55 peer-hover:border-t-primary peer-hover:shadow-primary/25 absolute top-12 cursor-pointer rounded-md border bg-linear-to-b px-2 py-1 font-bold transition-all duration-1000 peer-hover:shadow-[0_0_18px_var(--p)]"
    >
      <span className={isEndingSoon ? "text-error animate-pulse" : ""}>
        {currentSessionCount}
      </span>
      <span className={"text-primary"}>/</span>
      <span className={isEndingSoon ? "text-error animate-pulse" : ""}>
        {sessionCountLimit}
      </span>
    </button>
  );
};

export default SessionCount;
