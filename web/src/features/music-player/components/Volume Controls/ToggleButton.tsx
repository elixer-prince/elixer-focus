import {
  useSetShowVolumeSlider,
  useShowVolumeSlider,
} from "@/features/music-player/stores/store";
import { MdVolumeUp } from "react-icons/md";

const ToggleButton = () => {
  const showVolumeSlider = useShowVolumeSlider();
  const setShowVolumeSlider = useSetShowVolumeSlider();

  return (
    // Volume Toggle Button
    <button onClick={() => setShowVolumeSlider(!showVolumeSlider)}>
      {/* Volume Toggle Icon */}
      <MdVolumeUp
        aria-label="Toggle volume controls"
        className="cursor-pointer"
        role="img"
        size={28}
      />
    </button>
  );
};

export default ToggleButton;
