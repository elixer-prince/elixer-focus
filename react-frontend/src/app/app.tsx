import "@app/index.css";
import Provider from "@app/provider.tsx";
import Router from "@app/router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider>
            <Router />
        </Provider>
    </StrictMode>,
);
