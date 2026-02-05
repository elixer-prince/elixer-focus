import "@app/index.css";
import Provider from "@app/provider";
import { router } from "@app/router";
import { Analytics } from "@vercel/analytics/react";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

gsap.registerPlugin(ScrollTrigger, SplitText);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider>
            <RouterProvider router={router} />
            <Analytics />
        </Provider>
    </StrictMode>,
);
