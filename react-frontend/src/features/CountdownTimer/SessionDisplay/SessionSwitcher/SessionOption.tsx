import type { ReactNode } from "react";

interface SessionOptionProps {
    value: string;
    onClick: () => void;
    checked: boolean;
    children: ReactNode;
}

const SessionOption = ({
    value,
    onClick,
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
                onClick={onClick}
                checked={checked}
            />
            {children}
        </label>
    );
};

export default SessionOption;
