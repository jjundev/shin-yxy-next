import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { RequireSession } from "./require-session";
import { SessionProvider } from "./session";

function mount(path: string) {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <p>login page</p> },
      { element: <RequireSession />, children: [{ path: "/lab", element: <p>lab page</p> }] },
    ],
    { initialEntries: [path] },
  );
  render(<SessionProvider><RouterProvider router={router} /></SessionProvider>);
  return router;
}

beforeEach(() => localStorage.clear());

describe("RequireSession", () => {
  it("세션이 없으면 로그인으로 보낸다", () => {
    const router = mount("/lab");
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.state).toEqual({ from: "/lab" });
  });
  it("세션이 있으면 그대로 보여준다", () => {
    localStorage.setItem("shin.session", "demo");
    mount("/lab");
    expect(screen.getByText("lab page")).toBeInTheDocument();
  });
});
