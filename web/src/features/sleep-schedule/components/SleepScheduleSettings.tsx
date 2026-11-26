import { dispatchSleepScheduleCommand } from "@/features/sleep-schedule/services/sleep-schedule-coordinator";
import { formatLocalDate } from "@/features/calendar/utils/calendar-date";
import {
  formatSleepDuration,
  getDailySleepPlan,
  isValidClockValue,
  isValidSleepDuration,
  isValidSleepScheduleSettings,
} from "@/features/sleep-schedule/utils/sleep-schedule";
import type { SleepScheduleSettings as SleepSettings } from "@/features/sleep-schedule/types/sleep-schedule";
import { useSleepMigrationRecovery, useSleepScheduleSettings } from "@/stores";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";

const getClockValue = (value: unknown) =>
  typeof value === "string" ? value : "";

const getDurationHoursValue = (minutes: unknown) =>
  typeof minutes === "number" ? String(minutes / 60) : "";

const getReasonLabel = (reason: string) => {
  switch (reason) {
    case "unmatchedWake":
      return "No earlier bedtime was available for this wake time.";
    case "duplicateSleepDate":
      return "Another bedtime already exists for this local date.";
    default:
      return "This older sleep event contained invalid data.";
  }
};

const SleepScheduleSettings = () => {
  const persistedSettings = useSleepScheduleSettings();
  const settings: Partial<SleepSettings> =
    persistedSettings && typeof persistedSettings === "object"
      ? persistedSettings
      : {};
  const recoveryEntries = useSleepMigrationRecovery();
  const [wakeTime, setWakeTime] = useState(getClockValue(settings.wakeTime));
  const [targetDurationHours, setTargetDurationHours] = useState(
    getDurationHoursValue(settings.targetSleepDurationMinutes),
  );
  const [bedTimeOverride, setBedTimeOverride] = useState(
    getClockValue(settings.bedTimeOverride),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRecoverySaving, setIsRecoverySaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [confirmingScheduleClear, setConfirmingScheduleClear] = useState(false);
  const [confirmingRecoveryId, setConfirmingRecoveryId] = useState<
    string | null
  >(null);
  const [confirmingRecoveryClear, setConfirmingRecoveryClear] = useState(false);
  const recoveryToggleRef = useRef<HTMLButtonElement>(null);
  const recoveryClearConfirmationRef = useRef<HTMLButtonElement>(null);
  const recoveryEntryConfirmationRef = useRef<HTMLButtonElement>(null);
  const scheduleClearTriggerRef = useRef<HTMLButtonElement>(null);
  const scheduleClearConfirmationRef = useRef<HTMLButtonElement>(null);
  const returnFocusToScheduleClearRef = useRef(false);
  const wakeTimeRef = useRef<HTMLInputElement>(null);
  const targetDurationRef = useRef<HTMLInputElement>(null);
  const bedTimeOverrideRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWakeTime(getClockValue(settings.wakeTime));
    setTargetDurationHours(
      getDurationHoursValue(settings.targetSleepDurationMinutes),
    );
    setBedTimeOverride(getClockValue(settings.bedTimeOverride));
  }, [
    settings.wakeTime,
    settings.targetSleepDurationMinutes,
    settings.bedTimeOverride,
  ]);

  useEffect(() => {
    if (confirmingRecoveryClear) recoveryClearConfirmationRef.current?.focus();
  }, [confirmingRecoveryClear]);

  useEffect(() => {
    if (confirmingRecoveryId) recoveryEntryConfirmationRef.current?.focus();
  }, [confirmingRecoveryId]);

  useEffect(() => {
    if (confirmingScheduleClear) {
      scheduleClearConfirmationRef.current?.focus();
    } else if (returnFocusToScheduleClearRef.current) {
      scheduleClearTriggerRef.current?.focus();
      returnFocusToScheduleClearRef.current = false;
    }
  }, [confirmingScheduleClear]);

  const targetDurationMinutes = Number(targetDurationHours) * 60;
  const draftSettings: SleepSettings = {
    wakeTime: wakeTime || null,
    targetSleepDurationMinutes: targetDurationMinutes,
    bedTimeOverride: bedTimeOverride || null,
  };
  const draftIsValid = isValidSleepScheduleSettings(draftSettings);
  const wakeTimeInvalid = Boolean(wakeTime && !isValidClockValue(wakeTime));
  const targetDurationInvalid = !isValidSleepDuration(targetDurationMinutes);
  const bedTimeOverrideInvalid = Boolean(
    bedTimeOverride && !isValidClockValue(bedTimeOverride),
  );
  const savedSettingsAreValid = isValidSleepScheduleSettings(persistedSettings);
  const hasSavedSchedule =
    typeof settings.wakeTime === "string" ||
    typeof settings.bedTimeOverride === "string";
  const today = formatLocalDate(new Date());
  const preview = draftIsValid ? getDailySleepPlan(draftSettings, today) : null;
  const overrideDifference = preview
    ? draftSettings.targetSleepDurationMinutes -
      preview.plannedSleepDurationMinutes
    : 0;
  const overrideWarning =
    overrideDifference === 0
      ? "Manual override is active. Planned duration matches your target."
      : `Manual override is active. Planned duration is ${formatSleepDuration(Math.abs(overrideDifference))} ${overrideDifference > 0 ? "shorter" : "longer"} than your target.`;

  const saveSettings = async (nextSettings: SleepSettings) => {
    setIsSaving(true);
    setError(null);
    setFeedback("");
    try {
      const result = await dispatchSleepScheduleCommand({
        type: "save-settings",
        settings: nextSettings,
      });
      if (!result.success) {
        setError(result.error ?? "Unable to save the sleep schedule.");
        return;
      }
      setFeedback("Sleep schedule saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftIsValid) {
      setError(
        "Review the wake time, bedtime override, and target duration. The target must be from 1 to 16 hours in 0.25 hour steps.",
      );
      const firstInvalidInput = wakeTimeInvalid
        ? wakeTimeRef.current
        : targetDurationInvalid
          ? targetDurationRef.current
          : bedTimeOverrideInvalid
            ? bedTimeOverrideRef.current
            : wakeTimeRef.current;
      firstInvalidInput?.focus();
      return;
    }
    void saveSettings(draftSettings);
  };

  const handleClearSchedule = async () => {
    setIsSaving(true);
    setError(null);
    setFeedback("");
    try {
      const result = await dispatchSleepScheduleCommand({
        type: "clear-schedule",
      });
      if (!result.success) {
        setError(result.error ?? "Unable to clear the sleep schedule.");
        return;
      }
      returnFocusToScheduleClearRef.current = true;
      setConfirmingScheduleClear(false);
      setFeedback("Sleep schedule cleared. Actual records were kept.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetBedTime = () => {
    const automaticSettings = { ...draftSettings, bedTimeOverride: null };
    if (!isValidSleepScheduleSettings(automaticSettings)) {
      setError(
        "Repair the wake time and target duration before resetting bedtime.",
      );
      return;
    }
    void saveSettings(automaticSettings);
  };

  const exportRecovery = () => {
    const file = new Blob([JSON.stringify(recoveryEntries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sleep-schedule-recovery.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const clearRecovery = async () => {
    setIsRecoverySaving(true);
    setRecoveryError(null);
    try {
      const result = await dispatchSleepScheduleCommand({
        type: "clear-recovery",
      });
      if (!result.success) {
        setRecoveryError(
          result.error ?? "Unable to clear the recovery archive.",
        );
        return;
      }
      setConfirmingRecoveryClear(false);
      setFeedback("Recovery archive cleared.");
      recoveryToggleRef.current?.focus();
    } finally {
      setIsRecoverySaving(false);
    }
  };

  const removeRecoveryEntry = async (recoveryId: string) => {
    setIsRecoverySaving(true);
    setRecoveryError(null);
    try {
      const result = await dispatchSleepScheduleCommand({
        type: "remove-recovery",
        recoveryId,
      });
      if (!result.success) {
        setRecoveryError(
          result.error ?? "Unable to remove the archived event.",
        );
        return;
      }
      setConfirmingRecoveryId(null);
      setFeedback("Archived event removed.");
      recoveryToggleRef.current?.focus();
    } finally {
      setIsRecoverySaving(false);
    }
  };

  return (
    <section
      aria-labelledby="sleep-schedule-title"
      className="card bg-base-200 mt-6 max-w-3xl"
    >
      <div className="card-body p-5">
        <header>
          <h2 className="card-title text-base" id="sleep-schedule-title">
            Sleep schedule
          </h2>
          <p className="text-base-content/70 mt-1 text-sm">
            Set a steady wake time and plan sleep around your local day.
          </p>
        </header>

        {!savedSettingsAreValid && (
          <p className="alert alert-error mt-3" role="alert">
            Your saved sleep schedule needs repair. Review the fields and save a
            valid schedule. Your saved values and actual records have not been
            replaced.
          </p>
        )}

        <form
          className="mt-4 space-y-4"
          aria-busy={isSaving}
          onSubmit={handleSave}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              ref={wakeTimeRef}
              label="Usual wake time"
              name="wakeTime"
              autoComplete="off"
              type="time"
              step={60}
              value={wakeTime}
              error={wakeTimeInvalid}
              className="min-h-12 w-full"
              aria-describedby={error ? "sleep-schedule-error" : undefined}
              onChange={(event) => {
                setWakeTime(event.currentTarget.value);
                setError(null);
              }}
            />
            <Input
              ref={targetDurationRef}
              label="Target sleep duration (hours)"
              name="targetSleepDurationHours"
              autoComplete="off"
              type="number"
              min={1}
              max={16}
              step={0.25}
              value={targetDurationHours}
              error={targetDurationInvalid}
              helperText="Choose 1 to 16 hours, in quarter hour increments."
              className="min-h-12 w-full"
              aria-describedby={error ? "sleep-schedule-error" : undefined}
              onChange={(event) => {
                setTargetDurationHours(event.currentTarget.value);
                setError(null);
              }}
            />
          </div>

          {preview && (
            <div className="bg-base-100 rounded-xl p-4" aria-live="polite">
              <p className="font-semibold">
                Planned bedtime{" "}
                {new Intl.DateTimeFormat(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                }).format(preview.bedAt)}
              </p>
              <p className="text-base-content/70 mt-1 text-sm">
                Planned sleep:{" "}
                {formatSleepDuration(preview.plannedSleepDurationMinutes)}
                {preview.hasBedTimeOverride
                  ? ` · ${overrideWarning}`
                  : `, based on a ${formatSleepDuration(draftSettings.targetSleepDurationMinutes)} target.`}
              </p>
            </div>
          )}

          <div className="w-full max-w-sm">
            <Input
              ref={bedTimeOverrideRef}
              label="Bedtime override"
              name="bedTimeOverride"
              autoComplete="off"
              type="time"
              step={60}
              value={bedTimeOverride}
              error={bedTimeOverrideInvalid}
              helperText="Leave blank to calculate bedtime from your target duration."
              className="min-h-12 w-full"
              aria-describedby={error ? "sleep-schedule-error" : undefined}
              onChange={(event) => {
                setBedTimeOverride(event.currentTarget.value);
                setError(null);
              }}
            />
          </div>

          {error && (
            <p
              className="text-error text-sm"
              id="sleep-schedule-error"
              role="alert"
            >
              {error}
            </p>
          )}
          {feedback && (
            <p
              className="text-success text-sm"
              role="status"
              aria-live="polite"
            >
              {feedback}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11" type="submit" loading={isSaving}>
              <span
                role={isSaving ? "status" : undefined}
                aria-live={isSaving ? "polite" : undefined}
              >
                {isSaving ? "Saving…" : "Save schedule"}
              </span>
            </Button>
            <Button
              color="outline"
              className="min-h-11"
              type="button"
              disabled={isSaving || !bedTimeOverride}
              onClick={handleResetBedTime}
            >
              Reset to automatic bedtime
            </Button>
            {confirmingScheduleClear ? (
              <div
                className="border-error/30 bg-error/5 flex flex-wrap items-center gap-2 rounded-xl border p-3"
                role="group"
                aria-label="Confirm clearing the sleep schedule"
              >
                <span className="text-sm">
                  Actual sleep records will be kept.
                </span>
                <Button
                  ref={scheduleClearConfirmationRef}
                  color="neutral"
                  className="min-h-11"
                  type="button"
                  loading={isSaving}
                  onClick={() => void handleClearSchedule()}
                >
                  Clear schedule
                </Button>
                <Button
                  color="ghost"
                  className="min-h-11"
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    returnFocusToScheduleClearRef.current = true;
                    setConfirmingScheduleClear(false);
                  }}
                >
                  Keep schedule
                </Button>
              </div>
            ) : (
              <Button
                ref={scheduleClearTriggerRef}
                color="ghost"
                className="min-h-11"
                type="button"
                disabled={isSaving || !hasSavedSchedule}
                onClick={() => setConfirmingScheduleClear(true)}
              >
                Clear schedule
              </Button>
            )}
          </div>
        </form>

        <section
          aria-labelledby="sleep-recovery-title"
          aria-busy={isRecoverySaving}
          className="border-base-content/10 mt-5 border-t pt-4"
        >
          <h3 className="text-base font-semibold">
            <button
              ref={recoveryToggleRef}
              className="btn btn-ghost min-h-11 justify-between px-0 text-left"
              type="button"
              id="sleep-recovery-title"
              aria-expanded={recoveryOpen}
              aria-controls="sleep-recovery-content"
              onClick={() => setRecoveryOpen((open) => !open)}
            >
              <span>Legacy record recovery ({recoveryEntries.length})</span>
              <span aria-hidden="true">{recoveryOpen ? "−" : "+"}</span>
            </button>
          </h3>
          <div
            id="sleep-recovery-content"
            className="space-y-3"
            hidden={!recoveryOpen}
          >
            {recoveryOpen && (
              <>
                {recoveryError && (
                  <p
                    className="text-error text-sm"
                    id="sleep-recovery-error"
                    role="alert"
                  >
                    {recoveryError}
                  </p>
                )}
                {isRecoverySaving && (
                  <p className="text-base-content/70 text-sm" role="status">
                    Updating recovery archive…
                  </p>
                )}
                {recoveryEntries.length ? (
                  <>
                    <p className="text-base-content/70 text-sm">
                      These older records could not be matched safely. Export
                      them before deleting if you want to keep a copy.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        color="outline"
                        className="min-h-11"
                        type="button"
                        onClick={exportRecovery}
                      >
                        Export as JSON
                      </Button>
                      {confirmingRecoveryClear ? (
                        <div
                          className="border-error/30 bg-error/5 flex flex-wrap items-center gap-2 rounded-xl border p-3"
                          role="group"
                          aria-label="Confirm deleting recovery archive"
                        >
                          <span className="text-sm">
                            Delete all archived events?
                          </span>
                          <Button
                            ref={recoveryClearConfirmationRef}
                            color="neutral"
                            className="min-h-11"
                            type="button"
                            loading={isRecoverySaving}
                            onClick={() => void clearRecovery()}
                          >
                            Delete archive
                          </Button>
                          <Button
                            color="ghost"
                            className="min-h-11"
                            type="button"
                            onClick={() => {
                              setConfirmingRecoveryClear(false);
                              recoveryToggleRef.current?.focus();
                            }}
                          >
                            Keep archive
                          </Button>
                        </div>
                      ) : (
                        <Button
                          color="ghost"
                          className="min-h-11"
                          type="button"
                          disabled={isRecoverySaving}
                          onClick={() => setConfirmingRecoveryClear(true)}
                        >
                          Delete recovery archive
                        </Button>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {recoveryEntries.map((entry) => (
                        <li
                          key={entry.id}
                          className="bg-base-100 rounded-xl p-3"
                        >
                          <p className="font-medium">
                            {getReasonLabel(entry.reason)}
                          </p>
                          <pre className="text-base-content/70 mt-2 overflow-x-auto text-xs">
                            {JSON.stringify(entry.legacyEvent, null, 2)}
                          </pre>
                          {confirmingRecoveryId === entry.id ? (
                            <div
                              className="mt-2 flex flex-wrap gap-2"
                              role="group"
                              aria-label="Confirm removing archived event"
                            >
                              <Button
                                ref={recoveryEntryConfirmationRef}
                                className="min-h-11"
                                color="neutral"
                                type="button"
                                loading={isRecoverySaving}
                                onClick={() =>
                                  void removeRecoveryEntry(entry.id)
                                }
                              >
                                Remove event
                              </Button>
                              <Button
                                className="min-h-11"
                                color="ghost"
                                type="button"
                                onClick={() => {
                                  setConfirmingRecoveryId(null);
                                  recoveryToggleRef.current?.focus();
                                }}
                              >
                                Keep event
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="mt-2 min-h-11"
                              color="ghost"
                              type="button"
                              disabled={isRecoverySaving}
                              onClick={() => setConfirmingRecoveryId(entry.id)}
                            >
                              Remove this archived event
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-base-content/70 text-sm">
                    No older sleep records need review.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default SleepScheduleSettings;
