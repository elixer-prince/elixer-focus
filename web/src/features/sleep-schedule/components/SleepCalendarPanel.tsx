import {
  createLocalDateTime,
  formatLocalDate,
} from "@/features/calendar/utils/calendar-date";
import { dispatchSleepScheduleCommand } from "@/features/sleep-schedule/services/sleep-schedule-coordinator";
import {
  formatAwakeDuration,
  formatSleepDuration,
  getActualSleepRecordsForDate,
  getMostRecentIncompleteSleepRecord,
  isValidSleepScheduleSettings,
} from "@/features/sleep-schedule/utils/sleep-schedule";
import type {
  AwakeIdleTotal,
  ActualSleepRecord,
} from "@/features/sleep-schedule/types/sleep-schedule";
import { useActualSleepRecords, useSleepScheduleSettings } from "@/stores";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@/components/ui";

type SleepCalendarPanelProps = {
  selectedDate: string;
  currentTime: Date;
  showAwakeTotals: boolean;
  awakeTotals: AwakeIdleTotal[];
};

const formatClockTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);

const formatLocalDateLabel = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(createLocalDateTime(date, "12:00"));

const getBedDate = (record: ActualSleepRecord) =>
  formatLocalDate(new Date(record.bedAt));

const getWakeDate = (record: ActualSleepRecord) =>
  record.wakeAt === null ? null : formatLocalDate(new Date(record.wakeAt));

