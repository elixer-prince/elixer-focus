import PauseButton from "./PauseButton";
import PlayButton from "./PlayButton";
import ResetButton from "./ResetButton";
import SkipButton from "./SkipButton";

const CountdownButtonControls = () => {
    return (
        <div className="flex justify-center gap-2">
            <PlayButton />
            <PauseButton />
            <ResetButton />
            <SkipButton />
        </div>
    );
};

export default CountdownButtonControls;
