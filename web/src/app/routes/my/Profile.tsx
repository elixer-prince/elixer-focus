import CharacterStats from "@/features/profile/components/CharacterStats";
import ProfileBadges from "@/features/profile/components/ProfileBadges";
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import ProfileTheme from "@/features/profile/components/ProfileTheme";
import RecentActivity from "@/features/profile/components/RecentActivity";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import usePageTitle from "@/hooks/usePageTitle";

const ProfileRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Profile");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8 max-sm:px-4">
      <header>
        <p className="text-base-content/70 text-sm font-semibold tracking-wide uppercase">
          Your focus journey
        </p>
        <h1 className="text-base-content mt-1 text-3xl font-bold">Profile</h1>
        <p className="text-base-content/60 mt-2 max-w-2xl">
          See the progress behind your focus habits and celebrate the work you
          have completed.
        </p>
      </header>

      <ProfileHeader />
      <ProfileStats />
      <CharacterStats />
      <RecentActivity />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileBadges />
        <ProfileTheme />
      </div>
    </div>
  );
};

export default ProfileRoute;
