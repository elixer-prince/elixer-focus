import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import {
  useSetShowVolumeSlider,
  useSetVolume,
  useShowVolumeSlider,
  useVolume,
} from "@/features/music-player/stores/store";
import type { ChangeEvent } from "react";
import { MdVolumeUp } from "react-icons/md";

const VolumeControls = () => {
  const volume = useVolume();
  const showVolumeSlider = useShowVolumeSlider();
  const setVolume = useSetVolume();
  const setShowVolumeSlider = useSetShowVolumeSlider();

  const { playerInstanceRef } = useMusicPlayerContext();

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    playerInstanceRef.current?.setVolume(newVolume);
  };

  return (
    // Volume Controls
    <div className="debug-border flex items-center gap-4">
      <button onClick={() => setShowVolumeSlider(!showVolumeSlider)}>
        {/* Volume Toggle Icon */}
        <MdVolumeUp
          role="img"
          aria-label="Toggle volume controls"
          size={28}
          className="cursor-pointer"
        />
      </button>

      {showVolumeSlider && (
        // Volume Slider
        <input
          className="range range-xs range-primary rounded-full"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
      )}
    </div>
  );
};

export default VolumeControls;
