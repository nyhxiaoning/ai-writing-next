import { useEffect, useState } from "react";

export default function useMedia(
  queries: string[],
  values: number[],
  defaultValue: number
) {
  // 判断是否是浏览器环境
  const isBrowser =
    typeof window !== "undefined" && typeof window.matchMedia !== "undefined";

  // match 函数，用来返回与当前媒体查询匹配的值
  const match = () => {
    if (!isBrowser) {
      return defaultValue; // 如果不在浏览器环境中，直接返回默认值
    }
    const queryIndex = queries.findIndex((q) => window.matchMedia(q).matches);
    return values[queryIndex] || defaultValue;
  };

  const [value, set] = useState(match);

  useEffect(() => {
    if (!isBrowser) {
      return; // 非浏览器环境下不执行后续逻辑
    }
    const handler = () => set(match);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isBrowser, queries, values, defaultValue]);

  return value;
}
