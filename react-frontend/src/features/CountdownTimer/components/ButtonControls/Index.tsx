import PauseButton from "@/features/CountdownTimer/components/ButtonControls/PauseButton";
import ResetButton from "@/features/CountdownTimer/components/ButtonControls/ResetButton";
import SkipButton from "@/features/CountdownTimer/components/ButtonControls/SkipButton";
import StartButton from "@/features/CountdownTimer/components/ButtonControls/StartButton";
import {
  useTimerPaused,
  useTimerRunning,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";

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
