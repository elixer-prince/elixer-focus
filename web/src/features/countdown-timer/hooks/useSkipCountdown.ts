import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { dispatchTimerCommand } from "@/features/countdown-timer/services/timer-coordinator";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";
import { playSound } from "@/utils/sound";

const useSkipCountdown = (): {
  skipCountdown: () => void;
} => {
  const { resetTimerSoundEffectRef } = useCountdownContext();
  const lastCompletedSession = useLastCompletedSession();

  const skipCountdown = () => {
    // TODO: Implement this as an overlay
    if (
      !lastCompletedSession &&
      confirm("Are you sure you want to skip the countdown?")
    ) {
      playSound(resetTimerSoundEffectRef.current);
      dispatchTimerCommand({ type: "skip" });
    }
  };

  return { skipCountdown };
};

export default useSkipCountdown;
