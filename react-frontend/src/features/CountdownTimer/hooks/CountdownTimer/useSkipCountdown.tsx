import useSessionSwitch from "@features/CountdownTimer/hooks/CountdownSession/useSessionSwitch.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext.tsx";
import { playSound } from "@utils/sound.ts";

const useSkipCountdown = () => {
    const { switchSessionType } = useSessionSwitch();
    const { resetTimerSoundEffect } = useCountdownTimerContext();

    const skipCountdown = () => {
        if (confirm("Are you sure you want to skip the countdown?")) {
            playSound(resetTimerSoundEffect.current);
            switchSessionType();
        }
    };

    return { skipCountdown };
};

export default useSkipCountdown;
