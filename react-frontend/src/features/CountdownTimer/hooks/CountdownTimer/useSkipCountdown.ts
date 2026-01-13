import useSessionSwitch from "@features/CountdownTimer/hooks/CountdownSession/useSessionSwitch";
import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { playSound } from "@utils/sound";

const useSkipCountdown = (): {
    skipCountdown: () => void;
} => {
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
