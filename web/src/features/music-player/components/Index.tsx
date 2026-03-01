import MusicSwitcher from "@/features/music-player/components/MusicSwitcher/Index";
import PauseButton from "@/features/music-player/components/PauseButton";
import PlayButton from "@/features/music-player/components/PlayButton";
import VolumeControls from "@/features/music-player/components/VolumeControls";
import useMusicPlayer from "@/features/music-player/hooks/useMusicPlayer";
import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { useMusicPaused } from "@/features/music-player/stores/store";

const MusicPlayer = () => {
  const musicPaused = useMusicPaused();
  const { playerRef, playerInstanceRef } = useMusicPlayerContext();

  useMusicPlayer({ playerRef, playerInstanceRef });

  return (
    <article className="music-player border-t-base-content/25 bg-base-100 hover:outline-primary/75 fixed right-4 bottom-5 z-30 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg outline-2 outline-transparent transition-all duration-300 select-none hover:-translate-y-0.5">
      <div className="invisible-player hidden" ref={playerRef}></div>

      <MusicSwitcher />

      {musicPaused ? <PlayButton /> : <PauseButton />}

      <VolumeControls />
    </article>
  );
};

export default MusicPlayer;
