import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { playSound, stopSound } from "@utils/sound.ts";
import { useCallback } from "react";

const useEndTicking = (): {
    startEndTicking: () => void;
    stopEndTicking: () => void;
} => {
    const { timerTickingSoundEffectRef, isEndTickingRef } =
        useCountdownTimerContext();

    const startEndTicking = useCallback(() => {
        // Don't start if already ticking
        if (isEndTickingRef.current) {
            console.log("Already ticking, skipping");
            return;
        }

        isEndTickingRef.current = true;

        const audio = timerTickingSoundEffectRef.current;

        if (!audio) return;

        // Ensure no looping
        audio.loop = false;

        console.log("Starting end ticking");
        playSound(audio);
    }, [timerTickingSoundEffectRef, isEndTickingRef]);

    const stopEndTicking = () => {
        if (!isEndTickingRef.current) return;

        isEndTickingRef.current = false;
        stopSound(timerTickingSoundEffectRef.current);
    };

    return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
