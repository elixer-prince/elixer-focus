import useFocusRing from "@features/CountdownTimer/components/TimerDisplay/FocusRing/hooks/useFocusRing.ts";
import { endDotStyles } from "@features/CountdownTimer/components/TimerDisplay/styles.ts";

const EndDot = () => {
    const { radius, angleDeg, CENTER } = useFocusRing();

    return (
        <circle
            className={endDotStyles}
            cx={CENTER + radius}
            cy={CENTER}
            r={12}
            style={{
                transformOrigin: `${CENTER / 16}rem ${CENTER / 16}rem`,
                transform: `rotate(${angleDeg}deg)`,
                filter: "drop-shadow(0 0 0.25rem currentColor)",
            }}
        />
    );
};

export default EndDot;
