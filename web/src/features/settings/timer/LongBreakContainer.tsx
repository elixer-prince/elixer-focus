import { Input } from "@/components/ui";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const LongBreakContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftLongBreak, setDraftLongBreak } = useTimerSettingsContext();
  const isError = Boolean(draftLongBreak && Number(draftLongBreak) < 5);

  return (
    <Input
      type="number"
      inputSize="lg"
      label="Minutes"
      value={draftLongBreak}
      onChange={(e) => {
        validateAndSet(e.target.value, setDraftLongBreak, 5);
      }}
      error={isError}
      helperText={isError ? "Must be at least 5 minutes" : undefined}
      min={5}
      placeholder="15"
    />
  );
};

export default LongBreakContainer;
