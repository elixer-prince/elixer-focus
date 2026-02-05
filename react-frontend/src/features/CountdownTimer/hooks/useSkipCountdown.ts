import useSessionSwitch from "@features/CountdownTimer/hooks/useSessionSwitch.ts";
import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { playSound } from "@utils/sound.ts";

const useSkipCountdown = (): {
    skipCountdown: () => void;
} => {
    const { switchSessionType } = useSessionSwitch();
    const { resetTimerSoundEffectRef } = useCountdownTimerContext();

    const skipCountdown = () => {
        if (confirm("Are you sure you want to skip the countdown?")) {
            playSound(resetTimerSoundEffectRef.current);
            switchSessionType();
        }
    };

    return { skipCountdown };
};

export default useSkipCountdown;
