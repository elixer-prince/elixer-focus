import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import useCountdownTimerStorage from "@/hooks/countdown-timer/useCountdownStorage";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/store";
import {
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/stores/countdown-timer/session-store";
import { playSound } from "@/utils/sound";

const useResetCountdown = () => {
  const { resetTimerSoundEffectRef } = useCountdownContext();
  const { clearIntervalIfItExists } = useCountdownInterval();
  const { resetPageTitle } = usePageTitle();
  const { resetTimerStorage } = useCountdownTimerStorage();

  const timerRunning = useTimerRunning();

  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();

  // * Locked * //
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

  // * Locked * //
  const resetCountdown = () => {
    clearIntervalIfItExists();

    const initialTime = calculateInitialTime();

    resetTimerStorage(initialTime);
    resetPageTitle();
  };

  // * Locked * //
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
