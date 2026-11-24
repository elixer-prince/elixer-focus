import { Input } from "@/components/ui";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const ShortBreakContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftShortBreak, setDraftShortBreak } = useTimerSettingsContext();
  const isError = Boolean(draftShortBreak && Number(draftShortBreak) < 1);

  return (
    <Input
      type="number"
      inputSize="lg"
      label="Minutes"
      value={draftShortBreak}
      onChange={(e) => {
        validateAndSet(e.target.value, setDraftShortBreak, 1);
      }}
      error={isError}
      helperText={isError ? "Must be at least 1 minute" : undefined}
      min={1}
      placeholder="5"
    />
  );
};

export default ShortBreakContainer;
