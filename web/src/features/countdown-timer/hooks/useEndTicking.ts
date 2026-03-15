import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { playSound, stopSound } from "@/utils/sound";
import { useCallback } from "react";

const useEndTicking = () => {
  const { timerTickingSoundEffectRef, isEndTickingRef } = useCountdownContext();

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

  const stopEndTicking = useCallback((): void => {
    if (!isEndTickingRef.current) return;

    isEndTickingRef.current = false;
    stopSound(timerTickingSoundEffectRef.current);
  }, [isEndTickingRef, timerTickingSoundEffectRef]);

  return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
