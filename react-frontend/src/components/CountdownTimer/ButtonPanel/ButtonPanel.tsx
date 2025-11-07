import PauseButton from "./PauseButton";
import StartButton from "./StartButton";
import ResetButton from "./ResetButton";
import SkipButton from "./SkipButton";
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
