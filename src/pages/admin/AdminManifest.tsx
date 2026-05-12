import React from 'react';
import { BookOpen, Key, Terminal, Map, ShieldAlert } from 'lucide-react';

export function AdminManifest() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <BookOpen className="w-8 h-8 text-gold" />
        <h1 className="text-3xl font-bold text-gold uppercase tracking-widest">Game Manifest (Answers)</h1>
      </div>

      <p className="text-muted text-lg">
        This document contains all correct sequences, locations, and passwords for the entire TT_OS experience. Do not share with players.
      </p>

      {/* Round 0 */}
      <div className="bg-black border border-border p-6">
        <h2 className="text-2xl font-bold text-emerald-500 uppercase flex items-center gap-2 mb-4">
          <Terminal className="w-6 h-6" /> Round 0: Diagnostics
        </h2>
        <div className="space-y-4 font-mono text-sm">
          <p className="text-muted mb-2">Intel Officers repair code while Field Agents complete a Discrete Math diagnostic.</p>
          <div className="bg-[#1a140f] border border-border/50 p-4 space-y-2 text-green-400">
            <p><span className="text-emerald-400">Task 1 (HTML):</span> Wrap the broken list in a <code className="bg-white/10 px-1">&lt;table&gt;</code> element.</p>
            <p><span className="text-emerald-400">Task 2 (CSS):</span> Remove the blur by setting <code className="bg-white/10 px-1">filter: none;</code> on the .redacted class.</p>
            <p><span className="text-emerald-400">Task 3 (Python):</span> Decode the Caesar Cipher (shift -3) on "YLNUDP VXQGDUDP" to reveal <code className="bg-white/10 px-1 font-bold">VIKRAM SUNDARAM</code>.</p>
            <p><span className="text-emerald-400">Math Diagnostic:</span> Field Agents answer 30 MCQ questions to earn bonus points.</p>
          </div>
        </div>
      </div>

      {/* Round 1 */}
      <div className="bg-black border border-border p-6">
        <h2 className="text-2xl font-bold text-blue-500 uppercase flex items-center gap-2 mb-4">
          <Terminal className="w-6 h-6" /> Round 1: SQL Injection
        </h2>
        <div className="space-y-4 font-mono text-sm">
          <p className="text-muted mb-2">Players must execute these approximate SQL queries to uncover 5 contradictions.</p>
          <div className="bg-[#1a140f] border border-border/50 p-4 space-y-2 text-green-400">
            <p><span className="text-blue-400">Query 1 (Weather):</span> SELECT * FROM weather_reports WHERE date = '2026-04-12';</p>
            <p><span className="text-blue-400">Query 2 (IP Trace):</span> SELECT * FROM ip_registry WHERE ip_address = '203.45.17.88';</p>
            <p><span className="text-blue-400">Query 3 (Bribe):</span> SELECT * FROM police_financials WHERE officer_name = 'R. VARMA';</p>
            <p><span className="text-blue-400">Query 4 (Access):</span> SELECT * FROM access_logs WHERE zone = 'SERVER_ROOM';</p>
            <p><span className="text-blue-400">Query 5 (Phone):</span> SELECT * FROM phone_records WHERE caller = 'V. SUNDARAM';</p>
          </div>
        </div>
      </div>

      {/* Round 2 */}
      <div className="bg-black border border-border p-6">
        <h2 className="text-2xl font-bold text-red-500 uppercase flex items-center gap-2 mb-4">
          <Map className="w-6 h-6" /> Round 2: Schematic Recon
        </h2>
        <div className="space-y-6">
          <p className="text-muted font-mono text-sm">Players navigate a 2D map to collect 6 clues and bypass guards.</p>
          
          <div className="space-y-4">
            <h3 className="font-bold text-gold uppercase border-b border-white/10 pb-1">Required Clue Interactions</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong className="text-blue-300">Dev Sharma (NPC in Newsroom):</strong> Dialogue path {'->'} "Tell me about Priya" {'->'} "What did she say?"</li>
              <li><strong className="text-blue-300">IT Assistant (NPC in IT Room):</strong> Dialogue path {'->'} "Where's Rohan?" {'->'} "What was he doing?"</li>
              <li><strong className="text-gold">IT Terminal:</strong> Navigate to folder and cat file {'->'} <code className="bg-white/10 px-1 text-green-400">cat var/log/server_0412.txt</code></li>
              <li><strong className="text-blue-300">Editor (NPC in Editor's Office):</strong> Dialogue path {'->'} "Who?" {'->'} "You ignored it."</li>
              <li><strong className="text-gold">Archive Terminal:</strong> Obtain KEY_ARCHIVE, enter vault. {'->'} <code className="bg-white/10 px-1 text-green-400">cat backups/draft_bridge_FINAL.enc</code></li>
              <li><strong className="text-blue-300">CEO Vikram Sundaram (NPC in Exec Suite):</strong> Requires 4 previous clues. Dialogue path {'->'} "It's over."</li>
              <li><strong className="text-gold">CEO Terminal:</strong> Requires KEY_EXEC. {'->'} <code className="bg-white/10 px-1 text-green-400">cat private/directive.txt</code></li>
              <li><strong className="text-gold">CCTV Terminal (Garage):</strong> Requires KEY_GARAGE. {'->'} <code className="bg-white/10 px-1 text-green-400">cat feeds/cam_04.mp4</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Round 3 */}
      <div className="bg-black border border-border p-6">
        <h2 className="text-2xl font-bold text-purple-500 uppercase flex items-center gap-2 mb-4">
          <ShieldAlert className="w-6 h-6" /> Round 3: The Board & Final Override
        </h2>
        
        <div className="space-y-6 lg:flex lg:gap-6 lg:space-y-0">
          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-gold uppercase border-b border-white/10 pb-1">Phase A: Timeline Sorting</h3>
            <p className="text-sm text-muted">Proper chronological order of events:</p>
            <ol className="list-decimal pl-6 space-y-2 text-sm bg-white/5 p-4 border border-white/10">
              <li>Rohan Dasgupta installed workspace_monitor.exe</li>
              <li>workspace_monitor.exe contained a hidden cleanup_routine</li>
              <li>Vikram Sundaram calls Rohan (02:47 AM)</li>
              <li>Remote API call from Sundaram IP (03:04:17 AM)</li>
              <li>ARCHIVE logs REMOTE_WIPE (03:04:17 AM)</li>
            </ol>
            <p className="text-xs text-muted font-mono mt-2">Card IDs array: [1, 2, 3, 4, 5]</p>
          </div>

          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-gold uppercase border-b border-white/10 pb-1">Phase B: Narrative Matrix</h3>
            <div className="bg-white/5 p-4 border border-white/10 space-y-4 text-sm">
              <div>
                <strong className="block text-white/50 mb-1">WHO ordered the hit?</strong>
                <span className="text-purple-400 font-bold tracking-widest text-lg">VIKRAM SUNDARAM</span>
              </div>
              <div>
                <strong className="block text-white/50 mb-1">HOW was the data destroyed?</strong>
                <span className="text-purple-400 font-bold tracking-widest text-lg">REMOTE_WIPE</span>
              </div>
              <div>
                <strong className="block text-white/50 mb-1">WHY was Priya targeted?</strong>
                <span className="text-purple-400 font-bold tracking-widest text-lg">CORRUPTION_EXPOSURE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="font-bold text-gold uppercase border-b border-white/10 pb-1 mb-4">Phase C: Breathing Protocol</h3>
          <p className="text-sm text-green-400 font-mono">
            Players must complete the Breach Protocol minigame. They must click a sequence of Hex codes, alternating between rows and columns, to match the target sequence.
          </p>
        </div>
      </div>

    </div>
  );
}
