import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const LongBreakContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftLongBreak, setDraftLongBreak } = useTimerSettingsContext();

  return (
    <div>
      <label className="label">
        <span className="label-text text-sm font-medium">Minutes</span>
      </label>
      <input
        type="number"
        value={draftLongBreak}
        onChange={(e) => {
          validateAndSet(e.target.value, setDraftLongBreak, 5);
        }}
        className="input input-primary input-lg"
        min={5}
        placeholder="15"
      />
      {draftLongBreak && Number(draftLongBreak) < 5 && (
        <p className="text-error mt-1 text-sm">Must be at least 5 minutes</p>
      )}
    </div>
  );
};

export default LongBreakContainer;
