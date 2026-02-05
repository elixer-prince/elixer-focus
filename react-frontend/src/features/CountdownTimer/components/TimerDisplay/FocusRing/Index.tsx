import BackgroundTrack from "@features/CountdownTimer/components/TimerDisplay/FocusRing/BackgroundTrack.tsx";
import ColouredArc from "@features/CountdownTimer/components/TimerDisplay/FocusRing/ColouredArc.tsx";
import EndDot from "@features/CountdownTimer/components/TimerDisplay/FocusRing/EndDot.tsx";
import { focusRingStyles } from "@features/CountdownTimer/components/TimerDisplay/styles.ts";

const FocusRing = () => {
    return (
        <svg className={focusRingStyles} viewBox="0 0 344 344">
            <BackgroundTrack />
            <ColouredArc />
            <EndDot />
        </svg>
    );
};

export default FocusRing;
