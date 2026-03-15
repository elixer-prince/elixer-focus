import {
  useSetCurrentSessionType,
  useSetCustomSessionInputShown,
} from "@/features/countdown-timer/stores/session-store";
import type { PropsWithChildren } from "react";

interface SessionOptionProps {
  value: string;
  checked: boolean;
  isCustomOption?: boolean;
  onChange: () => void;
}

const SessionOption = ({
  value,
  checked,
  children,
  isCustomOption,
  onChange,
}: PropsWithChildren<SessionOptionProps>) => {
  const setCustomSessionInputShown = useSetCustomSessionInputShown();
  const setCurrentSessionType = useSetCurrentSessionType();

  return (
    <label>
      <input
        name="session-type"
        type="radio"
        className="session-option accent-primary"
        value={value}
        onChange={() => {
          if (isCustomOption) {
            setCurrentSessionType("Custom");
            return setCustomSessionInputShown(true);
          }
          setCustomSessionInputShown(false);
          onChange();
        }}
        checked={checked}
      />
      {children}
    </label>
  );
};

export default SessionOption;
