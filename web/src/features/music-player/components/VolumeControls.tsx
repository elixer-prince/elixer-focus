import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import {
  useSetShowVolumeSlider,
  useSetVolume,
  useShowVolumeSlider,
  useVolume,
} from "@/stores/music-player";
import type { ChangeEvent } from "react";
import { FaVolumeUp } from "react-icons/fa";

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

  // BUG: The volume of the music doesn't get synced at startup even
  // though it shows the correct volume visually.

  return (
    <div className="volume-controls flex items-center gap-4">
      <button onClick={() => setShowVolumeSlider(!showVolumeSlider)}>
        <FaVolumeUp size={20} className={"cursor-pointer"} />
      </button>

      {showVolumeSlider && (
        <input
          className="volume-slider range range-xs range-primary rounded-full"
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
