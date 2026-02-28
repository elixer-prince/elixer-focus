import DropdownToggle from "@/features/music-player/components/MusicSwitcher/DropdownToggle";
import OptionsContainer from "@/features/music-player/components/MusicSwitcher/OptionsContainer";

// BUG: The music player appears under the countdown timer number

const MusicSwitcher = () => {
  return (
    <div className="music-switcher dropdown dropdown-top dropdown-center">
      <DropdownToggle />
      <OptionsContainer />
    </div>
  );
};

export default MusicSwitcher;
