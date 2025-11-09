import PauseButton from "@features/countdown-timer/button-panel/PauseButton";
import StartButton from "@features/countdown-timer/button-panel/StartButton";
import ResetButton from "@features/countdown-timer/button-panel/ResetButton";
import SkipButton from "@features/countdown-timer/button-panel/SkipButton";
import useCountdownTimerChecks from "@hooks/CountdownTimer/useCountdownTimerChecks";

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
