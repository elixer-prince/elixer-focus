import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import { playSound } from "@/utils/sound";

const useSkipCountdown = (): {
  skipCountdown: () => void;
} => {
  const { switchSessionType } = useSessionSwitch();
  const { resetTimerSoundEffectRef } = useCountdownTimerContext();

  const skipCountdown = () => {
    if (confirm("Are you sure you want to skip the countdown?")) {
      playSound(resetTimerSoundEffectRef.current);
      switchSessionType();
    }
  };

  return { skipCountdown };
};

export default useSkipCountdown;
