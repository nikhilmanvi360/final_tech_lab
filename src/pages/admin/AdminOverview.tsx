import { Shield, Activity, Users, Unlock, Lock, Play, Square } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const ROUNDS = [
  { id: 'round0', label: 'Phase 0: Diagnostics', color: 'emerald' },
  { id: 'round1', label: 'Phase 1: Database Breach', color: 'blue' },
  { id: 'round2', label: 'Phase 2: Newsroom Infiltration', color: 'red' },
  { id: 'round3', label: 'Phase 3: Final Verdict', color: 'purple' },
];

export function AdminOverview() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundState, setRoundState] = useState<Record<string, boolean>>({
    round0: true, round1: false, round2: false, round3: false,
  });
  const [roundLoading, setRoundLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const d = await api.get<any>("/api/admin/teams");
        if (d.teams) setTeams(d.teams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchRounds = async () => {
      try {
        const d = await api.get<any>("/api/admin/rounds");
        if (d.roundState) setRoundState(d.roundState);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
    fetchRounds();
  }, []);

  const toggleRound = async (roundId: string, unlock: boolean) => {
    setRoundLoading(true);
    try {
      const data = await api.post<any>("/api/admin/rounds", { round: roundId, unlocked: unlock });
      if (data.roundState) setRoundState(data.roundState);
    } catch (err) {
      console.error(err);
    } finally {
      setRoundLoading(false);
    }
  };

  const openAllRounds = async () => {
    setRoundLoading(true);
    for (const r of ROUNDS) {
      await api.post<any>("/api/admin/rounds", { round: r.id, unlocked: true }).catch(() => {});
    }
    setRoundState({ round0: true, round1: true, round2: true, round3: true });
    setRoundLoading(false);
  };

  const lockAllRounds = async () => {
    setRoundLoading(true);
    for (const r of ROUNDS) {
      await api.post<any>("/api/admin/rounds", { round: r.id, unlocked: false }).catch(() => {});
    }
    setRoundState({ round0: false, round1: false, round2: false, round3: false });
    setRoundLoading(false);
  };

  const activeTeamsCount = teams.filter(t => t.is_online).length;
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-red-500 uppercase tracking-widest border-b border-border pb-4">Command Overview</h1>

      <div className="grid grid-cols-3 gap-6">
        {[
          { icon: Users, label: "Active Teams", value: loading ? "..." : activeTeamsCount, color: "text-blue-400" },
          { icon: Activity, label: "Total Capacity", value: loading ? "..." : teams.length, color: "text-gold" },
          { icon: Shield, label: "Platform Pulse", value: "STABLE", color: "text-green-500" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/60 backdrop-blur-md border border-white/10 p-6 flex items-center gap-5 group hover:border-white/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="p-3 bg-white/5 rounded-lg">
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div>
              <p className="text-muted text-[10px] uppercase tracking-[0.2em] mb-1 font-black">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Round Control */}
      <div className="bg-black border border-red-900/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-5 h-5" /> Round Control
          </h2>
          <div className="flex gap-3">
            <button
              onClick={openAllRounds}
              disabled={roundLoading}
              className="px-4 py-2 bg-green-900 border border-green-500 text-green-300 text-xs font-bold uppercase hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Unlock All
            </button>
            <button
              onClick={lockAllRounds}
              disabled={roundLoading}
              className="px-4 py-2 bg-red-900 border border-red-500 text-red-300 text-xs font-bold uppercase hover:bg-red-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Lock All
            </button>
            <button
              onClick={async () => {
                if (window.confirm("WARNING: This will clear all team clues, inventories, and positions. Proceed?")) {
                  try {
                    await api.post("/api/admin/reset-state", {});
                    alert("Game state reset successful.");
                  } catch (e) {
                    alert("Failed to reset state.");
                  }
                }
              }}
              className="px-4 py-2 bg-gray-900 border border-dashed border-gray-500 text-gray-400 text-xs font-bold uppercase hover:bg-gray-800 transition flex items-center gap-2"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROUNDS.map((round) => {
            const isUnlocked = roundState[round.id];
            return (
              <div
                key={round.id}
                className={`flex items-center justify-between p-4 border transition-colors ${
                  isUnlocked
                    ? 'border-green-500/40 bg-green-900/10'
                    : 'border-border/50 bg-black/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isUnlocked ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`} />
                  <div>
                    <p className="font-bold text-sm text-white uppercase">{round.label}</p>
                    <p className={`text-xs font-bold mt-0.5 ${isUnlocked ? 'text-green-400' : 'text-red-400'}`}>
                      {isUnlocked ? '● ACTIVE / UNLOCKED' : '■ LOCKED'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleRound(round.id, !isUnlocked)}
                  disabled={roundLoading}
                  className={`px-4 py-2 text-xs font-bold uppercase border transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    isUnlocked
                      ? 'border-red-500/60 text-red-400 hover:bg-red-900/30'
                      : 'border-green-500/60 text-green-400 hover:bg-green-900/30'
                  }`}
                >
                  {isUnlocked ? (
                    <><Square className="w-3 h-3" /> Stop</>
                  ) : (
                    <><Play className="w-3 h-3" /> Start</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-muted text-xs mt-4 uppercase tracking-wider">
          ⚡ Changes broadcast instantly to all connected teams — no refresh needed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Live Scoreboard */}
        <div className="border border-border bg-black/50 p-6">
          <h2 className="text-lg font-bold text-gold uppercase mb-4">Live Scoreboard</h2>
          {loading ? (
            <p className="text-muted">Loading scoreboard...</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted border-b border-border">
                  <th className="pb-2">Team</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-2 text-white flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${team.is_online ? "bg-blue-400" : "bg-gray-600"}`} />
                      {team.name}
                    </td>
                    <td className="py-2 text-gold">{team.score}</td>
                    <td className="py-2 text-sm text-blue-400">{team.is_disabled ? "DISABLED" : "ACTIVE"}</td>
                  </tr>
                ))}
                {sortedTeams.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted">No teams found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Round Status Summary */}
        <div className="border border-border bg-black/50 p-6">
          <h2 className="text-lg font-bold text-gold uppercase mb-4">Round Status</h2>
          <div className="space-y-3">
            {ROUNDS.map(r => (
              <div key={r.id} className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-sm text-muted uppercase">{r.label}</span>
                <span className={`text-xs font-bold px-2 py-1 border ${roundState[r.id] ? 'border-green-500/50 text-green-400 bg-green-900/20' : 'border-red-500/50 text-red-400'}`}>
                  {roundState[r.id] ? 'ACTIVE' : 'LOCKED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
