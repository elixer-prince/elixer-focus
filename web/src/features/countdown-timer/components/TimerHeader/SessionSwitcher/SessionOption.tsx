import type { PropsWithChildren } from "react";

interface SessionOptionProps {
  value: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const SessionOption = ({
  value,
  checked,
  children,
  onChange,
  disabled = false,
}: PropsWithChildren<SessionOptionProps>) => {
  return (
    <label>
      <input
        name="session-type"
        type="radio"
        className="session-option accent-primary"
        value={value}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
      />
      {children}
    </label>
  );
};

export default SessionOption;
