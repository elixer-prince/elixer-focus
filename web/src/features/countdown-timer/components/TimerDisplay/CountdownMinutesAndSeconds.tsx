import useHandleCountdownState from "@/features/countdown-timer/hooks/useHandleCountdownState";
import { useRemainingTimeInSeconds } from "@/features/countdown-timer/stores/countdown-store";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";
import {
  useCustomSessionInputShown,
  useSetCustomSessionInputShown,
} from "@/features/countdown-timer/stores/session-store";

const CountdownMinutesAndSeconds = () => {
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const customSessionInputShown = useCustomSessionInputShown();
  const setCustomSessionInputShown = useSetCustomSessionInputShown();

  const { isEndingSoon } = useHandleCountdownState();

  const baseClasses = "z-10  text-7xl transition-colors duration-500";

  return customSessionInputShown ? (
    <div className={baseClasses}>
      <input
        type="text"
        placeholder="25"
        className="border-primary-content/50 focus:outline-primary w-30 rounded-md border-2 px-4 py-2 text-center text-6xl placeholder:italic"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (event.currentTarget.value.trim() === "") {
              event.currentTarget.value = "";
              return;
            }
            alert(event.currentTarget.value);
            event.currentTarget.value = "";
            setCustomSessionInputShown(false);
          }
        }}
      />
    </div>
  ) : (
    <div
      className={`${
        isEndingSoon ? "text-error animate-pulse" : ""
      } pointer-events-none ${baseClasses}`.trim()}
    >
      {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
    </div>
  );
};

export default CountdownMinutesAndSeconds;