const SleepCalendarPanel = ({
  selectedDate,
  currentTime,
  showAwakeTotals,
  awakeTotals,
}: SleepCalendarPanelProps) => {
  const settings = useSleepScheduleSettings();
  const actualRecords = useActualSleepRecords();
  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const actualSleepHeadingRef = useRef<HTMLHeadingElement>(null);
  const deleteConfirmationRef = useRef<HTMLButtonElement>(null);

  const today = formatLocalDate(currentTime);
  const selectedIsToday = selectedDate === today;
  const selectedIsFuture = selectedDate > today;
  const settingsAreValid = isValidSleepScheduleSettings(settings);
  const recordsOnDate = getActualSleepRecordsForDate(
    actualRecords,
    selectedDate,
  );
  const bedRecords = recordsOnDate.filter(
    (record) => getBedDate(record) === selectedDate,
  );
  const wakeRecords = recordsOnDate.filter(
    (record) => getWakeDate(record) === selectedDate,
  );
  const bedRecord = bedRecords[0];
  const wakeRecord = wakeRecords[0];
  const bedRecordAt = bedRecord?.bedAt;
  const wakeRecordAt = wakeRecord?.wakeAt;

  useEffect(() => {
    setBedTime(
      bedRecordAt !== undefined ? format(new Date(bedRecordAt), "HH:mm") : "",
    );
    setWakeTime(
      wakeRecordAt !== null && wakeRecordAt !== undefined
        ? format(new Date(wakeRecordAt), "HH:mm")
        : "",
    );
  }, [selectedDate, bedRecordAt, wakeRecordAt]);

  useEffect(() => {
    if (confirmingDeleteId) deleteConfirmationRef.current?.focus();
  }, [confirmingDeleteId]);

  const bedTimeDraft = bedTime
    ? createLocalDateTime(selectedDate, bedTime).getTime()
    : Number.NaN;
  const wakeTimeDraft = wakeTime
    ? createLocalDateTime(selectedDate, wakeTime).getTime()
    : Number.NaN;
  const wakeAt = selectedIsToday ? currentTime.getTime() : wakeTimeDraft;
  const wakeCandidate = Number.isFinite(wakeAt)
    ? getMostRecentIncompleteSleepRecord(actualRecords, wakeAt)
    : undefined;

  const applyCommand = async (
    command: Parameters<typeof dispatchSleepScheduleCommand>[0],
    successMessage: string,
  ) => {
    setIsSaving(true);
    setError(null);
    setFeedback("");
    try {
      const result = await dispatchSleepScheduleCommand(command);
      if (!result.success) {
        setError(result.error ?? "Unable to save the actual sleep record.");
        return false;
      }
      setFeedback(successMessage);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBed = async () => {
    const actualAt = selectedIsToday ? Date.now() : bedTimeDraft;
    if (!Number.isFinite(actualAt)) {
      setError("Choose a valid bedtime for this date.");
      return;
    }
    const command = bedRecord
      ? { type: "update-bed" as const, recordId: bedRecord.id, actualAt }
      : { type: "record-bed" as const, sleepDate: selectedDate, actualAt };
    await applyCommand(command, "Bedtime saved.");
  };

  const handleSaveWake = async () => {
    const actualAt = selectedIsToday ? Date.now() : wakeTimeDraft;
    if (!Number.isFinite(actualAt)) {
      setError("Choose a valid wake time for this date.");
      return;
    }
    if (wakeRecord) {
      await applyCommand(
        {
          type: "update-wake",
          recordId: wakeRecord.id,
          actualAt,
        },
        "Wake time updated.",
      );
      return;
    }
    if (!wakeCandidate) {
      setError("No earlier bedtime is available for this wake time.");
      return;
    }
    await applyCommand(
      {
        type: "record-wake",
        recordId: wakeCandidate.id,
        actualAt,
      },
      "Wake time recorded.",
    );
  };

  const handleClearWake = async (recordId: string) => {
    const cleared = await applyCommand(
      { type: "clear-wake", recordId },
      "Wake time cleared. The bedtime remains recorded.",
    );
    if (cleared) {
      setWakeTime("");
      actualSleepHeadingRef.current?.focus();
    }
  };

  const handleDeleteBed = async (record: ActualSleepRecord) => {
    if (confirmingDeleteId !== record.id) {
      setConfirmingDeleteId(record.id);
      return;
    }
    const deleted = await applyCommand(
      {
        type: "delete-night",
        recordId: record.id,
        confirmWakeRemoval: confirmingDeleteId === record.id,
      },
      "Actual sleep night removed.",
    );
    if (deleted) {
      setConfirmingDeleteId(null);
      actualSleepHeadingRef.current?.focus();
    }
  };

  const sleepDuration = (record: ActualSleepRecord) =>
    record.wakeAt === null
      ? null
      : formatSleepDuration(
          Math.floor((record.wakeAt - record.bedAt) / 60_000),
        );

  return (
    <div className="space-y-4">
      <section className="border-base-content/10 bg-base-100 rounded-2xl border p-5 shadow-sm">
        <header className="mb-4">
          <h2 className="text-base-content text-lg font-semibold">
            Sleep and awake time
          </h2>
          <p className="text-base-content/70 mt-1 text-sm">
            {formatLocalDateLabel(selectedDate)}
          </p>
        </header>

        {!settingsAreValid || !settings.wakeTime ? (
          <p className="bg-base-200/60 rounded-xl p-3 text-sm">
            No valid wake time is set. Planned sleep events and awake totals are
            unavailable until you configure a schedule.
          </p>
        ) : (
          <p className="bg-base-200/60 rounded-xl p-3 text-sm">
            Planned events are generated from your daily wake time and target.
            Actual records do not change the progress rail.
          </p>
        )}

        {showAwakeTotals && (
          <section aria-labelledby="awake-totals-title" className="mt-4">
            <h3 className="font-semibold" id="awake-totals-title">
              Awake idle time
            </h3>
            {awakeTotals.length ? (
              <ul className="mt-2 space-y-2">
                {awakeTotals.map((total) => (
                  <li
                    className="bg-base-200/60 flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                    key={total.date}
                  >
                    <span className="text-sm">
                      {formatLocalDateLabel(total.date)}
                    </span>
                    <span className="badge badge-primary badge-soft">
                      {total.idleSeconds === null
                        ? "Unavailable"
                        : formatAwakeDuration(total.idleSeconds)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base-content/70 mt-2 text-sm">
                No awake totals are available for this view.
              </p>
            )}
          </section>
        )}

        <section aria-labelledby="actual-sleep-title" className="mt-5">
          <h3
            className="font-semibold"
            id="actual-sleep-title"
            ref={actualSleepHeadingRef}
            tabIndex={-1}
          >
            Actual sleep records
          </h3>
          {recordsOnDate.length ? (
            <ul className="mt-2 space-y-3">
              {recordsOnDate.map((record) => (
                <li className="bg-base-200/60 rounded-xl p-3" key={record.id}>
                  {getBedDate(record) === selectedDate && (
                    <p>
                      <span className="font-medium">Bedtime</span>{" "}
                      <time dateTime={new Date(record.bedAt).toISOString()}>
                        {formatClockTime(record.bedAt)}
                      </time>
                    </p>
                  )}
                  {getWakeDate(record) === selectedDate && record.wakeAt && (
                    <p className="mt-1">
                      <span className="font-medium">Wake time</span>{" "}
                      <time dateTime={new Date(record.wakeAt).toISOString()}>
                        {formatClockTime(record.wakeAt)}
                      </time>
                      {sleepDuration(record) && (
                        <span className="text-base-content/70 text-sm">
                          {" "}
                          · {sleepDuration(record)} sleep
                        </span>
                      )}
                    </p>
                  )}
                  {getWakeDate(record) === selectedDate &&
                    record.wakeAt !== null && (
                      <Button
                        color="ghost"
                        className="mt-2 min-h-11"
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleClearWake(record.id)}
                      >
                        Clear wake time
                      </Button>
                    )}
                  {getBedDate(record) === selectedDate && (
                    <div className="mt-2">
                      {confirmingDeleteId === record.id ? (
                        <div
                          className="border-error/30 bg-error/5 space-y-2 rounded-xl border p-3"
                          role="group"
                          aria-label="Confirm removing actual sleep night"
                        >
                          <p className="text-sm">
                            {record.wakeAt !== null
                              ? "Removing bedtime also removes its recorded wake time."
                              : "This removes the actual bedtime record."}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              ref={deleteConfirmationRef}
                              className="min-h-11"
                              color="neutral"
                              type="button"
                              disabled={isSaving}
                              loading={isSaving}
                              onClick={() => void handleDeleteBed(record)}
                            >
                              Remove night
                            </Button>
                            <Button
                              className="min-h-11"
                              color="ghost"
                              type="button"
                              onClick={() => {
                                setConfirmingDeleteId(null);
                                actualSleepHeadingRef.current?.focus();
                              }}
                            >
                              Keep night
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          color="ghost"
                          className="min-h-11"
                          type="button"
                          disabled={isSaving}
                          onClick={() => void handleDeleteBed(record)}
                        >
                          Clear bedtime
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base-content/70 mt-2 text-sm">
              No actual sleep events recorded for this date.
            </p>
          )}
        </section>

        {!selectedIsFuture && (
          <section
            aria-labelledby="record-sleep-title"
            aria-busy={isSaving}
            className="border-base-content/10 mt-5 border-t pt-4"
          >
            <h3 className="font-semibold" id="record-sleep-title">
              Record actual sleep
            </h3>
            {!selectedIsToday && (
              <>
                <div className="mt-3">
                  <Input
                    label={`Bedtime for ${selectedDate}`}
                    name="actualBedtime"
                    autoComplete="off"
                    type="time"
                    step={60}
                    value={bedTime}
                    className="min-h-12 w-full"
                    aria-describedby={error ? "sleep-record-error" : undefined}
                    onChange={(event) => {
                      setBedTime(event.currentTarget.value);
                      setError(null);
                    }}
                  />
                </div>
                <div className="mt-3">
                  <Input
                    label={`Wake time for ${selectedDate}`}
                    name="actualWakeTime"
                    autoComplete="off"
                    type="time"
                    step={60}
                    value={wakeTime}
                    className="min-h-12 w-full"
                    aria-describedby={error ? "sleep-record-error" : undefined}
                    onChange={(event) => {
                      setWakeTime(event.currentTarget.value);
                      setError(null);
                    }}
                  />
                </div>
              </>
            )}
            {error && (
              <p
                className="text-error mt-3 text-sm"
                id="sleep-record-error"
                role="alert"
              >
                {error}
              </p>
            )}
            {isSaving && (
              <p className="text-base-content/70 mt-3 text-sm" role="status">
                Saving actual sleep record…
              </p>
            )}
            {feedback && (
              <p
                className="text-success mt-3 text-sm"
                role="status"
                aria-live="polite"
              >
                {feedback}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                className="min-h-11"
                type="button"
                loading={isSaving}
                disabled={
                  selectedIsToday ? false : !Number.isFinite(bedTimeDraft)
                }
                onClick={() => void handleSaveBed()}
              >
                {bedRecord ? "Correct bedtime" : "Record bedtime"}
                {selectedIsToday ? " now" : ""}
              </Button>
              <Button
                className="min-h-11"
                color="outline"
                type="button"
                loading={isSaving}
                disabled={
                  selectedIsToday
                    ? !wakeCandidate && !wakeRecord
                    : !Number.isFinite(wakeTimeDraft) ||
                      (!wakeCandidate && !wakeRecord)
                }
                onClick={() => void handleSaveWake()}
              >
                {wakeRecord ? "Correct wake time" : "Record wake time"}
                {selectedIsToday ? " now" : ""}
              </Button>
            </div>
            {!selectedIsToday && !wakeTime && !wakeRecord && (
              <p className="text-base-content/70 mt-2 text-sm">
                Choose a wake time to check for the most recent earlier bedtime.
              </p>
            )}
            {!wakeCandidate && !wakeRecord && (selectedIsToday || wakeTime) && (
              <p className="text-base-content/70 mt-2 text-sm">
                No earlier bedtime is available for this wake time. Record a
                bedtime first.
              </p>
            )}
          </section>
        )}

        {selectedIsFuture && (
          <p className="text-base-content/70 mt-5 text-sm">
            Actual sleep times cannot be recorded for a future date.
          </p>
        )}
      </section>
    </div>
  );
};

export default SleepCalendarPanel;
