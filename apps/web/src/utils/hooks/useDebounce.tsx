"use client";

import { debounce } from "lodash";
import { useMemo, useLayoutEffect, useRef } from "react";

interface UseDebounceCallback<T extends any[]> {
  // eslint-disable-next-line no-unused-vars
  (...args: T): void;
}

export default function useDebounce<T extends any[]>(
  callback: UseDebounceCallback<T>,
  delay: number,
  // eslint-disable-next-line no-unused-vars
): (...args: T) => void {
  const callbackRef = useRef<UseDebounceCallback<T>>(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo(
    () => debounce((...args: T) => callbackRef.current(...args), delay),
    [delay],
  );
}
