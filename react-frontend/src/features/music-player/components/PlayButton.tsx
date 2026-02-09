import { useSetPlaybackPaused } from "@/stores/music-player.ts";
import { playVideo } from "@/features/music-player/utils/playback";
import { FaPlay } from "react-icons/fa6";
import type { YTPlayerRef } from "@/types/music-player/player.ts";

const PlayButton = ({
  playerInstanceRef,
}: {
  playerInstanceRef: YTPlayerRef;
}) => {
  const setPlaybackPaused = useSetPlaybackPaused();

  return (
    <div
      className={
        "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      }
      onClick={() => {
        playVideo(playerInstanceRef);
        setPlaybackPaused(false);
      }}
    >
      <FaPlay size={16} />
    </div>
  );
};

export default PlayButton;
