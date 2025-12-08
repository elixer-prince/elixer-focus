import type { ReactNode } from "react";

interface SessionOptionProps {
    value: string;
    onChange: () => void;
    checked: boolean;
    children: ReactNode;
}

const SessionOption = ({
    value,
    onChange,
    checked,
    children,
}: SessionOptionProps) => {
    return (
        <label>
            <input
                name="session-type"
                type="radio"
                className="accent-primary"
                value={value}
                onChange={onChange}
                checked={checked}
            />
            {children}
        </label>
    );
};

export default SessionOption;
