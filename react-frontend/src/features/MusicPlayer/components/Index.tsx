import PauseButton from "@/features/MusicPlayer/components/PauseButton";
import PlayButton from "@/features/MusicPlayer/components/PlayButton";
import VolumeControls from "@/features/MusicPlayer/components/VolumeControls";
import {
  MusicPlayerProvider,
  useMusicPlayerContext,
} from "@/features/MusicPlayer/stores/MusicPlayerContext.tsx";
import { usePlaybackPaused } from "@/features/MusicPlayer/stores/MusicPlayerStore";

const MusicPlayerContent = () => {
  const { playerRef } = useMusicPlayerContext();
  const playbackPaused = usePlaybackPaused();

  return (
    <article
      className={
        "border-t-base-content/25 bg-base-100 fixed right-4 bottom-5 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg select-none"
      }
    >
      <div className={"hidden"} ref={playerRef}></div>

      {playbackPaused ? <PauseButton /> : <PlayButton />}

      <VolumeControls />

      {/*<MusicSwitcher />*/}
    </article>
  );
};

const MusicPlayer = () => {
  return (
    <MusicPlayerProvider>
      <MusicPlayerContent />
    </MusicPlayerProvider>
  );
};

export default MusicPlayer;
