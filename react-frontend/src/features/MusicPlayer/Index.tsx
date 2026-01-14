import {
    MusicPlayerProvider,
    useMusicPlayerContext,
} from "@features/MusicPlayer/stores/MusicPlayerContext";
import { pauseVideo, playVideo } from "@features/MusicPlayer/utils/controls";
import { FaPause, FaPlay } from "react-icons/fa6";

const MusicPlayerContent = () => {
    const {
        playerInstanceRef,
        playerRef,
        playbackPaused,
        chosenSongId,
        songs,
        setChosenSongId,
        setPlaybackPaused,
    } = useMusicPlayerContext();

    return (
        <div
            className={
                "border-t-base-content/25 bg-base-100 fixed bottom-2 left-2 flex h-(--music-player-height) items-center gap-4 rounded-xl border-t-2 p-4 shadow-lg select-none"
            }
        >
            <div className={"hidden"} ref={playerRef}></div>

            {playbackPaused ? (
                <div
                    className={
                        "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
                    }
                    onClick={() => {
                        pauseVideo(playerInstanceRef.current);
                        setPlaybackPaused(false);
                    }}
                >
                    <FaPause size={16} />
                </div>
            ) : (
                <div
                    className={
                        "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
                    }
                    onClick={() => {
                        playVideo(playerInstanceRef.current);
                        setPlaybackPaused(true);
                    }}
                >
                    <FaPlay size={16} />
                </div>
            )}

            <div>player track</div>
            <div>volume slider</div>

            <div className="dropdown dropdown-top dropdown-center">
                <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-soft btn-ghost"
                >
                    Switch Song
                </div>

                <ul
                    tabIndex={-1}
                    className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                >
                    {songs.map(({ id, title }) => (
                        <label key={id}>
                            <input
                                name="session-type"
                                type="radio"
                                className="accent-primary"
                                onChange={() => setChosenSongId(id)}
                                checked={chosenSongId === id}
                            />
                            {title}
                        </label>
                    ))}
                </ul>
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
