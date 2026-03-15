import {
  useChosenSongId,
  useMusicPaused,
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

    // Respect paused state
    if (musicPaused) {
      playerInstanceRef.current.pauseVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              autoplay: musicPaused ? 0 : 1,
              playsinline: 1,
            },
            events: {
              onReady: () => {
                // Set initial volume from store
                playerInstanceRef.current?.setVolume(volume);
              },
            },
          },
        );
      }
    };
  }, [songs, chosenSongId, musicPaused, playerInstanceRef, playerRef, volume]);
};

export default useMusicPlayer;
