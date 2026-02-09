import { CountdownTimerProvider } from "@/contexts/CountdownTimer.tsx";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
  return <CountdownTimerProvider>{children}</CountdownTimerProvider>;
};

export default Provider;
