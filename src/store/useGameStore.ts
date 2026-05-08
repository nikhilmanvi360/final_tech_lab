import { create } from "zustand";

interface GameState {
  // Local Game State
  tickerEvents: string[];
  isSabotaged: boolean;
  systemLockout: number;
  multiplier: number;
  activeRoles: string[];
  socket: any;

  // Shared Multiplayer State (Synced via Websockets)
  sharedState: Record<string, any>;

  // Actions
  setSocket: (socket: any) => void;
  addTickerEvent: (msg: string) => void;
  setSabotaged: (val: boolean) => void;
  setSystemLockout: (val: number) => void;
  setMultiplier: (val: number) => void;
  setActiveRoles: (roles: string[]) => void;

  setFullSharedState: (state: Record<string, any>) => void;
  patchSharedState: (key: string, value: any) => void;
  setLocalSharedState: (key: string, value: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
  tickerEvents: [
    "System online. Awaiting commands...",
    "ARCHIVE core active...",
  ],
  isSabotaged: false,
  systemLockout: 0,
  multiplier: 1,
  activeRoles: [],
  socket: null,
  sharedState: {},

  setSocket: (socket) => set({ socket }),
  addTickerEvent: (msg) =>
    set((s) => ({
      tickerEvents: [`[NEW EVENT] ${msg}`, ...s.tickerEvents].slice(0, 5),
    })),
  setSabotaged: (val) => set({ isSabotaged: val }),
  setSystemLockout: (val) => set({ systemLockout: val }),
  setMultiplier: (val) => set({ multiplier: val }),
  setActiveRoles: (roles) => set({ activeRoles: roles }),

  setFullSharedState: (newState) => set({ sharedState: newState }),
  patchSharedState: (key, value) =>
    set((s) => ({ sharedState: { ...s.sharedState, [key]: value } })),
  setLocalSharedState: (key, value) =>
    set((s) => ({ sharedState: { ...s.sharedState, [key]: value } })),
}));
