import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { useSetMusicPaused } from "@/features/music-player/stores/store";
import { playVideo } from "@/features/music-player/utils/playback";
import { MdPlayArrow } from "react-icons/md";

const PlayButton = () => {
  const setMusicPaused = useSetMusicPaused();
  const { playerInstanceRef } = useMusicPlayerContext();

  return (
    // Play Button
    <button
      className="flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      onClick={() => {
        playVideo(playerInstanceRef);
        setMusicPaused(false);
      }}
    >
      {/* Play Icon */}
      <MdPlayArrow role="img" aria-label="Play music button" size={28} />
    </button>
  );
};

export default PlayButton;
