import { useCountdownTimerContext } from "@/contexts/CountdownTimer.tsx";
import { playSound, stopSound } from "@/utils/sound";
import { useCallback } from "react";

const useEndTicking = () => {
  const { timerTickingSoundEffectRef, isEndTickingRef } =
    useCountdownTimerContext();

  // * Locked * //
  /**
   * Start the timer ticking sound effect if it is not already ticking.
   *
   * @returns {void}
   */
  const startEndTicking = useCallback((): void => {
    if (isEndTickingRef.current) return;

    isEndTickingRef.current = true;

    const sound = timerTickingSoundEffectRef.current;

    try {
      sound.loop = false;
    } catch (error) {
      console.error(`Error setting loop for sound: ${sound.src}`, error);
    }

    playSound(sound);
  }, [isEndTickingRef, timerTickingSoundEffectRef]);

  // * Locked * //
  /**
   * Stop the timer ticking sound effect if it hasn't started yet.
   *
   * @returns {void}
   */
  const stopEndTicking = useCallback((): void => {
    if (!isEndTickingRef.current) return;

    isEndTickingRef.current = false;
    stopSound(timerTickingSoundEffectRef.current);
  }, [isEndTickingRef, timerTickingSoundEffectRef]);

  return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
