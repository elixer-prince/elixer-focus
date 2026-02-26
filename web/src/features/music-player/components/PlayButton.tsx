import { playVideo } from "@/features/music-player/utils/playback";
import { useSetPlaybackPaused } from "@/stores/music-player";
import type { YTPlayerRef } from "@/types/music-player/player";
import { FaPlay } from "react-icons/fa6";

interface PlayButtonProps {
  playerInstanceRef: YTPlayerRef;
}

const PlayButton = ({ playerInstanceRef }: PlayButtonProps) => {
  const setPlaybackPaused = useSetPlaybackPaused();

  return (
    <button
      className="play-button flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      onClick={() => {
        playVideo(playerInstanceRef);
        setPlaybackPaused(false);
      }}
    >
      <FaPlay size={16} />
    </button>
  );
};

export default PlayButton;
