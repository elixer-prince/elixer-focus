import { useEffect } from "react";
import { useMusicPlayerContext } from "../stores/MusicPlayerContext";
import { getVideoId } from "../utils/conversion";
import { useChosenSongId, useSongs } from "../stores/MusicPlayerStore";

const useMusicPlayer = () => {
  const { playerInstanceRef, playerRef } = useMusicPlayerContext();
  const songs = useSongs();
  const chosenSongId = useChosenSongId();

  // useEffect(() => {
    //   if (playerInstanceRef.current) {
    //     const song = songs.find((s) => s.id === chosenSongId);
    //     if (song) {
    //       playerInstanceRef.current.loadVideoById(getVideoId(song.src));
    //     }
    //   }
    // }, [chosenSongId, songs]);

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

  return <div>useMusicPlayer</div>;
};
export default useMusicPlayer;
