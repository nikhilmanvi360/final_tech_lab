import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { LogOut, TerminalSquare, HelpCircle } from "lucide-react";
import { TutorialModal } from "./TutorialModal";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { useGameStore } from "../store/useGameStore";
import { api } from "../services/api";

function OperationTimer() {
  if (!localStorage.getItem("ttOs_startTime")) {
    localStorage.setItem("ttOs_startTime", Date.now().toString());
  }
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    const start = parseInt(localStorage.getItem("ttOs_startTime") || "0", 10);
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimeLeft(Math.max(0, 14400 - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(timeLeft / 3600).toString().padStart(2, "0");
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <span
      className={`font-mono text-xl font-bold tracking-widest ${timeLeft < 3600 ? "text-red-500 animate-pulse" : "text-blue-400"}`}
    >
      {h}:{m}:{s}
    </span>
  );
}

export function Layout({
  team,
  onLogout,
}: {
  team: any;
  onLogout: () => void;
}) {
  const {
    tickerEvents,
    isSabotaged,
    systemLockout,
    multiplier,
    activeRoles,
    addTickerEvent,
    setSabotaged,
    setSystemLockout,
    setMultiplier,
    setActiveRoles,
    setFullSharedState,
    patchSharedState,
    setSocket,
  } = useGameStore();

  const [globalCmd, setGlobalCmd] = useState("");
  const [cmdRes, setCmdRes] = useState("");
  const [socketInstance, setSocketInstance] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    let lockoutInterval: NodeJS.Timeout;
    if (systemLockout > 0) {
      lockoutInterval = setInterval(
        () => setSystemLockout(Math.max(0, systemLockout - 1)),
        1000,
      );
    }
    return () => clearInterval(lockoutInterval);
  }, [systemLockout, setSystemLockout]);

  useEffect(() => {
    const socket = io();
    setSocketInstance(socket);
    setSocket(socket);

    // Join Team Room
    socket.emit("join_team", { teamName: team.name, role: team.playerRole });

    socket.on("team_status", (data: any) => {
      setActiveRoles(data.activeRoles || []);
    });

    socket.on("score_event", (event: any) => {
      addTickerEvent(event.message);
    });

    socket.on("sabotage", (data: any) => {
      if (data.target === team.name) {
        setSabotaged(true);
        setTimeout(() => setSabotaged(false), 15000);
      }
    });

    socket.on("lockout_event", (data: any) => {
      if (data.target === team.name) {
        setSystemLockout(data.duration / 1000);
      }
    });

    socket.on("multiplier_update", (data: any) => {
      setMultiplier(data.multiplier);
    });

    socket.on("sync_state_full", (fullState: any) => {
      setFullSharedState(fullState);
    });

    socket.on("sync_state_patch", (patch: { key: string; value: any }) => {
      patchSharedState(patch.key, patch.value);
    });

    return () => {
      socket.disconnect();
    };
  }, [
    team.name,
    team.playerRole,
    setActiveRoles,
    addTickerEvent,
    setSabotaged,
    setSystemLockout,
    setMultiplier,
    setFullSharedState,
    patchSharedState,
    setSocket,
  ]);

  const submitGlobalCmd = async () => {
    if (!globalCmd) return;
    try {
      const data = await api.post<any>("/api/terminal/execute", {
        command: globalCmd,
      });
      setCmdRes("ACCEPTED");
      setTimeout(() => setCmdRes(""), 3000);
      setGlobalCmd("");
    } catch (e) {
      setCmdRes("ERROR");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      onLogout();
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-background text-body font-mono ${isSabotaged ? "animate-glitch" : ""}`}
    >
      {systemLockout > 0 && (
        <div className="fixed inset-0 z-[100] bg-red-950/90 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm shadow-[inset_0_0_150px_rgba(220,38,38,0.5)]">
          <div className="text-red-500 font-bold text-6xl tracking-widest uppercase mb-6 animate-pulse border-y-4 border-red-500 py-4">
            Security Lockdown
          </div>
          <p className="text-red-200 text-xl font-mono">
            Excessive invalid queries detected. Systems frozen.
          </p>
          <div className="mt-8 text-8xl font-bold text-white font-mono">
            {systemLockout}s
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-black/40">
        <div className="flex items-center gap-2 text-gold font-bold text-xl tracking-widest">
          <TerminalSquare className="w-6 h-6" />
          <span>TECH DETECTIVE</span>
        </div>

        <div className="flex items-center gap-6">
          {multiplier > 1 && (
            <div className="hidden lg:flex px-4 py-1 border border-blue-500 bg-blue-900/30 text-blue-400 font-bold uppercase animate-pulse">
              Overclock Active: {multiplier}X Multiplier
            </div>
          )}
          <Link
            to="/blackmarket"
            className="text-muted hover:text-red-500 transition-colors font-bold uppercase underline"
          >
            Black Market
          </Link>
          {team.role === "admin" && (
            <Link
              to="/admin"
              className="text-muted hover:text-gold transition-colors font-bold uppercase underline"
            >
              Admin Panel
            </Link>
          )}

          {/* 4 Hour Countdown Timer */}
          <div className="hidden md:flex flex-col items-center bg-black/60 border border-red-900/50 p-2 min-w-[120px]">
            <span className="text-[10px] text-muted uppercase">
              OPERATION TIME
            </span>
            <OperationTimer />
          </div>

          <div className="text-right border-r border-border pr-6 hidden sm:block">
            <p className="text-sm text-muted">ACTIVE OPERATIVES</p>
            <div className="flex flex-col gap-1 mt-1">
              <div
                className={`text-xs ${activeRoles.some((r) => r.includes("1st Year")) ? "text-green-500" : "text-muted/30 uppercase"} flex items-center gap-1`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${activeRoles.some((r) => r.includes("1st Year")) ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-transparent border border-muted/30"}`}
                ></span>
                Field Agent (Year 1)
              </div>
              <div
                className={`text-xs ${activeRoles.some((r) => r.includes("2nd Year")) ? "text-blue-500" : "text-muted/30 uppercase"} flex items-center gap-1`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${activeRoles.some((r) => r.includes("2nd Year")) ? "bg-blue-500 shadow-[0_0_5px_#3b82f6]" : "bg-transparent border border-muted/30"}`}
                ></span>
                Intel Officer (Year 2)
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted uppercase border-b border-border pb-1">
              YOUR IDENTITY
            </p>
            <p className="font-bold text-red-500 uppercase mt-1">{team.name}</p>
            <p className="text-xs text-muted mt-1 uppercase">
              {team.playerRole}
            </p>
          </div>
          <div className="text-right bg-black/20 p-2 rounded border border-border">
            <p className="text-xs text-muted uppercase">TEAM SCORE</p>
            <p className="font-bold text-gold text-2xl">{team.score}</p>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="text-muted hover:text-gold transition-colors ml-4 p-2 items-center flex flex-col gap-1"
          >
            <HelpCircle className="w-5 h-5 mx-auto" />
            <span className="text-[10px] uppercase font-bold tracking-widest hidden md:inline">
              HELP
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="text-muted hover:text-gold transition-colors p-2 items-center flex flex-col gap-1"
          >
            <LogOut className="w-5 h-5 mx-auto" />
            <span className="text-[10px] uppercase font-bold tracking-widest hidden md:inline">
              DISCONNECT
            </span>
          </button>
        </div>
      </header>

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      {/* Live Ticker */}
      <div className="bg-border text-gold text-xs py-1 px-4 overflow-hidden whitespace-nowrap overflow-ellipsis border-b border-black">
        <span className="font-bold mr-4 uppercase">/// LIVE FEED ///</span>
        {tickerEvents[0]}
      </div>

      {/* Global SYS_TERMINAL */}
      <div className="bg-black border-b border-border flex px-6 py-2 text-sm font-mono items-center gap-4 shadow-inner">
        <span className="text-red-500 font-bold uppercase tracking-widest">
          SYS_TERMINAL &gt;
        </span>
        <input
          type="text"
          className="flex-1 bg-transparent text-green-500 font-bold focus:outline-none placeholder-green-900"
          placeholder="Execute global overrides here (e.g. DEFUSE-XXXX)..."
          value={globalCmd}
          onChange={(e) => setGlobalCmd(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submitGlobalCmd()}
        />
        {cmdRes && (
          <span
            className={`font-bold ${cmdRes === "ACCEPTED" ? "text-green-500" : "text-red-500"}`}
          >
            [{cmdRes}]
          </span>
        )}
      </div>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <Outlet context={{ team, socket: socketInstance }} />
      </main>
      <EvidenceDrawer />
    </div>
  );
}
