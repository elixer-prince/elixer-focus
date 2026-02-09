import { useChosenSongId, useSongs } from "@/stores/music-player.ts";
import { getVideoId } from "@/features/music-player/utils/conversion.ts";
import { type RefObject, useEffect } from "react";

interface MusicPlayerContextType {
  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<unknown>;
}

const useMusicPlayer = ({
  playerRef,
  playerInstanceRef,
}: MusicPlayerContextType) => {
  const songs = useSongs();
  const chosenSongId = useChosenSongId();

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        playerInstanceRef.current = new window.YT.Player(playerRef.current, {
          videoId: getVideoId(songs[chosenSongId].src),
          playerVars: { autoplay: 0, playsinline: 1 },
          // events: {
          //     onReady: (event: any) =>
          //         onPlayerReady(event, playbackPaused),
          //     onStateChange: onPlayerStateChange,
          // },
        });
      }
    };
  }, []);
};

export default useMusicPlayer;
