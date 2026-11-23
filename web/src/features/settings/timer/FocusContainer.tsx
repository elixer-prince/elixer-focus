import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";

const FocusContainer = () => {
  const { validateAndSet } = useValidation();
  const { draftFocus, setDraftFocus } = useTimerSettingsContext();

  return (
    <div>
      <label className="label">
        <span className="label-text text-sm font-medium">Minutes</span>
      </label>
      <input
        type="number"
        value={draftFocus}
        onChange={(e) => {
          validateAndSet(e.target.value, setDraftFocus, 1);
        }}
        className="input input-primary input-lg"
        min={1}
        placeholder="25"
      />
      {draftFocus && Number(draftFocus) < 1 && (
        <p className="text-error mt-1 text-sm">Must be at least 1 minute</p>
      )}
    </div>
  );
};

export default FocusContainer;
