import useSessionSwitch from "@/hooks/countdown-timer/useSessionSwitch";
import { useCountdownTimerContext } from "@/stores/countdown-timer/Context.tsx";
import { playSound } from "@/utils/sound";

const useSkipCountdown = (): {
  skipCountdown: () => void;
} => {
  const { autoSwitchSessionType } = useSessionSwitch();

  const { resetTimerSoundEffectRef } = useCountdownTimerContext();

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
