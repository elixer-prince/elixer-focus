import PauseButton from "@features/CountdownTimer/ButtonControls/PauseButton";
import ResetButton from "@features/CountdownTimer/ButtonControls/ResetButton";
import SkipButton from "@features/CountdownTimer/ButtonControls/SkipButton/Index";
import StartButton from "@features/CountdownTimer/ButtonControls/StartButton";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext";

const CountdownButtonControls = () => {
    const { timerPaused, timerRunning } = useCountdownTimerContext();

    return (
        // Countdown Timer Button Controls
        <div className="mb-8 flex justify-center gap-2 border border-red-500">
            {timerPaused && <StartButton />}
            {!timerPaused && <PauseButton />}
            {timerRunning && <ResetButton />}
            <SkipButton />
        </div>
    );
};

export default CountdownButtonControls;
