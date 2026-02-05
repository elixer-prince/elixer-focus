import useFocusRing from "@features/CountdownTimer/components/TimerDisplay/FocusRing/hooks/useFocusRing.ts";
import { colouredArcStyles } from "@features/CountdownTimer/components/TimerDisplay/styles.ts";

const ColouredArc = () => {
    const { radius, dashoffset, circumference, CENTER } = useFocusRing();

    return (
        <circle
            className={colouredArcStyles}
            cx={CENTER}
            cy={CENTER}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            style={{
                transition: "stroke-dashoffset 1s linear",
                filter: "drop-shadow(0 0 0.25rem currentColor)",
            }}
        />
    );
};

export default ColouredArc;
