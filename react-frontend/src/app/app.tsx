import "@/app/index.css";
import { router } from "@/app/router";
import { Analytics } from "@vercel/analytics/react";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

gsap.registerPlugin(ScrollTrigger, SplitText);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Analytics />
  </StrictMode>,
);
