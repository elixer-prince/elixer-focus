import PauseButton from "@features/MusicPlayer/PauseButton";
import PlayButton from "@features/MusicPlayer/PlayButton";
import {
    MusicPlayerProvider,
    useMusicPlayerContext,
} from "@features/MusicPlayer/stores/MusicPlayerContext";
import VolumeControls from "@features/MusicPlayer/VolumeControls";

const MusicPlayerContent = () => {
    const { playerRef, playbackPaused } = useMusicPlayerContext();

    return (
        <article
            className={
                "border-t-base-content/25 bg-base-100 fixed bottom-2 left-2 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg select-none"
            }
        >
            <div className={"hidden"} ref={playerRef}></div>

            {playbackPaused ? <PlayButton /> : <PauseButton />}

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
