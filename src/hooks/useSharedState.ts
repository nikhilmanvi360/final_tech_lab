import { useCallback, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

export function useSharedState<T>(
  key: string,
  initialValue: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const socket = useGameStore((s) => s.socket);

  // Select only the specific key from the shared state to minimize re-renders
  const stateVal = useGameStore((s) => s.sharedState[key]);

  // Use a ref to keep initialValue stable across renders
  const initialValueRef = useRef(initialValue);
  const val = stateVal !== undefined ? stateVal : initialValueRef.current;

  const setter = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const currentState = useGameStore.getState().sharedState;
      const currentVal =
        currentState[key] !== undefined ? currentState[key] : initialValue;

      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as any)(currentVal)
          : newValue;

      // Update local state instantly for UI responsiveness
      useGameStore.getState().setLocalSharedState(key, resolvedValue);

      // Broadcast patch via socket
      if (socket) {
        socket.emit("update_state", { key, value: resolvedValue });
      }
    },
    [key, socket, initialValue],
  );

  return [val, setter];
}
