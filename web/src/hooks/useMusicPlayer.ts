import { onPlayerReady } from "@/features/music-player/utils/controls";
import { getVideoId } from "@/features/music-player/utils/conversion";
import {
  useChosenSongId,
  useMusicPaused,
  useSongs,
} from "@/stores/music-player";
import type { YTPlayerEvent } from "@/types/music-player/player";
import { type RefObject, useEffect } from "react";

interface MusicPlayerContextType {
  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<unknown>;
}

const useMusicPlayer = ({
  playerRef,
  playerInstanceRef,
}: MusicPlayerContextType) => {
  const musicPaused = useMusicPaused();
  const songs = useSongs();
  const chosenSongId = useChosenSongId();

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    globalThis.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        playerInstanceRef.current = new globalThis.YT.Player(
          playerRef.current,
          {
            videoId: getVideoId(songs[chosenSongId].src),
            playerVars: { autoplay: 0, playsinline: 1 },
            events: {
              onReady: (event: YTPlayerEvent) =>
                onPlayerReady(event, musicPaused),
              // onStateChange: onPlayerStateChange,
            },
          },
        );
      }
    };
  }, [songs, chosenSongId, musicPaused, playerInstanceRef, playerRef]);
};

export default useMusicPlayer;
