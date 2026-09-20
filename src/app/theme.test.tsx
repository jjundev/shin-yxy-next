import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { theme, resolved, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("system")}>system</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("dark") ? false : true,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

describe("ThemeProvider", () => {
  it("기본은 다크모드", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("라이트로 바꾸면 .dark 가 제거되고 저장된다", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await act(() => userEvent.click(screen.getByRole("button", { name: "light" })));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("shin.theme")).toBe("light");
  });

  it("저장된 값을 읽는다", () => {
    localStorage.setItem("shin.theme", "dark");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });
});
