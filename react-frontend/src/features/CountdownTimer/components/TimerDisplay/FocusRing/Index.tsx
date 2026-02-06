import BackgroundTrack from "@/features/CountdownTimer/components/TimerDisplay/FocusRing/BackgroundTrack.tsx";
import ColouredArc from "@/features/CountdownTimer/components/TimerDisplay/FocusRing/ColouredArc.tsx";
import EndDot from "@/features/CountdownTimer/components/TimerDisplay/FocusRing/EndDot.tsx";

const FocusRing = () => {
    return (
        <svg
            className={
                "pointer-events-none absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
            }
            viewBox="0 0 344 344"
        >
            <BackgroundTrack />
            <ColouredArc />
            <EndDot />
        </svg>
    );
};

export default FocusRing;
