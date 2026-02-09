import PauseButton from "@/features/music-player/components/PauseButton";
import PlayButton from "@/features/music-player/components/PlayButton";
import VolumeControls from "@/features/music-player/components/VolumeControls";
import useMusicPlayer from "@/features/music-player/hooks/useMusicPlayer";
import { usePlaybackPaused } from "@/features/music-player/stores/MusicPlayerStore";
import { useRef } from "react";

const MusicPlayer = () => {
  const playbackPaused = usePlaybackPaused();

  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<any>(null);

  useMusicPlayer({ playerRef, playerInstanceRef });

  return (
    <article
      className={
        "border-t-base-content/25 bg-base-100 fixed right-4 bottom-5 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg select-none"
      }
    >
      <div className={"hidden"} ref={playerRef}></div>

      {playbackPaused ? (
        <PauseButton playerInstanceRef={playerInstanceRef} />
      ) : (
        <PlayButton playerInstanceRef={playerInstanceRef} />
      )}

      <VolumeControls playerInstanceRef={playerInstanceRef} />

      {/*<MusicSwitcher />*/}
    </article>
  );
};

export default MusicPlayer;
