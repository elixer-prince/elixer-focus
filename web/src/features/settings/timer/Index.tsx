import FocusContainer from "@/features/settings/timer/FocusContainer";
import useHandleReset from "@/features/settings/timer/hooks/useHandleReset";
import useHandleSave from "@/features/settings/timer/hooks/useHandleSave";
import useTimerSettings from "@/features/settings/timer/hooks/useTimerSettings";
import useValidation from "@/features/settings/timer/hooks/useValidation";
import LongBreakContainer from "@/features/settings/timer/LongBreakContainer";
import ShortBreakContainer from "@/features/settings/timer/ShortBreakContainer";
import TimerSettingsProvider from "@/features/settings/timer/stores/Provider";

const TimerSettingsContent = () => {
  const { hasUnsavedChanges } = useValidation();
  const { handleSave } = useHandleSave();
  const { handleReset } = useHandleReset();
  useTimerSettings();

  return (
    <section className={"size-full"}>
      <header className={"mb-8"}>
        <h1 className={"text-primary mb-1 text-xl font-bold"}>
          Timer Settings
        </h1>
        <p className={"text-base-content/60 text-sm"}>
          Configure the duration for each session type. Changes apply when the
          timer is not running.
        </p>
      </header>

      <div className={"mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"}>
        <div className={"card bg-base-200"}>
          <div className={"card-body p-5"}>
            <h2 className={"card-title text-base"}>Focus</h2>
            <p className={"text-base-content/50 mb-2 text-xs"}>
              Duration for focus sessions
            </p>
            <FocusContainer />
          </div>
        </div>

        <div className={"card bg-base-200"}>
          <div className={"card-body p-5"}>
            <h2 className={"card-title text-base"}>Short Break</h2>
            <p className={"text-base-content/50 mb-2 text-xs"}>
              Duration between focus sessions
            </p>
            <ShortBreakContainer />
          </div>
        </div>

        <div className={"card bg-base-200"}>
          <div className={"card-body p-5"}>
            <h2 className={"card-title text-base"}>Long Break</h2>
            <p className={"text-base-content/50 mb-2 text-xs"}>
              Extended break after completing a cycle
            </p>
            <LongBreakContainer />
          </div>
        </div>
      </div>

      <div className={"flex flex-col gap-3 sm:flex-row sm:items-center"}>
        <div className={"flex gap-3"}>
          <button
            type={"button"}
            className={"btn btn-primary"}
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            Save changes
          </button>
          {hasUnsavedChanges && (
            <button
              type={"button"}
              className={"btn btn-ghost"}
              onClick={handleReset}
            >
              Reset
            </button>
          )}
        </div>
        {hasUnsavedChanges && (
          <p className={"text-warning text-sm"}>You have unsaved changes</p>
        )}
      </div>
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
