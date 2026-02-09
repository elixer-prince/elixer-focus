import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";
import { useCallback } from "react";

const usePageTitle = () => {
  // * Locked * //
  const displayRemainingTimeInPageTitle = useCallback(
    (remainingSeconds: number, currentSessionType: string) => {
      const time = formatTimeInMinutesAndSeconds(remainingSeconds);

      if (currentSessionType === "Focus") {
        document.title = `${time} - Time to focus!`;
      } else {
        document.title = `${time} - Take a break!`;
      }
    },
    [],
  );

  // * Locked * //
  const resetPageTitle = useCallback(() => {
    document.title = "Elixer Focus";
  }, []);

  return { displayRemainingTimeInPageTitle, resetPageTitle };
};

export default usePageTitle;
