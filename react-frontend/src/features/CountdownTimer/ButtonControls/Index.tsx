import PauseButton from "@features/CountdownTimer/ButtonControls/PauseButton.tsx";
import ResetButton from "@features/CountdownTimer/ButtonControls/ResetButton.tsx";
import SkipButton from "@features/CountdownTimer/ButtonControls/SkipButton/Index.tsx";
import StartButton from "@features/CountdownTimer/ButtonControls/StartButton.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const CountdownButtonControls = () => {
    const { timerPaused, timerRunning } = useCountdownTimerContext();

    return (
        <div className="mb-8 flex justify-center gap-2">
            {timerPaused && <StartButton />}
            {!timerPaused && <PauseButton />}
            {timerRunning && <ResetButton />}
            <SkipButton />
        </div>
    );
};

export default CountdownButtonControls;
