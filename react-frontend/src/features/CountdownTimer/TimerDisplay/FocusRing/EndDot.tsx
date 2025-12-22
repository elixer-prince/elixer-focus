import useFocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/hooks/useFocusRing.tsx";

const EndDot = () => {
    const { radius, angleDeg, CENTER } = useFocusRing();

    return (
        // Focus Ring End Dot
        <circle
            className="fill-primary text-primary transition-transform duration-1000 ease-linear"
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
