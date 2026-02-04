import PauseButton from "@features/CountdownTimer/components/ButtonControls/PauseButton.tsx";
import ResetButton from "@features/CountdownTimer/components/ButtonControls/ResetButton.tsx";
import SkipButton from "@features/CountdownTimer/components/ButtonControls/SkipButton/Index.tsx";
import StartButton from "@features/CountdownTimer/components/ButtonControls/StartButton.tsx";
import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";

const ButtonControls = () => {
    const { timerPaused, timerRunning } = useCountdownTimerContext();

    return (
        <div className={"mb-8 flex justify-center gap-2"}>
            {timerPaused && <StartButton />}
            {!timerPaused && <PauseButton />}
            {timerRunning && <ResetButton />}
            <SkipButton />
        </div>
    );
};

export default ButtonControls;
