import DropdownToggle from "@/features/music-player/components/MusicSwitcher/DropdownToggle";
import OptionsContainer from "@/features/music-player/components/MusicSwitcher/OptionsContainer";

const MusicSwitcher = () => {
  return (
    <div className="music-switcher dropdown dropdown-top dropdown-center">
      <DropdownToggle />
      <OptionsContainer />
    </div>
  );
};

export default MusicSwitcher;
