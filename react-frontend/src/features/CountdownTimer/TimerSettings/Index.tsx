// @features/CountdownTimer/TimerSettings/TimerSettings.tsx
import useTimerSettings from "@features/CountdownTimer/TimerSettings/hooks/useTimerSettings.tsx";
import useAutoSyncTimer from "@features/CountdownTimer/hooks/useAutoSyncTimer.tsx";

const TimerSettings = () => {
    // Enable auto-sync between timer and session durations
    useAutoSyncTimer();

    const {
        draftFocus,
        draftShortBreak,
        validateAndSet,
        draftLongBreak,
        hasUnsavedChanges,
        handleSave,
        setDraftFocus,
        setDraftShortBreak,
        setDraftLongBreak,
    } = useTimerSettings();

    return (
        <div className="size-full h-full">
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

            <div className="mb-4">
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

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                    Long Break (minutes)
                </label>
                <input
                    type="number"
                    value={draftLongBreak}
                    onChange={(e) => {
                        validateAndSet(e.target.value, setDraftLongBreak, 5);
                    }}
                    className="input input-primary"
                    min={5}
                    placeholder="15"
                />
                {draftLongBreak && Number(draftLongBreak) < 5 && (
                    <p className="mt-1 text-sm text-red-500">
                        Must be at least 5 minutes
                    </p>
                )}
            </div>

            <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
            >
                Save changes
            </button>

            {hasUnsavedChanges && (
                <p className="mt-2 text-sm text-yellow-600">
                    ⚠️ You have unsaved changes
                </p>
            )}

            <p className="mt-4 text-xs text-gray-500">
                Note: Timer will automatically update to new durations when it's
                not running.
            </p>
        </div>
    );
};

export default TimerSettings;
