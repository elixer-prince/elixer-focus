import type { PropsWithChildren } from "react";

interface SessionOptionProps {
  value: string;
  onChange: () => void;
  checked: boolean;
}

const SessionOption = ({
  value,
  onChange,
  checked,
  children,
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
      />
      {children}
    </label>
  );
};

export default SessionOption;
