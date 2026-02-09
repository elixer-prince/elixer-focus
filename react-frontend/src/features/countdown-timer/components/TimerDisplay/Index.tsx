import ClickableArea from "@/features/countdown-timer/components/TimerDisplay/ClickableArea";
import CountdownMinutesAndSeconds from "@/features/countdown-timer/components/TimerDisplay/CountdownMinutesAndSeconds";
import CountdownSeconds from "@/features/countdown-timer/components/TimerDisplay/CountdownSeconds";
import FocusRing from "@/features/countdown-timer/components/TimerDisplay/FocusRing/Index";
import SessionCount from "@/features/countdown-timer/components/TimerDisplay/SessionCount";

const CountdownDisplay = () => {
  return (
    <div
      className={
        "relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden p-10 outline-none select-none"
      }
    >
      <ClickableArea />
      <FocusRing />
      <SessionCount />
      <CountdownSeconds />
      <CountdownMinutesAndSeconds />
    </div>
  );
};

export default CountdownDisplay;
