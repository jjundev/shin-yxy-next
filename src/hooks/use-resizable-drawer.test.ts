import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_DRAWER_WIDTH,
  MAX_DRAWER_WIDTH,
  MIN_DRAWER_WIDTH,
  useResizableDrawer,
} from "./use-resizable-drawer";

describe("useResizableDrawer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("기본값은 펼침 상태와 320px 너비다", () => {
    const { result } = renderHook(() => useResizableDrawer());
    expect(result.current.width).toBe(DEFAULT_DRAWER_WIDTH);
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.isDragging).toBe(false);
  });

  it("localStorage 에 저장된 너비와 접힘 상태를 복원한다", () => {
    localStorage.setItem("shin.lab.rail-width", "400");
    localStorage.setItem("shin.lab.rail-collapsed", "true");

    const { result } = renderHook(() => useResizableDrawer());
    expect(result.current.width).toBe(400);
    expect(result.current.isCollapsed).toBe(true);
  });

  it("너비 변경 시 minWidth(260)와 maxWidth(480) 범위로 클램핑된다", () => {
    const { result } = renderHook(() => useResizableDrawer());

    act(() => result.current.setWidth(100));
    expect(result.current.width).toBe(MIN_DRAWER_WIDTH);
    expect(localStorage.getItem("shin.lab.rail-width")).toBe(String(MIN_DRAWER_WIDTH));

    act(() => result.current.setWidth(600));
    expect(result.current.width).toBe(MAX_DRAWER_WIDTH);
    expect(localStorage.getItem("shin.lab.rail-width")).toBe(String(MAX_DRAWER_WIDTH));
  });

  it("toggleCollapse 가 접힘 상태를 전환하고 localStorage 에 쓴다", () => {
    const { result } = renderHook(() => useResizableDrawer());
    expect(result.current.isCollapsed).toBe(false);

    act(() => result.current.toggleCollapse());
    expect(result.current.isCollapsed).toBe(true);
    expect(localStorage.getItem("shin.lab.rail-collapsed")).toBe("true");

    act(() => result.current.toggleCollapse());
    expect(result.current.isCollapsed).toBe(false);
    expect(localStorage.getItem("shin.lab.rail-collapsed")).toBe("false");
  });

  it("포인터 드래그로 너비를 늘리고 줄인다", () => {
    const { result } = renderHook(() => useResizableDrawer());

    const captureMock = vi.fn();
    const releaseMock = vi.fn();

    const target = {
      setPointerCapture: captureMock,
      releasePointerCapture: releaseMock,
    } as unknown as Element;

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 320,
        pointerId: 1,
        currentTarget: target,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(captureMock).toHaveBeenCalledWith(1);

    act(() => {
      result.current.handlePointerMove({
        clientX: 370, // +50px
      } as unknown as React.PointerEvent);
    });

    expect(result.current.width).toBe(370);

    act(() => {
      result.current.handlePointerUp({
        clientX: 370,
        pointerId: 1,
        currentTarget: target,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.width).toBe(370);
    expect(result.current.isCollapsed).toBe(false);
    expect(localStorage.getItem("shin.lab.rail-width")).toBe("370");
  });

  it("포인터를 스냅 임계치(180px) 이하로 드래그하면 접힘 상태로 전환된다", () => {
    const { result } = renderHook(() => useResizableDrawer());

    const target = {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
    } as unknown as Element;

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 320,
        pointerId: 1,
        currentTarget: target,
      } as unknown as React.PointerEvent);
    });

    act(() => {
      // 320 - 160 = 160 (threshold 180 미만)
      result.current.handlePointerUp({
        clientX: 160,
        pointerId: 1,
        currentTarget: target,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isCollapsed).toBe(true);
    expect(localStorage.getItem("shin.lab.rail-collapsed")).toBe("true");
  });

  it("키보드 방향키 및 단축키로 너비 조절과 접기가 가능하다", () => {
    const { result } = renderHook(() => useResizableDrawer());

    const preventDefault = vi.fn();

    // ArrowRight: 320 -> 330
    act(() => {
      result.current.handleKeyDown({
        key: "ArrowRight",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.width).toBe(330);
    expect(preventDefault).toHaveBeenCalled();

    // ArrowLeft: 330 -> 320
    act(() => {
      result.current.handleKeyDown({
        key: "ArrowLeft",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.width).toBe(320);

    // End: maxWidth
    act(() => {
      result.current.handleKeyDown({
        key: "End",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.width).toBe(MAX_DRAWER_WIDTH);

    // Enter: toggle collapse
    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.isCollapsed).toBe(true);
  });

  it("direction이 right일 때 좌측 드래그(음수 delta)로 너비가 늘어난다", () => {
    const { result } = renderHook(() =>
      useResizableDrawer({
        direction: "right",
        defaultWidth: 340,
        minWidth: 280,
        maxWidth: 500,
        storageKeyWidth: "shin.test.right-w",
        storageKeyCollapsed: "shin.test.right-c",
      }),
    );

    const target = {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
    } as unknown as Element;

    // Pointer down at 500
    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 500,
        pointerId: 1,
        currentTarget: target,
      } as unknown as React.PointerEvent);
    });

    // Drag left by 40px (500 -> 460) => width increases by 40px (340 -> 380)
    act(() => {
      result.current.handlePointerMove({
        clientX: 460,
      } as unknown as React.PointerEvent);
    });
    expect(result.current.width).toBe(380);

    // Pointer up at 460
    act(() => {
      result.current.handlePointerUp({
        clientX: 460,
        pointerId: 1,
        currentTarget: target,
      } as unknown as React.PointerEvent);
    });
    expect(result.current.width).toBe(380);
    expect(localStorage.getItem("shin.test.right-w")).toBe("380");

    // Right drawer keyboard: ArrowLeft expands, ArrowRight shrinks
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown({
        key: "ArrowLeft",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.width).toBe(390);

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowRight",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.width).toBe(380);
  });

  it("defaultCollapsed 함수 기반 초기값을 지원한다", () => {
    const { result } = renderHook(() =>
      useResizableDrawer({
        storageKeyCollapsed: "shin.test.non-existent",
        defaultCollapsed: () => true,
      }),
    );
    expect(result.current.isCollapsed).toBe(true);
  });
});
