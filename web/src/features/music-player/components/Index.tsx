import PauseButton from "@/features/music-player/components/PauseButton";
import PlayButton from "@/features/music-player/components/PlayButton";
import VolumeControls from "@/features/music-player/components/VolumeControls";
import useMusicPlayer from "@/hooks/useMusicPlayer";
import { usePlaybackPaused } from "@/stores/music-player";
import type { YTPlayer } from "@/types/music-player/player";
import { useRef } from "react";

const MusicPlayer = () => {
  const playbackPaused = usePlaybackPaused();

  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);

  useMusicPlayer({ playerRef, playerInstanceRef });

  return (
    <article className="music-player border-t-base-content/25 bg-base-100 hover:outline-primary/75 fixed right-4 bottom-5 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg outline-transparent transition-all duration-300 select-none hover:-translate-y-0.5 hover:outline-2">
      <div className="invisible-player hidden" ref={playerRef}></div>

      {playbackPaused ? (
        <PlayButton playerInstanceRef={playerInstanceRef} />
      ) : (
        <PauseButton playerInstanceRef={playerInstanceRef} />
      )}

      <VolumeControls playerInstanceRef={playerInstanceRef} />

      {/*<MusicSwitcher />*/}
    </article>
  );
};

export default MusicPlayer;
