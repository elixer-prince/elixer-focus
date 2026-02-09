import PauseButton from "@/features/music-player/components/PauseButton";
import PlayButton from "@/features/music-player/components/PlayButton";
import VolumeControls from "@/features/music-player/components/VolumeControls";
import useMusicPlayer from "@/hooks/useMusicPlayer.ts";
import { usePlaybackPaused } from "@/stores/music-player.ts";
import { useRef } from "react";
import type { YTPlayer } from "@/types/music-player/player.ts";

const MusicPlayer = () => {
  const playbackPaused = usePlaybackPaused();

  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);

  useMusicPlayer({ playerRef, playerInstanceRef });

  return (
    <article
      className={
        "border-t-base-content/25 bg-base-100 fixed right-4 bottom-5 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg select-none"
      }
    >
      <div className={"hidden"} ref={playerRef}></div>

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
