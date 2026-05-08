import { useState } from "react";
import { ShoppingCart, EyeOff, KeySquare } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

export function BlackMarket() {
  const [target, setTarget] = useState("");
  const [acquiredHint, setAcquiredHint] = useState("");
  const teams = ["TEAM_ALPHA", "TEAM_BETA", "TEAM_GAMMA"];

  const buySabotage = async (type: string) => {
    if (!target) return toast.warning("Select a target team first!");
    try {
      await api.post("/api/blackmarket/buy", {
        item: type,
        targetTeam: target,
      });
      toast.success("Sabotage deployed!");
    } catch (e) {
      toast.error("Failed to deploy.");
    }
  };

  const buyHint = async () => {
    try {
      const data = await api.post<any>("/api/broker/hint");
      if (data.success) {
        setAcquiredHint(data.hint);
      }
    } catch (e) {
      toast.error("Failed to contact broker.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-red-500 tracking-widest uppercase flex items-center gap-4">
          <ShoppingCart className="w-8 h-8" /> The Black Market
        </h1>
        <p className="text-muted mt-2">
          Spend your points to gain an illicit advantage over rival operatives.
        </p>
      </div>

      <div className="bg-black/50 border border-border p-6 flex flex-col gap-4">
        <label className="text-gold font-bold uppercase text-sm">
          Target Designation
        </label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="bg-black border border-border p-3 text-white focus:outline-none focus:border-red-500 font-mono w-full max-w-md"
        >
          <option value="">-- SELECT TARGET OPERATIVE --</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-red-500/30 bg-red-900/10 p-8 flex flex-col items-center text-center gap-4">
          <EyeOff className="w-16 h-16 text-red-500" />
          <h3 className="font-bold text-red-500 text-xl uppercase">
            Sensory Deprivation
          </h3>
          <p className="text-sm text-body">
            Deploys a localized payload that inflicts severe visual artifacts on
            the target team's interface for 15 seconds. Disrupts code execution.
          </p>
          <p className="text-gold font-bold font-mono text-lg my-2">50 PTS</p>
          <button
            onClick={() => buySabotage("glitch")}
            className="bg-red-900 border border-red-500 text-white font-bold px-8 py-3 uppercase hover:bg-red-800 transition-colors w-full"
          >
            Deploy
          </button>
        </div>

        <div className="border border-blue-500/30 bg-blue-900/10 p-8 flex flex-col items-center text-center gap-4">
          <KeySquare className="w-16 h-16 text-blue-500" />
          <h3 className="font-bold text-blue-500 text-xl uppercase">
            Information Broker
          </h3>
          <p className="text-sm text-body">
            Purchase encrypted classified intel directly from the broker. This
            acts as a global broadcast and sacrifices your team's score.
          </p>
          <p className="text-gold font-bold font-mono text-lg my-2">50 PTS</p>
          <button
            onClick={buyHint}
            className="bg-blue-900 border border-blue-500 text-white font-bold px-8 py-3 uppercase hover:bg-blue-800 transition-colors w-full"
          >
            Purchase Intel
          </button>

          {acquiredHint && (
            <div className="mt-4 p-4 border border-blue-500/50 bg-black text-blue-400 font-mono text-sm text-left w-full">
              <span className="font-bold text-white block mb-1">
                DECRYPTED PAYLOAD:
              </span>
              {acquiredHint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
