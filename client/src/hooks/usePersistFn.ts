import { useRef, useEffect, useCallback } from "react";

type noop = (...args: any[]) => any;

export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);

  // Update ref when fn changes
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const persistFn = useCallback(
    function (this: unknown, ...args: any[]) {
      return fnRef.current.apply(this, args);
    } as T,
    []
  );

  return persistFn;
}
