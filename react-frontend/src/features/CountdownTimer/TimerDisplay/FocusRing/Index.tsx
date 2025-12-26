import BackgroundTrack from "@features/CountdownTimer/TimerDisplay/FocusRing/BackgroundTrack";
import ColouredArc from "@features/CountdownTimer/TimerDisplay/FocusRing/ColouredArc";
import EndDot from "@features/CountdownTimer/TimerDisplay/FocusRing/EndDot";

const FocusRing = () => {
    return (
        <svg
            className="pointer-events-none absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
            viewBox="0 0 344 344"
        >
            <BackgroundTrack />
            <ColouredArc />
            <EndDot />
        </svg>
    );
};

export default FocusRing;
