import type { MusicPlayerContextType } from "@/features/MusicPlayer/types";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const [showSlider, setShowSlider] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<any>(null);

  const contextValue: MusicPlayerContextType = useMemo(
    () => ({
      showSlider,
      playerRef,
      playerInstanceRef,
      setShowSlider,
    }),
    [showSlider, setShowSlider],
  );

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayerContext = () => {
  const musicPlayerContext = useContext(MusicPlayerContext);

  if (!musicPlayerContext) {
    throw new Error(
      "useMusicPlayerContext must be used within a MusicPlayerProvider",
    );
  }

  return musicPlayerContext;
};
