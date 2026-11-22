import useFocusRing from "@/features/countdown-timer/hooks/useFocusRing";

const ColouredArc = ({ isPulsing }: { isPulsing: boolean }) => {
  const { radius, dashoffset, circumference, CENTER } = useFocusRing();

  return (
    <circle
      className={
        "stroke-primary text-primary fill-none stroke-8" +
        (isPulsing ? " focus-ring-pulse" : "")
      }
      cx={CENTER}
      cy={CENTER}
      r={radius}
      strokeDasharray={circumference}
      strokeDashoffset={dashoffset}
      strokeLinecap="round"
      style={{
        transition: "stroke-dashoffset 1s linear",
        ...(isPulsing
          ? {}
          : { filter: "drop-shadow(0 0 0.25rem currentColor)" }),
      }}
    />
  );
};

export default ColouredArc;
