import { useState, FormEvent } from "react";
import { TerminalSquare, Lock, Users, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import { authService } from "../services/authService";

export function Login({ onLogin }: { onLogin: (session: any) => void }) {
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [playerRole, setPlayerRole] = useState(
    () =>
      localStorage.getItem("playerRole") || "1st Year Student (Field Agent)",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Primary: Firebase Auth
      let userData: any;
      try {
        const firebaseUser = await authService.loginTeam(teamName, password);
        const profile = await authService.getTeamProfile(firebaseUser.uid);
        userData = {
          id: firebaseUser.uid,
          name: teamName,
          role: profile?.role || "detective",
          score: profile?.score || 0,
          playerRole
        };
      } catch (fbErr: any) {
        console.warn("Firebase Auth failed, trying REST fallback...", fbErr);
        // 2. Fallback: REST API
        const data = await api.post<any>("/api/auth/login", {
          teamName,
          password,
        });
        userData = { ...data.team, playerRole };
      }

      onLogin(userData);
      localStorage.setItem("playerRole", playerRole);
    } catch (err: any) {
      let errorMessage = err.message || "Connection to ARCHIVE failed.";

      if (errorMessage.includes("Invalid credentials") || err.code === 'auth/invalid-credential') {
        errorMessage =
          "ACCESS DENIED: Authentication failed. Please verify your team identity and clearance code.";
      } else if (errorMessage.toLowerCase().includes("disabled")) {
        errorMessage =
          "ACCOUNT LOCKED: Your team has been disabled by ARCHIVE administrators.";
      } else if (errorMessage.includes("Too many attempts") || err.code === 'auth/too-many-requests') {
        errorMessage =
          "RATE LIMITED: Security protocol initiated. Please wait 60 seconds before retrying.";
      } else if (errorMessage.includes("wrong-password") || err.code === 'auth/wrong-password') {
        errorMessage = "INVALID CODE: The clearance code provided does not match our records.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md border border-border p-8 bg-black/50 shadow-[0_0_15px_rgba(212,160,23,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <TerminalSquare className="w-12 h-12 text-gold mb-4" />
          <h1 className="text-2xl font-bold text-gold tracking-[0.2em] text-center">
            DEAD DROP
          </h1>
          <p className="text-muted mt-2 uppercase text-sm tracking-widest text-center">
            Secure Access Required
            <br />
            Multiplayer Operative Protocol
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 text-sm font-mono flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">[ERROR]</span> {error}
              </div>
            </div>
          )}

          <div>
            <label className="block text-muted text-xs uppercase mb-2">
              Team Identity
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-background border border-border text-body p-3 font-mono focus:outline-none focus:border-gold transition-colors"
              placeholder="Enter designated team name..."
              required
            />
          </div>

          <div>
            <label className="block text-muted text-xs uppercase mb-2">
              Clearance Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border text-body p-3 font-mono focus:outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-muted text-xs uppercase mb-2">
              Select Operative Role
            </label>
            <div className="flex bg-black border border-border rounded-sm overflow-hidden text-sm uppercase">
              <button
                type="button"
                onClick={() => setPlayerRole("1st Year Student (Field Agent)")}
                className={`flex-1 py-3 text-center transition-colors ${playerRole.startsWith("1st") ? "bg-gold text-black font-bold" : "text-muted hover:bg-white/5"}`}
              >
                1st Year Student <br />
                (Field Agent)
              </button>
              <button
                type="button"
                onClick={() =>
                  setPlayerRole("2nd Year Student (Intel Officer)")
                }
                className={`flex-1 py-3 text-center transition-colors border-l border-border ${playerRole.startsWith("2nd") ? "bg-blue-500 text-black font-bold" : "text-muted hover:bg-white/5"}`}
              >
                2nd Year Student <br />
                (Intel Officer)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-border hover:bg-gold hover:text-background text-gold font-bold py-3 px-4 border border-gold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {loading ? "AUTHENTICATING..." : "ESTABLISH LINK"}
          </button>
        </form>
      </div>
    </div>
  );
}
