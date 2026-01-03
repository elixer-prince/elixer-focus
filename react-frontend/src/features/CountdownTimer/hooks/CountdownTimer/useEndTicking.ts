import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext";
import { playSound, stopSound } from "@utils/sound";
import { useCallback } from "react";

const useEndTicking = () => {
    const { timerTickingSoundEffect, isEndTicking } =
        useCountdownTimerContext();

    const startEndTicking = useCallback(() => {
        // Don't start if already ticking
        if (isEndTicking.current) {
            console.log("Already ticking, skipping");
            return;
        }

        isEndTicking.current = true;

        const audio = timerTickingSoundEffect.current;

        if (!audio) return;

        // Ensure no looping
        audio.loop = false;

        console.log("Starting end ticking");
        playSound(audio);
    }, [timerTickingSoundEffect, isEndTicking]);

    const stopEndTicking = useCallback(() => {
        console.log('Stop end ticking called...');

        // If there is a timer tickingSoundEffect
        if (timerTickingSoundEffect.current) {
            // Capture it as a local variable
            const audio = timerTickingSoundEffect.current;

            if (isEndTicking.current) {
                console.log("Stopping end ticking");
                isEndTicking.current = false;
                stopSound(audio);
            }
        }
    }, [timerTickingSoundEffect, isEndTicking]);

    return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
