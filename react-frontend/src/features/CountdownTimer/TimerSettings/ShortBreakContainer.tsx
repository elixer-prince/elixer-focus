import useValidation from "@features/CountdownTimer/TimerSettings/hooks/useValidation";
import { useTimerSettingsContext } from "@features/CountdownTimer/TimerSettings/stores/TimerSettingsContext";

const ShortBreakContainer = () => {
    const { validateAndSet } = useValidation();
    const { draftShortBreak, setDraftShortBreak } = useTimerSettingsContext();

    return (
        <div>
            <label className="mb-2 block text-sm font-medium">
                Short Break (minutes)
            </label>
            <input
                type="number"
                value={draftShortBreak}
                onChange={(e) => {
                    validateAndSet(e.target.value, setDraftShortBreak, 1);
                }}
                className="input input-primary"
                min={1}
                placeholder="5"
            />
            {draftShortBreak && Number(draftShortBreak) < 1 && (
                <p className="mt-1 text-sm text-red-500">
                    Must be at least 1 minute
                </p>
            )}
        </div>
    );
};

export default ShortBreakContainer;
