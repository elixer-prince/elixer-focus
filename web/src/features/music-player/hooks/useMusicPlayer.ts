// import { onPlayerReady } from "@/features/music-player/utils/controls";
import { getVideoId } from "@/features/music-player/utils/conversion";
import {
  useChosenSongId,
  useMusicPaused,
  useSongs,
} from "@/features/music-player/stores/store";
import type { YTPlayer } from "@/types/music-player/player";
import { type RefObject, useEffect } from "react";

interface MusicPlayerContextType {
  playerInstanceRef: RefObject<YTPlayer | null>;
  playerRef: RefObject<HTMLDivElement | null>;
}

const useMusicPlayer = ({
  playerInstanceRef,
  playerRef,
}: MusicPlayerContextType) => {
  const chosenSongId = useChosenSongId();
  const musicPaused = useMusicPaused();
  const songs = useSongs();

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  useEffect(() => {
    // Only proceed if player exists
    if (!playerInstanceRef.current) return;

    const selectedSong = songs.find((song) => song.id === chosenSongId);

    if (!selectedSong) {
      return console.error(`Song with id ${chosenSongId} not found`);
    }

    const videoId = getVideoId(selectedSong.src);

    // Load new video to play the song
    playerInstanceRef.current.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
    });

    // If music should be paused, pause it after loading
    if (musicPaused) {
      setTimeout(() => {
        playerInstanceRef.current?.pauseVideo();
      }, 100);
    }
  }, [chosenSongId, musicPaused, playerInstanceRef, songs]);

  useEffect(() => {
    globalThis.onYouTubeIframeAPIReady = () => {
      // Only proceed if player exists
      if (playerRef.current !== null) {
        playerInstanceRef.current = new globalThis.YT.Player(
          playerRef.current,
          {
            videoId: getVideoId(songs[chosenSongId].src),
            playerVars: { autoplay: 1, playsinline: 1 },
            events: {
              // onReady: (event: YTPlayerEvent) =>
              // onPlayerReady(event, musicPaused),
              // onStateChange: onPlayerStateChange,
            },
          },
        );
      }
    };
  }, [songs, chosenSongId, musicPaused, playerInstanceRef, playerRef]);
};

export default useMusicPlayer;
