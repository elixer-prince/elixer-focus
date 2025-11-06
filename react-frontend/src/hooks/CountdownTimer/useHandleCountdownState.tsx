import useStartCountdown from "./useStartCountdown.tsx";
import useStopCountdown from "./useStopCountdown.tsx";
import {playSound} from "../../util/functions/sound.ts";
import {useContext} from "react";
import {CountdownTimerContext} from "../../contexts/CountdownTimerContext.tsx";

const useHandleCountdownState = () => {
    const { startCountdown } = useStartCountdown();
    const { stopCountdown } = useStopCountdown();

    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext) {
        throw new Error();
    }

    const { timerRunning, timerOnClickSoundEffect, timerOffClickSoundEffect } =
        countdownTimerContext;

    const handleCountdownState = () => {
        if (timerRunning) {
            playSound(timerOffClickSoundEffect.current);
            stopCountdown();
        } else {
            playSound(timerOnClickSoundEffect.current);
            startCountdown();
        }
    };

    return { handleCountdownState };
};

export default useHandleCountdownState;
