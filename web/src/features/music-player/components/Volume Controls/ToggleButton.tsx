import {
  useSetShowVolumeSlider,
  useShowVolumeSlider,
  useVolume,
} from "@/features/music-player/stores/store";
import { MdVolumeOff, MdVolumeDown, MdVolumeUp } from "react-icons/md";

const ToggleButton = () => {
  const showVolumeSlider = useShowVolumeSlider();
  const setShowVolumeSlider = useSetShowVolumeSlider();
  const volume = useVolume();

  // Pick icon based on current volume level
  let VolumeIcon;
  if (volume === 0) {
    VolumeIcon = MdVolumeOff;
  } else if (volume <= 50) {
    VolumeIcon = MdVolumeDown;
  } else {
    VolumeIcon = MdVolumeUp;
  }

  return (
    // Volume Toggle Button
    <button onClick={() => setShowVolumeSlider(!showVolumeSlider)}>
      {/* Volume Toggle Icon */}
      <VolumeIcon
        aria-label="Toggle volume controls"
        className="cursor-pointer"
        role="img"
        size={28}
      />
    </button>
  );
};

export default ToggleButton;
