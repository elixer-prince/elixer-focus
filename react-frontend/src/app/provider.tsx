import { ThemeProvider } from "@/stores/ThemeContext";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
    return <ThemeProvider>{children}</ThemeProvider>;
};

export default Provider;
