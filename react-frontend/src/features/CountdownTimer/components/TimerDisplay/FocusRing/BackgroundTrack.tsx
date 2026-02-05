import useFocusRing from "@features/CountdownTimer/components/TimerDisplay/FocusRing/hooks/useFocusRing.ts";
import { backgroundTrackStyles } from "@features/CountdownTimer/components/TimerDisplay/styles.ts";

const BackgroundTrack = () => {
    const { radius, CENTER } = useFocusRing();

    return (
        <circle
            className={backgroundTrackStyles}
            cx={CENTER}
            cy={CENTER}
            r={radius}
        />
    );
};

export default BackgroundTrack;
