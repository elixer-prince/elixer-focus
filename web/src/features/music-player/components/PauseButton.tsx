import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { useSetMusicPaused } from "@/features/music-player/stores/store";
import { pauseVideo } from "@/features/music-player/utils/playback";
import { MdPause } from "react-icons/md";

const PauseButton = () => {
  const setMusicPaused = useSetMusicPaused();
  const { playerInstanceRef } = useMusicPlayerContext();

  return (
    // Pause Button
    <button
      className="flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      onClick={() => {
        pauseVideo(playerInstanceRef);
        setMusicPaused(true);
      }}
    >
      {/* Pause Icon */}
      <MdPause role="img" aria-label="Pause music button" size={28} />
    </button>
  );
};

export default PauseButton;
