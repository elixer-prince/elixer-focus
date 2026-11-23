import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { useMusicPaused } from "@/features/music-player/stores/store";
import { useEffect, useState } from "react";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const ProgressDisplay = () => {
  const { playerInstanceRef } = useMusicPlayerContext();
  const musicPaused = useMusicPaused();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const player = playerInstanceRef.current;
    if (!player) return;

    // Read initial values
    const dur = player.getDuration();
    if (dur > 0) {
      setDuration(dur);
    }

    if (musicPaused) return;

    const interval = setInterval(() => {
      const p = playerInstanceRef.current;
      if (!p) return;

      const ct = p.getCurrentTime();
      const d = p.getDuration();

      if (ct >= 0) {
        setCurrentTime(ct);
      }
      if (d > 0) {
        setDuration(d);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [musicPaused, playerInstanceRef]);

  // Update time display when unpaused so it reflects the current position
  useEffect(() => {
    if (!musicPaused && playerInstanceRef.current) {
      const ct = playerInstanceRef.current.getCurrentTime();
      if (ct >= 0) {
        setCurrentTime(ct);
      }
    }
  }, [musicPaused, playerInstanceRef]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex w-24 flex-col gap-1">
      <div
        className="bg-base-300 h-1 w-full cursor-pointer overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-label="Song progress"
      >
        <div
          className="bg-primary h-full transition-all duration-500 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-base-content/50 flex justify-between text-[10px]">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressDisplay;
