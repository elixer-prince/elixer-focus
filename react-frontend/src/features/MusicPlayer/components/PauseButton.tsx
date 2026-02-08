import { useSetPlaybackPaused } from "@/features/MusicPlayer/stores/MusicPlayerStore";
import { pauseVideo } from "@/features/MusicPlayer/utils/playback";
import { FaPause } from "react-icons/fa";

const PauseButton = ({ playerInstanceRef }: { playerInstanceRef: any }) => {
  const setPlaybackPaused = useSetPlaybackPaused();

  return (
    <button
      className={
        "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      }
      onClick={() => {
        pauseVideo(playerInstanceRef.current);
        setPlaybackPaused(false);
      }}
    >
      <FaPause size={16} />
    </button>
  );
};

export default PauseButton;
