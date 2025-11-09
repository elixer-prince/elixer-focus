import PauseButton from "@features/countdown-timer/button-panel/PauseButton.tsx";
import StartButton from "@features/countdown-timer/button-panel/StartButton.tsx";
import ResetButton from "@features/countdown-timer/button-panel/ResetButton.tsx";
import SkipButton from "@features/countdown-timer/button-panel/SkipButton.tsx";
import useCountdownTimerChecks from "@features/countdown-timer/hooks/useCountdownTimerChecks.tsx";

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
