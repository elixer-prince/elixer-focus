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

        // loadVideoById() is called directly in the click handler so the
        // browser treats it as a user gesture and allows autoplay. Calling
        // playVideo() from a React effect runs outside the gesture and is
        // blocked by the browser's autoplay policy, which caused the play
        // button to toggle back to "paused" with no sound on the first click.
        if (playerInstanceRef.current) {
          const selectedSong = songs.find((song) => song.id === chosenSongId);
          if (selectedSong) {
            isControllingPlayerRef.current = true;
            const videoId = getVideoId(selectedSong.src);
            playerInstanceRef.current.loadVideoById({ videoId, startSeconds: 0 });
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
