import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext.tsx";
import { playSound, stopSound } from "@utils/sound.ts";
import { useCallback } from "react";

const useEndTicking = () => {
    const { timerTickingSoundEffect, isEndTicking } =
        useCountdownTimerContext();

    const startEndTicking = useCallback(() => {
        isEndTicking.current = true;

        const audio = timerTickingSoundEffect.current;

        if (!audio) return;

        playSound(audio);
    }, [timerTickingSoundEffect, isEndTicking]);

    const stopEndTicking = useCallback(() => {
        isEndTicking.current = false;

        // If there is a timer tickingSoundEffect
        if (timerTickingSoundEffect.current) {
            // Capture it as a local variable
            const audio = timerTickingSoundEffect.current;

            console.log(audio);

            if (isEndTicking.current) {
                isEndTicking.current = false;
                stopSound(audio);
            }
        }
    }, [timerTickingSoundEffect, isEndTicking]);

    return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
