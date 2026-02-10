import FocusContainer from "@/features/settings/timer/FocusContainer.tsx";
import useHandleSave from "@/features/settings/timer/hooks/useHandleSave.ts";
import useValidation from "@/features/settings/timer/hooks/useValidation.ts";
import LongBreakContainer from "@/features/settings/timer/LongBreakContainer.tsx";
import ShortBreakContainer from "@/features/settings/timer/ShortBreakContainer.tsx";
import TimerSettingsProvider from "@/features/settings/timer/stores/Provider.tsx";

const TimerSettingsContent = () => {
  const { hasUnsavedChanges } = useValidation();
  const { handleSave } = useHandleSave();

  return (
    <section className={"size-full h-full"}>
      <header>
        <h1 className={"text-primary mb-4 text-lg font-bold"}>
          Countdown Timer Settings
        </h1>
      </header>

      <div className={"mb-8 flex flex-col gap-4"}>
        <FocusContainer />
        <ShortBreakContainer />
        <LongBreakContainer />
      </div>

      <button
        type={"button"}
        className={"btn btn-primary"}
        onClick={handleSave}
        disabled={!hasUnsavedChanges}
      >
        Save changes
      </button>

      {hasUnsavedChanges && (
        <p className={"mt-2 text-sm text-yellow-600"}>
          ⚠️ You have unsaved changes
        </p>
      )}

      <p className={"mt-4 text-xs text-gray-500"}>
        Note: Timer will automatically update to new durations when it's not
        running.
      </p>
    </section>
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
