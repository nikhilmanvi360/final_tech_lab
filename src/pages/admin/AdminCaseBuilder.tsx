import React, { useState } from "react";
import { Database, Plus, Save, Server, Trash2 } from "lucide-react";

export function AdminCaseBuilder() {
  const [activeTab, setActiveTab] = useState<"clues" | "events">("clues");

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-red-500 uppercase tracking-widest flex items-center gap-4">
          <Database className="w-8 h-8" /> Case Builder
        </h1>
        <button className="bg-gold text-black px-6 py-2 hover:bg-yellow-500 transition uppercase font-bold text-sm tracking-widest">
          <Server className="w-4 h-4 inline mr-2" /> Sync to Database
        </button>
      </div>

      <p className="text-muted text-sm">
        Modify the dynamically generated clues, events, and injection parameters
        used throughout the operative rounds. Note: Syncing may disrupt active
        games.
      </p>

      <div className="flex gap-4 border-b border-border">
        {["clues", "events"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-bold uppercase transition ${activeTab === tab ? "text-gold border-b-2 border-gold pb-2" : "text-muted hover:text-white pb-3"}`}
          >
            {tab === "clues"
              ? "Map Clues (Round 2)"
              : "Timeline Events (Round 3)"}
          </button>
        ))}
      </div>

      <div className="bg-black/50 border border-border p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        {activeTab === "clues" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white uppercase flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" /> Registered Map
                Clues
              </h2>
              <button className="text-green-500 hover:text-green-400 font-bold uppercase text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Clue Node
              </button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-border/50 bg-[#0a0a0c] p-4 flex gap-4 items-start"
                >
                  <div className="w-1/3">
                    <label className="text-xs text-muted uppercase font-bold mb-1 block">
                      Entity Title
                    </label>
                    <input
                      type="text"
                      defaultValue={`Objective Node ${i}`}
                      className="w-full bg-black border border-border p-2 text-white font-mono text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted uppercase font-bold mb-1 block">
                      Content / Dialogue
                    </label>
                    <textarea className="w-full bg-black border border-border p-2 text-muted font-mono text-sm h-10"></textarea>
                  </div>
                  <div className="pt-6">
                    <button className="text-red-500 hover:text-red-400 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white uppercase flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" /> Timeline Cards
              </h2>
              <button className="text-green-500 hover:text-green-400 font-bold uppercase text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Event
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="border border-border/50 bg-[#0a0a0c] p-4 flex gap-4 items-center"
                >
                  <div className="bg-black border border-border p-2 text-center w-12 font-bold text-gold">
                    {i}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      defaultValue={`Timeline Event Fragment 00${i}`}
                      className="w-full bg-transparent border-b border-border p-2 text-white font-mono text-sm outline-none focus:border-gold"
                    />
                  </div>
                  <button className="text-red-500 hover:text-red-400 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
