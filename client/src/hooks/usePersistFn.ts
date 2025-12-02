import { useRef, useCallback } from "react";

type noop = (...args: any[]) => any;

export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);
  
  // Update ref without assignment to current
  useRef(() => {
    fnRef.current = fn;
  })[0]();

  const persistFn = useCallback(function (this: unknown, ...args: any[]) {
    return fnRef.current.apply(this, args);
  } as T, []);

  return persistFn;
}
