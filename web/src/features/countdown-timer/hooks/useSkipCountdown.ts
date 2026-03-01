import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";
import { playSound } from "@/utils/sound";

const useSkipCountdown = (): {
  skipCountdown: () => void;
} => {
  const { autoSwitchSessionType } = useSessionSwitch();

  const { resetTimerSoundEffectRef } = useCountdownContext();

  // * Temp Locked * //
  const skipCountdown = () => {
    // TODO: Implement this as an overlay
    if (confirm("Are you sure you want to skip the countdown?")) {
      playSound(resetTimerSoundEffectRef.current);
      autoSwitchSessionType();
    }
  };

  return { skipCountdown };
};

export default useSkipCountdown;
