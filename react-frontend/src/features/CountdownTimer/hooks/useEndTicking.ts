import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { playSound, stopSound } from "@/utils/sound.ts";
import { useCallback } from "react";

const useEndTicking = (): {
  startEndTicking: () => void;
  stopEndTicking: () => void;
} => {
  const { timerTickingSoundEffectRef, isEndTickingRef } =
    useCountdownTimerContext();

  /**
   * Start the timer ticking sound effect if it is not already ticking.
   *
   * @/returns {void}
   */
  const startEndTicking = useCallback((): void => {
    if (isEndTickingRef.current) return;

    // Timer isn't ticking so we set it to tick
    isEndTickingRef.current = true;

    const audio = timerTickingSoundEffectRef.current;

    if (!audio) return;

    // Ensure no looping
    audio.loop = false;

    playSound(audio);
  }, [timerTickingSoundEffectRef, isEndTickingRef]);

  /**
   * Stop the timer ticking sound effect if it hasn't started yet.
   *
   * @/returns {void}
   */
  const stopEndTicking = (): void => {
    if (!isEndTickingRef.current) return;

    isEndTickingRef.current = false;
    stopSound(timerTickingSoundEffectRef.current);
  };

  return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
