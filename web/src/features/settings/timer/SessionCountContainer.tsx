import { Input } from "@/components/ui";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const SessionCountContainer = () => {
  const { isSessionCountLimitInvalid } = useValidation();
  const { draftSessionCountLimit, setDraftSessionCountLimit } =
    useTimerSettingsContext();

  return (
    <Input
      type="number"
      inputSize="lg"
      label="Focus sessions before a long break"
      value={draftSessionCountLimit}
      onChange={(e) => setDraftSessionCountLimit(e.target.value)}
      error={isSessionCountLimitInvalid}
      helperText={
        isSessionCountLimitInvalid
          ? "Enter a whole number from 1 to 8"
          : undefined
      }
      min={1}
      max={8}
      step={1}
    />
  );
};

export default SessionCountContainer;
