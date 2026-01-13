import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { playSound, stopSound } from "@utils/sound";
import { useCallback } from "react";

const useEndTicking = (): {
    startEndTicking: () => void;
    stopEndTicking: () => void;
} => {
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

    const stopEndTicking = () => {
        if (!isEndTicking.current) return;

        isEndTicking.current = false;
        stopSound(timerTickingSoundEffect.current);
    };

    return { startEndTicking, stopEndTicking };
};

export default useEndTicking;
