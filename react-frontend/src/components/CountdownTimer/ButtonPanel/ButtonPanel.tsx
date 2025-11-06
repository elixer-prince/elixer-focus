import PauseButton from "./PauseButton";
import StartButton from "./StartButton";
import ResetButton from "./ResetButton";
import SkipButton from "./SkipButton";
import useCountdownTimerChecks from "../../../hooks/CountdownTimer/useCountdownTimerChecks.tsx";

const CountdownButtonControls = () => {
    const { countdownTimerIsPaused, countdownTimerIsNotPaused } =
        useCountdownTimerChecks();

    return (
        <div className="flex justify-center gap-2">
            {countdownTimerIsPaused() && <StartButton />}
            {countdownTimerIsNotPaused() && <PauseButton />}
            <ResetButton />
            <SkipButton />
        </div>
    );
};

export default CountdownButtonControls;
