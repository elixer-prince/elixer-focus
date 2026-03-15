import MusicPlayerContext from "@/features/music-player/contexts/Context";
import { useContext } from "react";

const useMusicPlayerContext = () => {
  const context = useContext(MusicPlayerContext);

  if (!context) {
    throw new Error(
      "useMusicPlayerContext must be used within a MusicProvider!",
    );
  }

  return context;
};

export default useMusicPlayerContext;
