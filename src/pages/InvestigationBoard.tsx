import { Link, useOutletContext } from 'react-router-dom';
import { ShieldAlert, FileSearch, Code, RadioReceiver, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const CASES = [
  { id: 'round0', title: 'Phase 0: Diagnostics', desc: 'Restore system access. Patch corrupted HTML/CSS and execute Python decryption tools.', points: 150, icon: Code, link: '/round0', time: '30 MIN' },
  { id: 'round1', title: 'Phase 1: Database Breach', desc: 'Cross-reference the Post-Mortem Report. Scan for clues and run SQL injections to extract fragments.', points: 200, icon: FileSearch, link: '/round1', time: '60 MIN' },
  { id: 'round2', title: 'Phase 2: Newsroom Infiltration', desc: 'Infiltrate the physical space. Dodge Sec-Bots, interact with witnesses & hack terminals.', points: 300, icon: RadioReceiver, link: '/round2', time: '120 MIN' },
  { id: 'round3', title: 'Phase 3: Final Verdict', desc: 'Assemble the chronological timeline of the kill-switch and submit the official dossier.', points: 500, icon: ShieldAlert, link: '/round3', time: '30 MIN' },
];

export function InvestigationBoard() {
  const { team } = useOutletContext<{ team: any }>();
  const isAdmin = team?.role === 'admin';
  const socket = useGameStore((s) => s.socket);

  // Default: round0 open, rest locked
  const [roundState, setRoundState] = useState<Record<string, boolean>>({
    round0: true,
    round1: false,
    round2: false,
    round3: false,
  });

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { roundState: Record<string, boolean> }) => {
      setRoundState(data.roundState);
    };
    socket.on('round_state_update', handler);
    return () => { socket.off('round_state_update', handler); };
  }, [socket]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-gold uppercase tracking-widest mb-2">Investigation Board</h1>
        <p className="text-muted text-sm">Select an active module to proceed. Locked modules require admin authorization. Total operation time: 4 HOURS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {CASES.map((c) => {
          const Icon = c.icon;
          const isUnlocked = isAdmin || roundState[c.id];
          return (
            <Link
              key={c.id}
              to={isUnlocked ? c.link : '#'}
              className={`p-6 border flex gap-6 transition-all duration-300 ${
                isUnlocked
                  ? 'border-border bg-black/20 hover:border-gold hover:shadow-[0_0_15px_rgba(212,160,23,0.1)] cursor-pointer group'
                  : 'border-border/40 bg-black/10 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`p-4 rounded-sm self-start ${isUnlocked ? 'bg-border text-gold group-hover:bg-gold group-hover:text-black' : 'bg-background text-muted'}`}>
                {isUnlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-body uppercase">{c.title}</h2>
                  <span className={`text-xs px-2 py-1 font-bold border ${isUnlocked ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}`}>
                    {isUnlocked ? (isAdmin && !roundState[c.id] ? 'ADMIN ACCESS' : 'ACTIVE') : 'LOCKED'}
                  </span>
                </div>
                <p className="text-muted text-sm mb-4">{c.desc}</p>
                <div className="flex justify-between items-center">
                  <p className="text-gold text-xs font-bold font-mono">REWARD: +{c.points} PTS</p>
                  <p className="text-blue-400 text-xs font-bold font-mono bg-blue-900/20 px-2 py-1 border border-blue-500/30">EST: {c.time}</p>
                </div>
              </div>
            </Link>
          );
        })}</div>
    </div>
  );
}
