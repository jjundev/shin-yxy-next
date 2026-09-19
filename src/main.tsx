import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { createAppRouter } from "@/app/routes";
import { SessionProvider } from "@/app/session";
import { ThemeProvider } from "@/app/theme";
import { AppToaster } from "@/app/toaster";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <RouterProvider router={createAppRouter()} />
        <AppToaster />
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>,
);
