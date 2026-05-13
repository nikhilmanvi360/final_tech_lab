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

          <button
            type="button"
            onClick={async () => {
              const randomId = Math.floor(1000 + Math.random() * 9000);
              const guestName = `GUEST_${randomId}`;
              setTeamName(guestName);
              setPassword("test");
              // Wait for state updates then submit would be better, but we can call handle manually
              setLoading(true);
              setError("");
              try {
                const data = await api.post<any>("/api/auth/login", {
                  teamName: guestName,
                  password: "test",
                });
                onLogin({ ...data.team, playerRole });
                localStorage.setItem("playerRole", playerRole);
              } catch (err: any) {
                setError("Quick link protocol failed. Use manual credentials.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="mt-2 bg-transparent hover:bg-gold/10 text-gold/60 hover:text-gold text-xs font-mono py-2 px-4 border border-gold/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 group uppercase tracking-widest"
          >
            [ QUICK LINK: GUEST ACCESS ]
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-muted tracking-widest">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const user = await authService.loginWithGoogle();
                const profile = await authService.getTeamProfile(user.uid);
                onLogin({
                  id: user.uid,
                  name: profile?.name || user.displayName,
                  role: profile?.role || "detective",
                  score: profile?.score || 0,
                  playerRole
                });
                localStorage.setItem("playerRole", playerRole);
              } catch (err: any) {
                setError(err.message || "Google Authentication failed.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="bg-black hover:bg-white/5 text-white py-3 px-4 border border-border transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group font-mono text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Operative ID
          </button>
        </form>
      </div>
    </div>
  );
}
