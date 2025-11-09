import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@app/index.css";
import Router from "@app/router";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    </StrictMode>,
);
