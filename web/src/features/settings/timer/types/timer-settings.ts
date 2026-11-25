import type { Dispatch, SetStateAction } from "react";

export type TimerSettingsType = {
  draftFocus: string;
  draftSessionCountLimit: string;
  draftShortBreak: string;
  draftLongBreak: string;
  setDraftFocus: Dispatch<SetStateAction<string>>;
  setDraftSessionCountLimit: Dispatch<SetStateAction<string>>;
  setDraftShortBreak: Dispatch<SetStateAction<string>>;
  setDraftLongBreak: Dispatch<SetStateAction<string>>;
};
