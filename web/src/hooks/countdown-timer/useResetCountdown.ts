import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import useCountdownTimerStorage from "@/hooks/countdown-timer/useCountdownStorage";
import usePageTitle from "@/hooks/usePageTitle";
import {
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/stores/countdown-timer/session-store";
import { useTimerRunning } from "@/stores/countdown-timer/store";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";

const useResetCountdown = () => {
  const { resetTimerSoundEffectRef, timerIntervalRef } = useCountdownContext();
  const { resetPageTitle } = usePageTitle();
  const { resetTimerStorage } = useCountdownTimerStorage();

  const timerRunning = useTimerRunning();

  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();

  const calculateInitialTime = (): number => {
    switch (currentSessionType) {
      case "Focus":
        return focusDuration;
      case "Short Break":
        return shortBreakDuration;
      case "Long Break":
        return longBreakDuration;
    }
  };

  const resetCountdown = () => {
    clearIntervalIfItExists(timerIntervalRef);

    const initialTime = calculateInitialTime();

    resetTimerStorage(initialTime);
    resetPageTitle();
  };

  const resetCountdownWithSound = () => {
    if (!timerRunning) return;

    // TODO: Implement this as an overlay
    if (confirm("Are you sure you want to reset the countdown?")) {
      resetCountdown();
      playSound(resetTimerSoundEffectRef.current);
    }
  };

  return { resetCountdown, resetCountdownWithSound };
};

export default useResetCountdown;
