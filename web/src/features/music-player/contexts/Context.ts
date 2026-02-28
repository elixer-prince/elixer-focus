import type { MusicPlayerContextType } from "@/features/music-player/types/context";
import { createContext } from "react";

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export default MusicPlayerContext;
