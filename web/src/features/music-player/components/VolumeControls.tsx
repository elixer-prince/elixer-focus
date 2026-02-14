import {
  useSetShowSlider,
  useSetVolume,
  useShowSlider,
  useVolume,
} from "@/stores/music-player";
import type { YTPlayerRef } from "@/types/music-player/player";
import { FaVolumeUp } from "react-icons/fa";

interface VolumeControlsProps {
  playerInstanceRef: YTPlayerRef;
}

const VolumeControls = ({ playerInstanceRef }: VolumeControlsProps) => {
  const volume = useVolume();
  const showSlider = useShowSlider();
  const setVolume = useSetVolume();
  const setShowSlider = useSetShowSlider();

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    playerInstanceRef.current?.setVolume(newVolume);
  };

  return (
    <div className={"flex items-center gap-4"}>
      <button onClick={() => setShowSlider(!showSlider)}>
        <FaVolumeUp size={20} className={"cursor-pointer"} />
      </button>

      {showSlider && (
        <input
          type={"range"}
          min={"0"}
          max={"100"}
          value={volume}
          onChange={handleVolumeChange}
          className={"range range-xs range-primary rounded-full"}
        />
      )}
    </div>
  );
};

export default VolumeControls;
