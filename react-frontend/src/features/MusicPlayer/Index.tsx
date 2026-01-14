import {
    MusicPlayerProvider,
    useMusicPlayerContext,
} from "@features/MusicPlayer/stores/MusicPlayerContext";
import { pauseVideo, playVideo } from "@features/MusicPlayer/utils/controls";

const MusicPlayerContent = () => {
    const {
        playerInstanceRef,
        playerRef,
        playbackPaused,
        songs,
        setChosenSongIndex,
        setPlaybackPaused,
    } = useMusicPlayerContext();

    return (
        <div
            className={
                "border-t-base-content bg-base-100 fixed right-0 bottom-0 left-0 flex h-(--music-player-height) items-center gap-4 border-t p-4"
            }
        >
            <div className={"hidden"} ref={playerRef}></div>

            {playbackPaused ? (
                <div
                    className={"cursor-pointer"}
                    onClick={() => {
                        pauseVideo(playerInstanceRef.current);
                        setPlaybackPaused(false);
                    }}
                >
                    pause
                </div>
            ) : (
                <div
                    className={"cursor-pointer"}
                    onClick={() => {
                        playVideo(playerInstanceRef.current);
                        setPlaybackPaused(true);
                    }}
                >
                    play
                </div>
            )}

            <div>player track</div>
            <div>volume slider</div>

            <div>
                {songs.map(({ id, title }) => (
                    <div
                        key={id}
                        onClick={() => {
                            setChosenSongIndex(id);
                            console.log(id);
                        }}
                    >
                        {title}
                    </div>
                ))}
            </div>
        </div>
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
