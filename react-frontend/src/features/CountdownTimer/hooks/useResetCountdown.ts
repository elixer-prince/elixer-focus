import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import {
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useSetTimerPaused,
  useSetTimerRunning,
  useStartTimeInMinutes,
  useTimerRunning,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";
import {
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/features/CountdownTimer/stores/SessionStore";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { playSound } from "@/utils/sound";
import { saveToLocalStorage } from "@/utils/storage";

const useResetCountdown = (): {
  resetCountdown: () => void;
  resetCountdownWithSound: () => void;
} => {
  const { resetTimerSoundEffectRef, timerIntervalRef, timerEndTimeRef } =
    useCountdownTimerContext();

  const timerRunning = useTimerRunning();
  const startTimeInMinutes = useStartTimeInMinutes();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();

  const resetCountdown = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerEndTimeRef.current = null;

    // GET THE CORRECT DURATION FOR CURRENT SESSION
    let currentDuration = startTimeInMinutes; // fallback to existing

    switch (currentSessionType) {
      case "Focus":
        currentDuration = focusDuration;
        break;
      case "Short Break":
        currentDuration = shortBreakDuration;
        break;
      case "Long Break":
        currentDuration = longBreakDuration;
        break;
    }

    // ALSO UPDATE startTimeInMinutes to stay in sync
    setStartTimeInMinutes(currentDuration);
    saveToLocalStorage("startTimeInMinutes", currentDuration);

    const initialTime = convertMinutesToSeconds(currentDuration); // Use currentDuration

    setTimerPaused(true);
    setTimerRunning(false);
    setRemainingTimeInSeconds(initialTime);

    // Clear localStorage for refs
    saveToLocalStorage("timerEndTime", null);
    saveToLocalStorage("timeRemainingOnPause", null);

    document.title = "Elixer Focus";
  };

  const resetCountdownWithSound = () => {
    if (!timerRunning) return alert("The timer is not running.");

    if (confirm("Are you sure you want to reset the countdown?")) {
      resetCountdown();
      playSound(resetTimerSoundEffectRef.current);
    }
  };

  return { resetCountdown, resetCountdownWithSound };
};

export default useResetCountdown;
