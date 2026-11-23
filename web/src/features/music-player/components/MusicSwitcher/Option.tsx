import {
  useChosenSongId,
  useMusicPaused,
  useRemoveSong,
  useSetChosenSongId,
  useSongs,
} from "@/features/music-player/stores/store";
import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { getVideoId } from "@/features/music-player/utils/conversion";

interface OptionProps {
  id: string;
  title: string;
  isRecommended: boolean;
  isCustom?: boolean;
}

const Option = ({ id, title, isRecommended, isCustom }: OptionProps) => {
  const chosenSongId = useChosenSongId();
  const setChosenSongId = useSetChosenSongId();
  const musicPaused = useMusicPaused();
  const songs = useSongs();
  const removeSong = useRemoveSong();
  const { playerInstanceRef, lastLoadedVideoIdRef } = useMusicPlayerContext();

  const handleSwitch = () => {
    setChosenSongId(id);

    // When music is playing, cue the new video synchronously in the click
    // handler to preserve the browser user gesture context. The cue operation
    // is asynchronous, so we cannot call playVideo() immediately. Instead,
    // the onStateChange listener in useMusicPlayer detects when the video
    // enters the CUED state and calls playVideo() from within the event
    // chain, which the browser still treats as user-initiated.
    if (!musicPaused && playerInstanceRef.current) {
      const selectedSong = songs.find((song) => song.id === id);
      if (selectedSong) {
        const videoId = getVideoId(selectedSong.src);
        lastLoadedVideoIdRef.current = videoId;
        playerInstanceRef.current.cueVideoById({ videoId, startSeconds: 0 });
      }
    }
  };

  return (
    <li className="menu-item relative min-w-0">
      <label aria-label={`Switch to '${title}'`}>
        <input
          className="radio radio-primary radio-sm"
          name="song-choice"
          type="radio"
          onChange={handleSwitch}
          checked={chosenSongId === id}
        />
        <div
          className={`flex flex-wrap items-center gap-1 ${chosenSongId === id ? "font-bold" : ""}`}
        >
          {isRecommended && (
            <span className="badge badge-sm badge-secondary badge-soft">
              Recommended
            </span>
          )}
          {isCustom && (
            <span className="badge badge-sm badge-ghost badge-outline">
              Custom
            </span>
          )}
          <span className="min-w-0 break-words">{title}</span>
        </div>
      </label>
      {isCustom && (
        <button
          type="button"
          aria-label={`Remove '${title}'`}
          className="btn btn-ghost btn-xs btn-circle text-error hover:text-error absolute top-1/2 right-1 -translate-y-1/2"
          onClick={(e) => {
            e.stopPropagation();
            removeSong(id);
          }}
        >
          ✕
        </button>
      )}
    </li>
  );
};

export default Option;
