import PauseButton from "./PauseButton.tsx";
import StartButton from "./StartButton.tsx";
import ResetButton from "./ResetButton.tsx";
import SkipButton from "./SkipButton.tsx";
import useCountdownTimerChecks from "../../../hooks/CountdownTimer/useCountdownTimerChecks.tsx";

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
