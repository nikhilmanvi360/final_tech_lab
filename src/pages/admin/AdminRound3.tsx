export function AdminRound3() {
  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-red-500 uppercase tracking-widest border-b border-border pb-4">Round 3 Manager</h1>
      
      <div className="bg-black/50 border border-border p-6">
        <h2 className="text-lg font-bold text-gold uppercase mb-4">Phase A: Correct Chain Configuration</h2>
        <input 
          type="text" 
          defaultValue="[1, 2, 3, 4, 5]" 
          className="w-full bg-black border border-border p-3 text-body font-mono block mb-4" 
        />
      </div>

      <div className="bg-black/50 border border-border p-6">
        <h2 className="text-lg font-bold text-gold uppercase mb-4">Phase C: Final Authorization Key</h2>
        <input 
          type="text" 
          defaultValue="DEADROP_2026" 
          className="w-full bg-black border border-border p-3 text-body font-mono block mb-4" 
        />
      </div>

    </div>
  );
}
