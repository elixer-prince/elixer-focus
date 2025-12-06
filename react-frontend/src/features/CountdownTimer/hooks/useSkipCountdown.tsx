import UseCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionSwitch from "@features/CountdownTimer/hooks/useSessionSwitch.tsx";
import { playSound } from "@utils/sound.ts";

const useSkipCountdown = () => {
    const { switchSessionType } = useSessionSwitch();
    const { resetTimerSoundEffect } = UseCountdownTimerContext();

    const skipCountdown = () => {
        if (confirm("Are you sure you want to skip the countdown?")) {
            playSound(resetTimerSoundEffect.current);
            switchSessionType();
        }
    };

    return { skipCountdown };
};

export default useSkipCountdown;
