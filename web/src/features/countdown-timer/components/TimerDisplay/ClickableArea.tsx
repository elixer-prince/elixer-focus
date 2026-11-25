import useHandleCountdownState from "@/features/countdown-timer/hooks/useHandleCountdownState";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";

const ClickableArea = () => {
  const { handleCountdownState } = useHandleCountdownState();
  const lastCompletedSession = useLastCompletedSession();

  return (
    <button
      type="button"
      aria-label="Start or pause timer"
      disabled={lastCompletedSession !== null}
      onClick={handleCountdownState}
      className="clickable-area hover:bg-base-200 active:bg-base-100 bg-transition-all peer absolute inset-5 cursor-pointer rounded-full duration-1000 hover:duration-1000 active:duration-100"
    />
  );
};

export default ClickableArea;
