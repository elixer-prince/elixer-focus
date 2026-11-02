import {
  useChosenSongId,
  useMusicPaused,
  useMusicPlayerStore,
  useSongs,
  useVolume,
} from "@/features/music-player/stores/store";
import type { YTPlayer } from "@/features/music-player/types/player";
import { getVideoId } from "@/features/music-player/utils/conversion";
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
  const volume = useVolume();
  const songs = useSongs();

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  // Effect for switching songs
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    const selectedSong = songs.find((song) => song.id === chosenSongId);

    if (!selectedSong) {
      return console.error(`Song with id ${chosenSongId} not found`);
    }

    const videoId = getVideoId(selectedSong.src);

    playerInstanceRef.current.loadVideoById({ videoId, startSeconds: 0 });

    // Pause after loading new song since we always start paused on mount
    playerInstanceRef.current.pauseVideo();
  }, [chosenSongId, songs, playerInstanceRef]);

  // Effect for play/pause only
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    if (musicPaused) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  }, [musicPaused, playerInstanceRef]);

  // Effect for volume changes
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    playerInstanceRef.current.setVolume(volume);
  }, [volume, playerInstanceRef]);

  useEffect(() => {
    const initialSong = songs.find((song) => song.id === chosenSongId);

    globalThis.onYouTubeIframeAPIReady = () => {
      // Only proceed if player exists
      if (playerRef.current !== null) {
        playerInstanceRef.current = new globalThis.YT.Player(
          playerRef.current,
          {
            videoId: getVideoId(initialSong?.src ?? songs[0].src ?? ""),
            playerVars: {
              autoplay: 0,
              playsinline: 1,
            },
            events: {
              onReady: () => {
                const player = playerInstanceRef.current;
                if (!player) return;

                // Set initial volume from store
                player.setVolume(volume);

                // Read the current paused state from the store at this moment,
                // not the closure value. This handles the case where the user
                // clicked Play before the YouTube API finished loading.
                const { musicPaused: isPaused } =
                  useMusicPlayerStore.getState();

                if (!isPaused) {
                  player.playVideo();
                } else {
                  player.pauseVideo();
                }
              },
            },
          },
        );
      }
    };
  }, [songs, chosenSongId, playerInstanceRef, playerRef, volume]);
};

export default useMusicPlayer;
