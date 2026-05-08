import { Shield, Activity, Users } from 'lucide-react';

export function AdminOverview() {
  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-red-500 uppercase tracking-widest border-b border-border pb-4">Command Overview</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-black border border-border p-6 flex items-center gap-4">
          <Users className="w-10 h-10 text-muted" />
          <div>
            <p className="text-muted text-sm uppercase">Active Teams</p>
            <p className="text-2xl font-bold text-body">3</p>
          </div>
        </div>
        <div className="bg-black border border-border p-6 flex items-center gap-4">
          <Activity className="w-10 h-10 text-muted" />
          <div>
            <p className="text-muted text-sm uppercase">Total Solves</p>
            <p className="text-2xl font-bold text-body">12</p>
          </div>
        </div>
        <div className="bg-black border border-border p-6 flex items-center gap-4">
          <Shield className="w-10 h-10 text-muted" />
          <div>
            <p className="text-muted text-sm uppercase">Platform Status</p>
            <p className="text-2xl font-bold text-green-500">STABLE</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Mock Scoreboard */}
        <div className="border border-border bg-black/50 p-6">
          <h2 className="text-lg font-bold text-gold uppercase mb-4">Live Scoreboard</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="pb-2">Team</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Badges</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 text-white">TEAM_ALPHA</td>
                <td className="py-2 text-gold">850</td>
                <td className="py-2 text-sm text-blue-400">System Restored</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 text-white">TEAM_BETA</td>
                <td className="py-2 text-gold">450</td>
                <td className="py-2 text-sm text-blue-400"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mock Event Log */}
        <div className="border border-border bg-black/50 p-6">
          <h2 className="text-lg font-bold text-gold uppercase mb-4">Recent Events</h2>
          <div className="space-y-4">
            <div className="text-sm border-l-2 border-green-500 pl-3">
              <span className="text-muted">[10:45:00]</span>
              <p className="text-green-400">TEAM_ALPHA solved Round 1 Discrepancy (+200 pts)</p>
            </div>
            <div className="text-sm border-l-2 border-gold pl-3">
              <span className="text-muted">[10:40:15]</span>
              <p className="text-gold">TEAM_BETA connected to Command Server</p>
            </div>
            <div className="text-sm border-l-2 border-red-500 pl-3">
              <span className="text-muted">[10:35:00]</span>
              <p className="text-red-400">Global Event: ARCHIVE Initialized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
