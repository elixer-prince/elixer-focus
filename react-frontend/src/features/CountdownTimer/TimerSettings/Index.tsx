// @features/CountdownTimer/TimerSettings/TimerSettings.tsx
import { TimerSettingsProvider } from "@features/CountdownTimer/TimerSettings/stores/TimerSettingsContext.tsx";
import useValidation from "@features/CountdownTimer/TimerSettings/hooks/useValidation.tsx";
import useHandleSave from "@features/CountdownTimer/TimerSettings/hooks/useHandleSave.tsx";
import FocusContainer from "@features/CountdownTimer/TimerSettings/FocusContainer.tsx";
import ShortBreakContainer from "@features/CountdownTimer/TimerSettings/ShortBreakContainer.tsx";
import LongBreakContainer from "@features/CountdownTimer/TimerSettings/LongBreakContainer.tsx";

const TimerSettingsContent = () => {
    const { hasUnsavedChanges } = useValidation();
    const { handleSave } = useHandleSave();

    return (
        <div className="size-full h-full">
            <FocusContainer />
            <ShortBreakContainer />
            <LongBreakContainer />

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

const TimerSettings = () => {
    return (
        <TimerSettingsProvider>
            <TimerSettingsContent />
        </TimerSettingsProvider>
    );
};

export default TimerSettings;
