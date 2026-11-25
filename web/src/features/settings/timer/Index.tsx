import { Button } from "@/components/ui";
import { dispatchTimerCommand } from "@/features/countdown-timer/services/timer-coordinator";
import { useAttributeSessionOverrun } from "@/features/countdown-timer/stores/session-store";
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
  const attributeSessionOverrun = useAttributeSessionOverrun();
  useTimerSettings();

  return (
    <section className={"size-full"}>
      <header className={"mb-8"}>
        <h1 className={"text-primary mb-1 text-xl font-bold"}>
          Timer Settings
        </h1>
        <p className={"text-base-content/60 text-sm"}>
          Configure session durations and choose how many focus sessions happen
          before a long break. Duration changes apply when the timer is idle.
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

      <section className="card bg-base-200 mb-8">
        <div className="card-body p-5">
          <h2 className="card-title text-base">Session overrun</h2>
          <p className="text-base-content/50 text-sm">
            Choose whether time after a session ends is tracked as overrun or
            idle time while reflection is open.
          </p>
          <label className="label mt-2 cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={attributeSessionOverrun}
              onChange={(event) =>
                dispatchTimerCommand({
                  type: "set-overrun-attribution",
                  enabled: event.target.checked,
                })
              }
            />
            <span className="label-text">Track overrun time</span>
          </label>
        </div>
      </section>

      <div className={"flex flex-col gap-3 sm:flex-row sm:items-center"}>
        <div className={"flex gap-3"}>
          <Button
            type="button"
            color="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            Save changes
          </Button>
          {hasUnsavedChanges && (
            <Button type="button" color="ghost" onClick={handleReset}>
              Reset
            </Button>
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
