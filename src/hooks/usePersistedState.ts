"use client";

import { useEffect, useState } from "react";

function readStored<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const stored = localStorage.getItem(`canadacalc:${key}`);
    if (stored) {
      const parsed = JSON.parse(stored) as T;
      if (
        parsed &&
        initial &&
        typeof parsed === "object" &&
        typeof initial === "object" &&
        !Array.isArray(parsed) &&
        !Array.isArray(initial)
      ) {
        return { ...initial, ...parsed } as T;
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return initial;
}

export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [state, setState] = useState<T>(() => readStored(key, initial));

  useEffect(() => {
    try {
      localStorage.setItem(`canadacalc:${key}`, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);

  const reset = () => {
    setState(initial);
    try {
      localStorage.removeItem(`canadacalc:${key}`);
    } catch {
      /* ignore */
    }
  };

  return [state, setState, reset];
}
