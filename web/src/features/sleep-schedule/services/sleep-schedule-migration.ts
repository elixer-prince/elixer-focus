import type {
  ActualSleepRecord,
  SleepEventMigrationRecovery,
  SleepScheduleData,
} from "@/features/sleep-schedule/types/sleep-schedule";
import {
  formatLocalDate,
  isValidLocalDate,
} from "@/features/calendar/utils/calendar-date";

type LegacySleepEvent = {
  id: string;
  date: string;
  type: "wake" | "bed";
  actualAt: number;
};

type IndexedLegacyEvent = {
  event: LegacySleepEvent;
  index: number;
  pairedWake?: IndexedLegacyEvent;
};

const getLegacySleepEvent = (value: unknown): LegacySleepEvent | null => {
  if (!value || typeof value !== "object") return null;

  const event = value as Partial<LegacySleepEvent>;
  if (
    typeof event.id !== "string" ||
    !event.id ||
    typeof event.date !== "string" ||
    !isValidLocalDate(event.date) ||
    (event.type !== "wake" && event.type !== "bed") ||
    typeof event.actualAt !== "number" ||
    !Number.isFinite(event.actualAt)
  ) {
    return null;
  }

  return {
    id: event.id,
    date: event.date,
    type: event.type,
    actualAt: event.actualAt,
  };
};

const getRecoveryId = (index: number, event: unknown) => {
  const sourceId =
    event && typeof event === "object" && "id" in event
      ? String(event.id)
      : "unknown";
  return `legacy-${index}-${sourceId}`;
};

export const migrateLegacySleepEvents = (
  current: SleepScheduleData,
  sourceEvents: unknown[],
  now = Date.now(),
): SleepScheduleData => {
  const next: SleepScheduleData = {
    ...current,
    settings: current.settings,
    actualRecords: [...current.actualRecords],
    recoveryEntries: [...current.recoveryEntries],
  };
  const validEvents: IndexedLegacyEvent[] = [];

  sourceEvents.forEach((sourceEvent, index) => {
    const event = getLegacySleepEvent(sourceEvent);
    if (!event || event.actualAt > now) {
      const id = getRecoveryId(index, sourceEvent);
      if (!next.recoveryEntries.some((entry) => entry.id === id)) {
        next.recoveryEntries.push({
          id,
          legacyEvent: sourceEvent,
          reason: "invalidEvent",
        });
      }
      return;
    }
    validEvents.push({ event, index });
  });

  validEvents.sort(
    (left, right) =>
      left.event.actualAt - right.event.actualAt || left.index - right.index,
  );

  const beds: IndexedLegacyEvent[] = [];
  const unmatchedWakes: IndexedLegacyEvent[] = [];
  validEvents.forEach((item) => {
    if (item.event.type === "bed") {
      beds.push(item);
      return;
    }

    const candidate = beds
      .filter(
        (bed) => bed.event.actualAt < item.event.actualAt && !bed.pairedWake,
      )
      .sort((left, right) => right.event.actualAt - left.event.actualAt)[0];

    if (candidate) candidate.pairedWake = item;
    else unmatchedWakes.push(item);
  });

  const addRecovery = (
    item: IndexedLegacyEvent,
    reason: SleepEventMigrationRecovery["reason"],
  ) => {
    const id = getRecoveryId(item.index, sourceEvents[item.index]);
    if (next.recoveryEntries.some((entry) => entry.id === id)) return;
    next.recoveryEntries.push({
      id,
      legacyEvent: sourceEvents[item.index],
      reason,
    });
  };

  const importedSleepDates = new Set(
    next.actualRecords
      .filter(
        (record): record is ActualSleepRecord =>
          typeof record.sleepDate === "string",
      )
      .map((record) => record.sleepDate),
  );

  beds.forEach((bed) => {
    const sleepDate = formatLocalDate(new Date(bed.event.actualAt));
    const id = getRecoveryId(bed.index, sourceEvents[bed.index]);
    const alreadyImported = next.actualRecords.some(
      (record) => record.id === id,
    );
    if (alreadyImported) return;

    if (importedSleepDates.has(sleepDate)) {
      addRecovery(bed, "duplicateSleepDate");
      if (bed.pairedWake) addRecovery(bed.pairedWake, "duplicateSleepDate");
      return;
    }

    const record: ActualSleepRecord = {
      id,
      sleepDate,
      bedAt: bed.event.actualAt,
      wakeAt: bed.pairedWake?.event.actualAt ?? null,
    };
    next.actualRecords.push(record);
    importedSleepDates.add(sleepDate);
  });

  unmatchedWakes.forEach((wake) => addRecovery(wake, "unmatchedWake"));

  return next;
};
