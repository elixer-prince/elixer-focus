import type { Dispatch, SetStateAction } from "react";

export type TimerSettingsType = {
  draftFocus: string;
  draftShortBreak: string;
  draftLongBreak: string;
  setDraftFocus: Dispatch<SetStateAction<string>>;
  setDraftShortBreak: Dispatch<SetStateAction<string>>;
  setDraftLongBreak: Dispatch<SetStateAction<string>>;
};
