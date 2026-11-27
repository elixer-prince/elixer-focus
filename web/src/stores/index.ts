/*-------------------------------------
| STORES - CENTRAL EXPORTS
|--------------------------------------
|
| All Zustand stores are re-exported here for convenient
| imports. Use this barrel to access any store from a
| single path: @/stores
|
*/

// Persist configuration helper
export { createPersistOptions, simpleMigrate, persist } from "./persist-config";

// Core stores
export { useCurrentTheme, useSetCurrentTheme } from "./theme";
export {
  useProfileDisplayName,
  useProfileBio,
  useUpdateProfile,
} from "@/features/profile/stores/profile-store";

export {
  useCurrentTime,
  useTimeFormat,
  useUpdateCurrentTime,
  useSetTimeFormat,
} from "./date";

// Countdown timer stores
export {
  useTimerRunning,
  useTimerPaused,
  useRemainingTimeInSeconds,
  useStartTimeInMinutes,
  useSessionProgressInSeconds,
  useSetTimerRunning,
  useSetTimerPaused,
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useSetSessionProgressInSeconds,
  useResetSessionProgressInSeconds,
} from "@/features/countdown-timer/stores/countdown-store";

export {
  useFocusDuration,
  useShortBreakDuration,
  useLongBreakDuration,
  useSessionCountLimit,
  useCurrentSessionType,
  usePreviousSessionType,
  useCurrentSessionCount,
  useTotalSessionsCompleted,
  useResetCurrentSessionCount,
  useSetFocusDuration,
  useSetShortBreakDuration,
  useSetLongBreakDuration,
  useSetSessionCountLimit,
  useSetCurrentSessionType,
  useSetPreviousSessionType,
  useIncrementCurrentSessionCount,
  useSetTotalSessionsCompleted,
} from "@/features/countdown-timer/stores/session-store";

export {
  useSessions,
  useAddSession,
  useRemoveSession,
  useClearSessions,
  getSessionsByDateRange,
  getSessionsByDay,
  useTrackedIntervals,
  getTotalFocusTime,
  getSessionCountsByType,
} from "@/features/countdown-timer/stores/session-history-store";

// Task stores
export {
  useTasks,
  useSetTasks,
  useReorderTasks,
  useAddTask,
  useRemoveTask,
  useToggleTaskCompletion,
  useUpdateTask,
  useTasksStore,
} from "@/features/tasks/stores/tasks-store";

export {
  useSubtasks,
  useSubtaskCount,
  useSubtaskCoordinatorSupport,
  useAddSubtask,
  useUpdateSubtask,
  useToggleSubtaskCompletion,
  useRemoveSubtask,
  useReorderSubtasks,
  useSubtasksStore,
} from "@/features/tasks/stores/subtasks-store";

export {
  useCalendarStore,
  useScheduledOccurrences,
} from "@/features/calendar/stores/calendar-store";

export {
  useSleepScheduleStore,
  useSleepScheduleSettings,
  useActualSleepRecords,
  useSleepMigrationRecovery,
  startSleepScheduleCoordinator,
} from "@/features/sleep-schedule/stores/sleep-schedule-store";

// Music player stores
export {
  useChosenSongId,
  useMusicPaused,
  useShowVolumeSlider,
  useSongs,
  useVolume,
  useSetChosenSongId,
  useSetMusicPaused,
  useSetShowVolumeSlider,
  useSetSongs,
  useSetVolume,
} from "@/features/music-player/stores/store";

// Journal stores
export {
  useEntries,
  useNotes,
  useGetEntryByDate,
  useSaveEntry,
  useGetNotesByDate,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useGetStreak,
} from "@/features/journal/stores/journal-store";

// Brain dump store
export {
  useBrainDumpThoughts,
  useBrainDumpReadStatus,
  useBrainDumpReadError,
  useBrainDumpCrossTabSupported,
} from "@/features/brain-dump/stores/brain-dump-store";
export {
  startBrainDumpCoordinator,
  dispatchBrainDumpCommand,
  retryReadBrainDumpThoughts,
} from "@/features/brain-dump/services/brain-dump-coordinator";

// UI stores
export {
  useNavbarIsOpen,
  useToggleNavbar,
  useOpenNavbar,
  useCloseNavbar,
} from "@/features/ui/navigation/Navbar/stores/navbar-store";
