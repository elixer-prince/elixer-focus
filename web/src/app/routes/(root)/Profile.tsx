import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import usePageTitle from "@/hooks/usePageTitle";

const ProfileRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Profile");

  return <div>{/*<p>Profile page...</p>*/}</div>;
};

export default ProfileRoute;
