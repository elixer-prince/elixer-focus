import useHandleCountdownState from "@/features/countdown-timer/hooks/useHandleCountdownState";
import { useCustomSessionInputShown } from "@/features/countdown-timer/stores/session-store";

const ClickableArea = () => {
  const { handleCountdownState } = useHandleCountdownState();

  const customSessionInputShown = useCustomSessionInputShown();

  return (
    <button
      onClick={handleCountdownState}
      className={`clickable-area hover:bg-base-200 active:bg-base-100 bg-transition-all peer absolute inset-5 cursor-pointer rounded-full duration-1000 hover:duration-1000 active:duration-100 ${customSessionInputShown ? "pointer-events-none" : ""}`.trim()}
    />
  );
};

export default ClickableArea;
