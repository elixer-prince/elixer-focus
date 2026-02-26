import {
  useSetShowVolumeSlider,
  useSetVolume,
  useShowVolumeSlider,
  useVolume,
} from "@/stores/music-player";
import type { YTPlayerRef } from "@/types/music-player/player";
import { FaVolumeUp } from "react-icons/fa";

interface VolumeControlsProps {
  playerInstanceRef: YTPlayerRef;
}

const VolumeControls = ({ playerInstanceRef }: VolumeControlsProps) => {
  const volume = useVolume();
  const showVolumeSlider = useShowVolumeSlider();
  const setVolume = useSetVolume();
  const setShowVolumeSlider = useSetShowVolumeSlider();

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    playerInstanceRef.current?.setVolume(newVolume);
  };

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
