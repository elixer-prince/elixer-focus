export type SleepScheduleSettings = {
  wakeTime: string | null;
  targetSleepDurationMinutes: number;
  bedTimeOverride: string | null;
};

export type ActualSleepRecord = {
  id: string;
  sleepDate: string;
  bedAt: number;
  wakeAt: number | null;
};

export type SleepEventMigrationRecovery = {
  id: string;
  legacyEvent: unknown;
  reason: "unmatchedWake" | "invalidEvent" | "duplicateSleepDate";
};

export type SleepScheduleData = {
  settings: SleepScheduleSettings;
  actualRecords: ActualSleepRecord[];
  recoveryEntries: SleepEventMigrationRecovery[];
};

export type PlannedSleepEvent = {
  id: string;
  type: "wake" | "bed";
  at: number;
  date: string;
};

export type ActualSleepEvent = {
  id: string;
  recordId: string;
  type: "wake" | "bed";
  at: number;
  date: string;
};

export type AwakeWindowSegment = {
  date: string;
  startAt: number;
  endAt: number;
};

export type SleepProgressSegment = AwakeWindowSegment & {
  filled: boolean;
};

export type AwakeIdleTotal = {
  date: string;
  idleSeconds: number | null;
};

export const initialSleepScheduleData: SleepScheduleData = {
  settings: {
    wakeTime: null,
    targetSleepDurationMinutes: 480,
    bedTimeOverride: null,
  },
  actualRecords: [],
  recoveryEntries: [],
};
