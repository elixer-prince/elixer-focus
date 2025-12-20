import { ThemeProvider } from "@stores/ThemeContext.tsx";
import type { ReactNode } from "react";
import { NavbarProvider } from "@stores/NavbarContext.tsx";

interface ProviderProps {
    children: ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
    return (
        <ThemeProvider>
            <NavbarProvider>{children}</NavbarProvider>
        </ThemeProvider>
    );
};

export default Provider;
