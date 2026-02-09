import { useSetPlaybackPaused } from "@/stores/music-player.ts";
import { playVideo } from "@/features/music-player/utils/playback";
import { FaPlay } from "react-icons/fa6";

const PlayButton = ({ playerInstanceRef }: { playerInstanceRef: any }) => {
  const setPlaybackPaused = useSetPlaybackPaused();

  return (
    <div
      className={
        "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      }
      onClick={() => {
        playVideo(playerInstanceRef.current);
        setPlaybackPaused(true);
      }}
    >
      <FaPlay size={16} />
    </div>
  );
};

export default PlayButton;
