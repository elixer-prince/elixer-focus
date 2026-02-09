import useSessionSwitch from "@/hooks/countdown-timer/useSessionSwitch";
import { useCountdownTimerContext } from "@/stores/CountdownTimerContext";
import { playSound } from "@/utils/sound";

const useSkipCountdown = (): {
  skipCountdown: () => void;
} => {
  const { switchSessionType } = useSessionSwitch();

  const { resetTimerSoundEffectRef } = useCountdownTimerContext();

  // * Temp Locked * //
  const skipCountdown = () => {
    // TODO: Implement this as an overlay
    if (confirm("Are you sure you want to skip the countdown?")) {
      playSound(resetTimerSoundEffectRef.current);
      switchSessionType();
    }
  };

  return { skipCountdown };
};

export default useSkipCountdown;
