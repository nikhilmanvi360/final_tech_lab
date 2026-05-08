import { X, ShieldAlert, RadioReceiver, TerminalSquare, Users, Database, Code, FileKey } from 'lucide-react';
import React, { useEffect } from 'react';

export function TutorialModal({ onClose }: { onClose: () => void }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-md shadow-[inset_0_0_150px_rgba(220,38,38,0.1)] font-mono">
      <div className="bg-[#050505] border-2 border-red-900/50 w-full max-w-4xl max-h-[90vh] shadow-[0_0_50px_rgba(220,38,38,0.15)] rounded-sm relative flex flex-col overflow-hidden">
        
        {/* Top Secret Stamp Watermark */}
        <div className="absolute top-40 right-10 border-4 border-red-500/5 text-red-500/5 text-6xl font-bold uppercase rotate-12 px-4 py-2 pointer-events-none select-none z-0">
          TOP SECRET
        </div>

        {/* Fixed Header */}
        <div className="border-b border-red-900 bg-red-950/30 p-4 flex justify-between items-center z-20 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest text-sm md:text-xl">
              Classified Dossier // Operation: Red Thread
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-red-500 hover:text-white hover:bg-red-900/50 p-1 transition-colors rounded-sm"
            aria-label="Close Briefing"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-red-100/80 custom-scrollbar z-10">
          
          <section className="space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-xl border-b border-red-900/50 pb-2 flex items-center gap-2">
              <FileKey className="w-5 h-5 text-red-500" /> Mission Objective
            </h3>
            <p className="leading-relaxed bg-black/40 p-4 border-l-4 border-red-500">
              You are assigned to investigate the suspicious death of investigative journalist Priya Singh. Local authorities have closed the case as a natural cardiac event. Our intelligence suggests otherwise. 
              <br/><br/>
              Your primary objective is to breach the network of <span className="text-red-400 font-bold">Sundaram Infrastructure</span>, recover deleted evidence from her local machine, and piece together the final 11 minutes leading up to her death.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-xl border-b border-red-900/50 pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" /> Operative Assignments
            </h3>
            <p className="text-sm text-red-300">This is an asymmetric operation. Operatives have distinct clearances and must collaborate to proceed.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-green-500/30 bg-green-950/20 p-5 relative shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]">
                <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 uppercase border-l border-b border-green-500/30 tracking-widest">Clearance Level 1</div>
                <h4 className="text-green-400 font-bold uppercase flex items-center gap-2 mb-3 text-lg"><TerminalSquare className="w-5 h-5"/> Field Agent</h4>
                <p className="text-sm text-green-100/70 mb-4">Responsible for on-the-ground infiltration, physical map navigation, and raw code execution.</p>
                <div className="space-y-2 text-xs font-bold tracking-wide">
                  <div className="flex justify-between border-b border-green-900/40 pb-1"><span>C / Python Auth</span><span className="text-green-500">AUTHORIZED</span></div>
                  <div className="flex justify-between border-b border-green-900/40 pb-1"><span>Physical Navigation</span><span className="text-green-500">AUTHORIZED</span></div>
                  <div className="flex justify-between pb-1"><span>Security Evasion</span><span className="text-red-500 animate-pulse">BLIND TO BOTS</span></div>
                </div>
              </div>

              <div className="border border-blue-500/30 bg-blue-950/20 p-5 relative shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]">
                <div className="absolute top-0 right-0 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 uppercase border-l border-b border-blue-500/30 tracking-widest">Clearance Level 2</div>
                <h4 className="text-blue-400 font-bold uppercase flex items-center gap-2 mb-3 text-lg"><Database className="w-5 h-5"/> Intel Officer</h4>
                <p className="text-sm text-blue-100/70 mb-4">Provides overwatch, database querying, and high-level structural analysis.</p>
                <div className="space-y-2 text-xs font-bold tracking-wide">
                  <div className="flex justify-between border-b border-blue-900/40 pb-1"><span>HTML / CSS Edit</span><span className="text-blue-500">AUTHORIZED</span></div>
                  <div className="flex justify-between border-b border-blue-900/40 pb-1"><span>SQL DB Analysis</span><span className="text-blue-500">AUTHORIZED</span></div>
                  <div className="flex justify-between pb-1"><span>Overwatch Map</span><span className="text-blue-500">AUTHORIZED</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-950/50 border-l-4 border-red-500 p-4 flex items-start gap-4">
               <div>
                  <h4 className="text-red-400 font-bold uppercase mb-1 tracking-widest">Rules of Engagement</h4>
                  <p className="text-sm text-red-200/80">You do <span className="font-bold underline text-white">not</span> share the same screen capabilities. One operative will see solutions the other cannot. If an interface shows <span className="bg-red-500/20 text-red-400 px-1">ACCESS DENIED</span>, your partner must execute the task. Verbal communication is mandatory for survival.</p>
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-xl border-b border-red-900/50 pb-2">Operation Phases</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-red-900/30 p-4 hover:border-red-500/50 transition-colors">
                <h4 className="text-gold font-bold uppercase flex items-center gap-2 mb-2"><Code className="w-4 h-4"/> 0: Diagnostics</h4>
                <p className="text-xs text-red-200/60">Restore access by patching corrupted HTML/CSS and executing Python decryption tools.</p>
              </div>

              <div className="bg-black/40 border border-red-900/30 p-4 hover:border-red-500/50 transition-colors">
                <h4 className="text-gold font-bold uppercase flex items-center gap-2 mb-2"><RadioReceiver className="w-4 h-4"/> 1: Database Breach</h4>
                <p className="text-xs text-red-200/60">Cross-reference the Post-Mortem. Field Agents scan for clues, Intel runs SQL injections to extract fragments.</p>
              </div>

              <div className="bg-black/40 border border-red-900/30 p-4 hover:border-red-500/50 transition-colors">
                <h4 className="text-gold font-bold uppercase flex items-center gap-2 mb-2"><TerminalSquare className="w-4 h-4"/> 2: Newsroom Infiltration</h4>
                <p className="text-xs text-red-200/60">Field Agents navigate the physical office using WASD. Intel provides overwatch to dodge Sec-Bots. Hack terminals together.</p>
              </div>
              
              <div className="bg-black/40 border border-red-900/30 p-4 hover:border-red-500/50 transition-colors">
                <h4 className="text-gold font-bold uppercase flex items-center gap-2 mb-2"><ShieldAlert className="w-4 h-4"/> 3: Final Verdict</h4>
                <p className="text-xs text-red-200/60">Assemble the chronological timeline of the kill-switch and submit the official dossier.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 mt-8 pt-4 border-t border-red-900/50">
             <div className="bg-red-950/20 border border-red-900/50 p-4">
                <h4 className="text-red-400 font-bold uppercase text-sm mb-2 tracking-widest">SYS_TERMINAL OVERRIDES</h4>
                <p className="text-xs text-red-200/60">A global command terminal exists at the top of your interface. You may intercept hidden override codes (e.g. DEFUSE-XXXX) during the operation. Enter them rapidly to neutralize active security countermeasures.</p>
             </div>
          </section>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-red-900/50 bg-black p-4 flex justify-between items-center z-20 shrink-0">
           <div className="text-[10px] md:text-xs text-red-500/50 font-mono tracking-widest">END OF BRIEFING // DESTROY AFTER READING</div>
           <button 
            onClick={onClose} 
            className="px-6 md:px-8 py-2 bg-red-900/50 border border-red-500 text-red-100 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
           >
             Acknowledge
           </button>
        </div>
      </div>
    </div>
  );
}


