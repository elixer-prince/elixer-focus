import { MusicPlayerContext } from "@features/MusicPlayer/hooks/MusicPlayerContext";
import { useContext } from "react";

const useMusicPlayerContext = () => {
    const musicPlayerContext = useContext(MusicPlayerContext);

    if (!musicPlayerContext) {
        throw new Error(
            "useMusicPlayerContext must be used within a MusicPlayerProvider",
        );
    }

    return musicPlayerContext;
};

export default useMusicPlayerContext;
