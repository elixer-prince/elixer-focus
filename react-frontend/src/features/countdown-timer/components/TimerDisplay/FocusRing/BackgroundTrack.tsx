import useFocusRing from "@/features/countdown-timer/components/TimerDisplay/FocusRing/hooks/useFocusRing.ts";

const BackgroundTrack = () => {
  const { radius, CENTER } = useFocusRing();

  return (
    <circle
      className={"stroke-primary-content/25 fill-none stroke-8"}
      cx={CENTER}
      cy={CENTER}
      r={radius}
    />
  );
};

export default BackgroundTrack;
