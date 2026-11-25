import PauseButton from "@/features/countdown-timer/components/ButtonControls/PauseButton";
import ResetButton from "@/features/countdown-timer/components/ButtonControls/ResetButton";
import SkipButton from "@/features/countdown-timer/components/ButtonControls/SkipButton";
import StartButton from "@/features/countdown-timer/components/ButtonControls/StartButton";
import {
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";

const ButtonControls = () => {
  const timerPaused = useTimerPaused();
  const timerRunning = useTimerRunning();
  const lastCompletedSession = useLastCompletedSession();

  return (
    <fieldset
      disabled={lastCompletedSession !== null}
      className="mb-8 flex justify-center gap-4"
    >
      <legend className="sr-only">Timer controls</legend>
      {timerPaused && <StartButton />}
      {!timerPaused && <PauseButton />}
      {timerRunning && <ResetButton />}
      <SkipButton />
    </fieldset>
  );
};

export default ButtonControls;
