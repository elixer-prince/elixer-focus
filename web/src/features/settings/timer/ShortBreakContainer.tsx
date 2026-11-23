import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const ShortBreakContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftShortBreak, setDraftShortBreak } = useTimerSettingsContext();

  return (
    <div>
      <label className="label">
        <span className="label-text text-sm font-medium">Minutes</span>
      </label>
      <input
        type="number"
        value={draftShortBreak}
        onChange={(e) => {
          validateAndSet(e.target.value, setDraftShortBreak, 1);
        }}
        className="input input-primary input-lg"
        min={1}
        placeholder="5"
      />
      {draftShortBreak && Number(draftShortBreak) < 1 && (
        <p className="text-error mt-1 text-sm">Must be at least 1 minute</p>
      )}
    </div>
  );
};

export default ShortBreakContainer;
