import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";

/**
 * Custom hook that synchronizes a ref with a given value.
 *
 * @template T - The type of the value to be synchronized.
 * @param {T} value - The value to be synchronized with the ref.
 * @returns {React.MutableRefObject<T>} - A ref object that is kept in sync with the given value.
 */
export const useSyncRef = <T,>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

export const useSyncRefWithState = <T,>(value: T) => {
  const [state, setState] = useState(value);
  const ref = useRef(state);
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return [ref, state, setState] as const;
};

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
