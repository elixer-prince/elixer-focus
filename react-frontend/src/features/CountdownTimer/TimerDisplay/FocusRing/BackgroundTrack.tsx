import useFocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/hooks/useFocusRing";

const BackgroundTrack = () => {
    const { radius, CENTER } = useFocusRing();

    return (
        // Background track
        <circle
            className="fill-none stroke-neutral-600 stroke-8"
            cx={CENTER}
            cy={CENTER}
            r={radius}
        />
    );
};

export default BackgroundTrack;
