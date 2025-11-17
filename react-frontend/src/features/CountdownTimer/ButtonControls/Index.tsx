import PauseButton from "@features/CountdownTimer/ButtonControls/PauseButton.tsx";
import StartButton from "@features/CountdownTimer/ButtonControls/StartButton.tsx";
import ResetButton from "@features/CountdownTimer/ButtonControls/ResetButton/Index.tsx";
import SkipButton from "@features/CountdownTimer/ButtonControls/SkipButton/Index.tsx";
import useCountdownTimerChecks from "@features/CountdownTimer/hooks/useCountdownTimerChecks.tsx";

const CountdownButtonControls = () => {
    const {
        countdownTimerIsPaused,
        countdownTimerIsNotPaused,
        countdownTimerIsRunning,
    } = useCountdownTimerChecks();

    return (
        <div className="mb-8 flex justify-center gap-2">
            {countdownTimerIsPaused() && <StartButton />}
            {countdownTimerIsNotPaused() && <PauseButton />}
            {countdownTimerIsRunning() && <ResetButton />}
            <SkipButton />
        </div>
    );
};

export default CountdownButtonControls;
