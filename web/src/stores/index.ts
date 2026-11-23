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
  useElapsedTimeInSeconds,
  useSetTimerRunning,
  useSetTimerPaused,
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useSetElapsedTimeInSeconds,
  useResetElapsedTimeInSeconds,
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
  getTotalFocusTime,
  getSessionCountsByType,
} from "@/features/countdown-timer/stores/session-history-store";

// Task stores
export {
  useTasks,
  useSetTasks,
  useAddTask,
  useRemoveTask,
  useToggleTaskCompletion,
  useUpdateTask,
} from "@/features/tasks/stores/tasks-store";

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

// UI stores
export {
  useNavbarIsOpen,
  useToggleNavbar,
  useOpenNavbar,
  useCloseNavbar,
} from "@/features/ui/navigation/Navbar/stores/navbar-store";
