import ToggleButton from "@/features/music-player/components/Volume Controls/ToggleButton";
import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import {
  useSetVolume,
  useShowVolumeSlider,
  useVolume,
} from "@/features/music-player/stores/store";
import type { ChangeEvent } from "react";

const VolumeControls = () => {
  const volume = useVolume();
  const showVolumeSlider = useShowVolumeSlider();
  const setVolume = useSetVolume();

  const { playerInstanceRef } = useMusicPlayerContext();

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    playerInstanceRef.current?.setVolume(newVolume);
  };

  return (
    // Volume Controls
    <section aria-label="Volume controls" className="flex items-center gap-4">
      <ToggleButton />

      {showVolumeSlider && (
        // Volume Slider
        <input
          aria-label="Volume slider"
          className="range range-xs range-primary rounded-full"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
      )}
    </section>
  );
};

export default VolumeControls;
