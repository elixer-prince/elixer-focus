import PauseButton from "@features/MusicPlayer/components/PauseButton.tsx";
import {
    MusicPlayerProvider,
    useMusicPlayerContext,
} from "@features/MusicPlayer/stores/MusicPlayerContext.tsx";
import VolumeControls from "@features/MusicPlayer/components/VolumeControls.tsx";
import { musicPlayerStyles } from "@features/MusicPlayer/components/styles.ts";
import PlayButton from "@features/MusicPlayer/components/PlayButton.tsx";

const MusicPlayerContent = () => {
    const { playerRef, playbackPaused } = useMusicPlayerContext();

    return (
        <article className={musicPlayerStyles}>
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
