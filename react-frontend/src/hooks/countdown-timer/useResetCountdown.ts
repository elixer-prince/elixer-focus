import {
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/SessionStore";
import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import usePageTitle from "@/hooks/usePageTitle";
import { useCountdownTimerContext } from "@/stores/countdown-timer/Context.tsx";
import { useTimerRunning } from "@/stores/countdown-timer/store.ts";
import { playSound } from "@/utils/sound";
import useCountdownTimerStorage from "@/hooks/countdown-timer/useCountdownStorage.ts";

const useResetCountdown = () => {
  const { resetTimerSoundEffectRef } = useCountdownTimerContext();
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
