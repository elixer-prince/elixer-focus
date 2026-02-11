import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/CountdownStore";

const Profile = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Profile");

  return <div>{/*<p>Profile page...</p>*/}</div>;
};

export default Profile;
