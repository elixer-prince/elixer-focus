import PauseButton from "@/features/countdown-timer/components/ButtonControls/PauseButton";
import ResetButton from "@/features/countdown-timer/components/ButtonControls/ResetButton";
import SkipButton from "@/features/countdown-timer/components/ButtonControls/SkipButton";
import StartButton from "@/features/countdown-timer/components/ButtonControls/StartButton";
import {
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";

const ButtonControls = () => {
  const timerPaused = useTimerPaused();
  const timerRunning = useTimerRunning();

  return (
    <div className={"mb-8 flex justify-center gap-4"}>
      {timerPaused && <StartButton />}
      {!timerPaused && <PauseButton />}
      {timerRunning && <ResetButton />}
      <SkipButton />
    </div>
  );
};

export default ButtonControls;
