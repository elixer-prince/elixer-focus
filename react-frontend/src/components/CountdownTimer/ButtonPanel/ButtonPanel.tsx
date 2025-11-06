import PauseButton from "./PauseButton";
import StartButton from "./StartButton";
import ResetButton from "./ResetButton";
import SkipButton from "./SkipButton";

const CountdownButtonControls = () => {
    return (
        <div className="flex justify-center gap-2">
            <StartButton />
            <PauseButton />
            <ResetButton />
            <SkipButton />
        </div>
    );
};

export default CountdownButtonControls;
