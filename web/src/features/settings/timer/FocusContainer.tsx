import { Input } from "@/components/ui";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const FocusContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftFocus, setDraftFocus } = useTimerSettingsContext();
  const isError = Boolean(draftFocus && Number(draftFocus) < 1);

  return (
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
  );
};

export default FocusContainer;
