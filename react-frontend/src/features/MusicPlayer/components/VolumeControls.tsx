import { useMusicPlayerContext } from "@features/MusicPlayer/stores/MusicPlayerContext.tsx";
import { FaVolumeUp } from "react-icons/fa";

const VolumeControls = () => {
    const { volume, showSlider, setVolume, setShowSlider, playerInstanceRef } =
        useMusicPlayerContext();

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(event.target.value);
        setVolume(newVolume);
        playerInstanceRef.current?.setVolume(newVolume);
    };

    return (
        <div className="flex items-center gap-4">
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
        </div>
    );
};

export default VolumeControls;
