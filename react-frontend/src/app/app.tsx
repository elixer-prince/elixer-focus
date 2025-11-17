import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@app/index.css";
import Router from "@app/router";
import { BrowserRouter } from "react-router";
import Provider from "@app/provider.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider>
                <Router />
            </Provider>
        </BrowserRouter>
    </StrictMode>,
);
