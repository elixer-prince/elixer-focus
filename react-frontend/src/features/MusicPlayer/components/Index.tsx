import PauseButton from "@/features/MusicPlayer/components/PauseButton";
import PlayButton from "@/features/MusicPlayer/components/PlayButton";
import VolumeControls from "@/features/MusicPlayer/components/VolumeControls";
import { usePlaybackPaused } from "@/features/MusicPlayer/stores/MusicPlayerStore";
import { useRef } from "react";

const MusicPlayer = () => {
  const playbackPaused = usePlaybackPaused();

  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<any>(null);

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
