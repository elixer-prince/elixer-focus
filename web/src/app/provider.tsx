import CountdownProvider from "@/app/providers/CountdownProvider";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
  return <CountdownProvider>{children}</CountdownProvider>;
};

export default Provider;
