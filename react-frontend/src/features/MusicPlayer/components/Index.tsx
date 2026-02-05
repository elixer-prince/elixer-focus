import PauseButton from "@features/MusicPlayer/components/PauseButton.tsx";
import PlayButton from "@features/MusicPlayer/components/PlayButton.tsx";
import VolumeControls from "@features/MusicPlayer/components/VolumeControls.tsx";
import {
    MusicPlayerProvider,
    useMusicPlayerContext,
} from "@features/MusicPlayer/stores/MusicPlayerContext.tsx";

const MusicPlayerContent = () => {
    const { playerRef, playbackPaused } = useMusicPlayerContext();

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
