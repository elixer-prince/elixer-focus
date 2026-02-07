import useValidation from "@/features/CountdownTimer/components/TimerSettings/hooks/useValidation.ts";
import { useTimerSettingsContext } from "@/features/CountdownTimer/components/TimerSettings/stores/TimerSettingsContext.tsx";

const LongBreakContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftLongBreak, setDraftLongBreak } = useTimerSettingsContext();

  return (
    <div>
      <label className={"mb-2 block text-sm font-medium"}>
        Long Break (minutes)
      </label>
      <input
        type={"number"}
        value={draftLongBreak}
        onChange={(e) => {
          validateAndSet(e.target.value, setDraftLongBreak, 5);
        }}
        className={"input input-primary"}
        min={5}
        placeholder={"15"}
      />
      {draftLongBreak && Number(draftLongBreak) < 5 && (
        <p className={"mt-1 text-sm text-red-500"}>
          Must be at least 5 minutes
        </p>
      )}
    </div>
  );
};

export default LongBreakContainer;
