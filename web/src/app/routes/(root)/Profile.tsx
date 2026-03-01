import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";

const Profile = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Profile");

  return <div>{/*<p>Profile page...</p>*/}</div>;
};

export default Profile;
