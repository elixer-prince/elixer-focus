import {
  useChosenSongId,
  useSongs,
  useSetMusicPaused,
} from "@/features/music-player/stores/store";
import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { getVideoId } from "@/features/music-player/utils/conversion";
import { MdPlayArrow } from "react-icons/md";

const PlayButton = () => {
  const setMusicPaused = useSetMusicPaused();
  const chosenSongId = useChosenSongId();
  const songs = useSongs();
  const { playerInstanceRef, isControllingPlayerRef } = useMusicPlayerContext();

  return (
    // Play Button
    <button
      className="flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      onClick={() => {
        setMusicPaused(false);

        if (playerInstanceRef.current) {
          const selectedSong = songs.find((song) => song.id === chosenSongId);
          if (selectedSong) {
            isControllingPlayerRef.current = true;
            const videoId = getVideoId(selectedSong.src);
            const player = playerInstanceRef.current;
            // Resume an already-loaded video with playVideo() instead of
            // restarting from the beginning with loadVideoById(). Only load
            // fresh when the player hasn't loaded any video yet (UNSTARTED).
            // Called directly in the click handler so the browser treats it
            // as a user gesture and allows autoplay.
            if (player.getPlayerState() !== -1) {
              player.playVideo();
            } else {
              player.loadVideoById({ videoId, startSeconds: 0 });
            }
          }
        }
      }}
    >
      {/* Play Icon */}
      <MdPlayArrow role="img" aria-label="Play music button" size={28} />
    </button>
  );
};

export default PlayButton;
