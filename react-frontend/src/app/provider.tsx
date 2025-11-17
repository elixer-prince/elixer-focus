import type { ReactNode } from "react";

interface ProviderProps {
    children: ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
    return <>{children}</>;
};

export default Provider;
