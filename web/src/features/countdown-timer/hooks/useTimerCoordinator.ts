import {
  getTimerCoordinatorStatus,
  startTimerCoordinator,
  subscribeToTimerCoordinator,
} from "@/features/countdown-timer/services/timer-coordinator";
import { useEffect, useSyncExternalStore } from "react";

export const useTimerCoordinatorStatus = () =>
  useSyncExternalStore(
    subscribeToTimerCoordinator,
    getTimerCoordinatorStatus,
    getTimerCoordinatorStatus,
  );

const useTimerCoordinator = () => {
  const status = useTimerCoordinatorStatus();

  useEffect(() => startTimerCoordinator(), []);

  return status;
};

export default useTimerCoordinator;
