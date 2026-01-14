import MusicSwitcher from "@features/MusicPlayer/MusicSwitcher";
import {
    MusicPlayerProvider,
    useMusicPlayerContext,
} from "@features/MusicPlayer/stores/MusicPlayerContext";
import { pauseVideo, playVideo } from "@features/MusicPlayer/utils/controls";
import type { ChangeEvent } from "react";
import { FaVolumeUp } from "react-icons/fa";
import { FaPause, FaPlay } from "react-icons/fa6";

const MusicPlayerContent = () => {
    const {
        playerInstanceRef,
        playerRef,
        playbackPaused,
        volume,
        setVolume,
        setPlaybackPaused,
        showSlider,
        setShowSlider,
    } = useMusicPlayerContext();

    const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(event.target.value);
        setVolume(newVolume);
        playerInstanceRef.current?.setVolume(newVolume);
    };

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

            <button onClick={() => setShowSlider(!showSlider)}>
                <FaVolumeUp size={20} className={"cursor-pointer"} />
            </button>

            {showSlider && (
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="range range-xs range-primary rounded-full"
                />
            )}

            <MusicSwitcher />
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
