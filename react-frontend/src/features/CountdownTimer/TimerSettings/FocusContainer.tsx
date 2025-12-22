import useValidation from "@features/CountdownTimer/TimerSettings/hooks/useValidation.tsx";
import useTimerSettingsContext from "@features/CountdownTimer/TimerSettings/hooks/useTimerSettingsContext.tsx";

const FocusContainer = () => {
    const { validateAndSet } = useValidation();
    const { draftFocus, setDraftFocus } = useTimerSettingsContext();

    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
                Focus Duration (minutes)
            </label>
            <input
                type="number"
                value={draftFocus}
                onChange={(e) => {
                    validateAndSet(e.target.value, setDraftFocus, 1);
                }}
                className="input input-primary"
                min={1}
                placeholder="25"
            />
            {draftFocus && Number(draftFocus) < 1 && (
                <p className="mt-1 text-sm text-red-500">
                    Must be at least 1 minute
                </p>
            )}
        </div>
    );
};

export default FocusContainer;
