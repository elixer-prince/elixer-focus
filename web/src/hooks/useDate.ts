import { useUpdateCurrentTime } from "@/stores/date";
import { useEffect } from "react";

export const useDate = () => {
  const updateCurrentTime = useUpdateCurrentTime();

  useEffect(() => {
    const interval = setInterval(() => {
      updateCurrentTime();
    }, 1000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, [updateCurrentTime]);
};
