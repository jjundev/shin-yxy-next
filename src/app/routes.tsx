import { createBrowserRouter, createMemoryRouter, type RouteObject } from "react-router";
import { LandingScreen } from "@/screens/landing";
import { LoginScreen } from "@/screens/login";
import { LabScreen } from "@/screens/lab";
import { SavedScreen } from "@/screens/saved";
import { AppShell } from "./shell";
import { RedirectUnknown } from "./redirect-unknown";
import { RequireSession } from "./require-session";

export const routes: RouteObject[] = [
  { path: "/", element: <LandingScreen /> },
  { path: "/login", element: <LoginScreen /> },
  {
    element: <RequireSession />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/lab", element: <LabScreen /> },
          { path: "/saved", element: <SavedScreen /> },
          { path: "*", element: <RedirectUnknown /> },
        ],
      },
    ],
  },
];

export function createAppRouter(initialEntries?: string[]) {
  return initialEntries
    ? createMemoryRouter(routes, { initialEntries })
    : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
}
