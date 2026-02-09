import type { PropsWithChildren } from "react";
import CountdownProvider from "@/components/providers/CountdownProvider.tsx";

const Provider = ({ children }: PropsWithChildren) => {
  return <CountdownProvider>{children}</CountdownProvider>;
};

export default Provider;
