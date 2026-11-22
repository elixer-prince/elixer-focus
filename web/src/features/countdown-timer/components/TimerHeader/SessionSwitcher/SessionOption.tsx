import type { PropsWithChildren } from "react";

interface SessionOptionProps {
  value: string;
  checked: boolean;
  onChange: () => void;
}

const SessionOption = ({
  value,
  checked,
  children,
  onChange,
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
