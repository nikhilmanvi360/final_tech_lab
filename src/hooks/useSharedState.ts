import { useCallback, useRef, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { db } from "../services/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export function useSharedState<T>(
  key: string,
  initialValue: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const socket = useGameStore((s) => s.socket);

  // Select only the specific key from the shared state to minimize re-renders
  const stateVal = useGameStore((s) => s.sharedState[key]);

  const initialValueRef = useRef(initialValue);
  const val = stateVal !== undefined ? stateVal : initialValueRef.current;

  // 1. Firebase Listener (Primary Real-time)
  useEffect(() => {
    const docRef = doc(db, "shared_states", key);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreVal = docSnap.data().value;
        if (firestoreVal !== undefined) {
          useGameStore.getState().setLocalSharedState(key, firestoreVal);
        }
      }
    }, (error) => {
      console.warn(`Firebase listener failed for key: ${key}. Falling back to Socket.io.`, error);
    });

    return () => unsubscribe();
  }, [key]);

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

      // 2. Firebase Sync (Primary)
      const docRef = doc(db, "shared_states", key);
      setDoc(docRef, { value: resolvedValue }, { merge: true })
        .catch(err => console.warn(`Firebase write failed for key: ${key}.`, err));

      // 3. Socket.io Sync (Secondary Fallback)
      if (socket) {
        socket.emit("update_state", { key, value: resolvedValue });
      }
    },
    [key, socket, initialValue],
  );

  return [val, setter];
}
