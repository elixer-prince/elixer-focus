import { ThemeProvider } from "@stores/ThemeContext.tsx";
import type { ReactNode } from "react";

interface ProviderProps {
    children: ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
    return <ThemeProvider>{children}</ThemeProvider>;
};

export default Provider;
