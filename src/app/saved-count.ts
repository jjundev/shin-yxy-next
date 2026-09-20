import { useEffect, useState } from "react";
import { api } from "@/api/client";

/** 저장한 실험 개수. 저장소가 바뀌면 다시 센다. 처음 조회 전엔 null */
export function useSavedCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      api.saved().then((list) => {
        if (alive) setCount(list.length);
      });
    };
    refresh();
    const off = api.onSavedChange(refresh);
    return () => {
      alive = false;
      off();
    };
  }, []);
  return count;
}
