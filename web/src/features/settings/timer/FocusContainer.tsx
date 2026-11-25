import { Input } from "@/components/ui";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const FocusContainer = () => {
  const { isSessionCountLimitInvalid, validateAndSet } = useValidation();
  const {
    draftFocus,
    draftSessionCountLimit,
    setDraftFocus,
    setDraftSessionCountLimit,
  } = useTimerSettingsContext();
  const isError = Boolean(draftFocus && Number(draftFocus) < 1);

  return (
    <>
      <Input
        type="number"
        inputSize="lg"
        label="Minutes"
        value={draftFocus}
        onChange={(e) => {
          validateAndSet(e.target.value, setDraftFocus, 1);
        }}
        error={isError}
        helperText={isError ? "Must be at least 1 minute" : undefined}
        min={1}
        placeholder="25"
      />
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
    </>
  );
};

export default FocusContainer;
