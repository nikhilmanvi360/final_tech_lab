import { useState, type FC } from "react";
import { FolderOpen, X, CheckCircle, XCircle } from "lucide-react";
import { useSharedState } from "../hooks/useSharedState";

export interface EvidenceItem {
  id: string;
  source: string;
  summary: string;
  details?: string;
  status: "new" | "key" | "irrelevant";
}

export function EvidenceDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [evidence, setEvidence] = useSharedState<EvidenceItem[]>("global_evidence", []);

  const toggleStatus = (id: string, newStatus: "key" | "irrelevant" | "new") => {
    setEvidence(
      evidence.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const keyEvidence = evidence.filter(e => e.status === "key");
  const newEvidence = evidence.filter(e => e.status === "new");
  const irrelevantEvidence = evidence.filter(e => e.status === "irrelevant");

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gold text-black p-4 rounded-full shadow-lg shadow-black/50 hover:bg-yellow-400 transition transform hover:scale-110 z-40 flex items-center gap-2"
        title="Open Evidence Board"
      >
        <FolderOpen className="w-6 h-6" />
        {newEvidence.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            {newEvidence.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#0a0a0c] border-l border-border h-full shadow-2xl flex flex-col font-serif">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black">
              <h2 className="text-xl font-bold text-gold flex items-center gap-2 uppercase tracking-widest font-sans">
                <FolderOpen className="w-5 h-5" />
                Evidence Pinboard
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
              {evidence.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 font-sans italic">
                  No evidence gathered yet. Keep investigating.
                </div>
              ) : (
                <>
                  {/* Key Evidence */}
                  {keyEvidence.length > 0 && (
                    <div>
                      <h3 className="font-bold text-green-400 uppercase tracking-widest mb-3 border-b border-green-900/50 pb-1 font-sans">
                        Key Findings
                      </h3>
                      <div className="space-y-3">
                        {keyEvidence.map(item => (
                          <EvidenceCard key={item.id} item={item} onToggle={toggleStatus} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New / Unsorted */}
                  {newEvidence.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gold uppercase tracking-widest mb-3 border-b border-gold/30 pb-1 font-sans mt-6">
                        Unsorted Evidence
                      </h3>
                      <div className="space-y-3">
                        {newEvidence.map(item => (
                          <EvidenceCard key={item.id} item={item} onToggle={toggleStatus} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Irrelevant */}
                  {irrelevantEvidence.length > 0 && (
                    <div className="opacity-50 hover:opacity-100 transition-opacity">
                      <h3 className="font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1 font-sans mt-6">
                        Marked Irrelevant
                      </h3>
                      <div className="space-y-3">
                        {irrelevantEvidence.map(item => (
                          <EvidenceCard key={item.id} item={item} onToggle={toggleStatus} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type EvidenceCardProps = {
  item: EvidenceItem;
  onToggle: (id: string, s: "key" | "irrelevant" | "new") => void;
};

const EvidenceCard: FC<EvidenceCardProps> = ({ item, onToggle }) => {
  return (
    <div className={`p-3 border relative overflow-hidden bg-black/40 ${
      item.status === 'key' ? 'border-green-500/50' :
      item.status === 'irrelevant' ? 'border-red-900/50 grayscale' :
      'border-gold/30'
    }`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" style={{ color: item.status === 'key' ? '#22c55e' : item.status === 'irrelevant' ? '#ef4444' : '#fbbf24' }}></div>
      <div className="flex justify-between items-start mb-2 ml-2">
        <span className="text-[10px] uppercase font-bold text-gray-500 font-sans tracking-wider">{item.source}</span>
        <div className="flex gap-1">
          {item.status !== "key" && (
            <button onClick={() => onToggle(item.id, "key")} className="text-gray-500 hover:text-green-400" title="Mark Key">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {item.status !== "irrelevant" && (
            <button onClick={() => onToggle(item.id, "irrelevant")} className="text-gray-500 hover:text-red-400" title="Mark Irrelevant">
              <XCircle className="w-4 h-4" />
            </button>
          )}
          {item.status !== "new" && (
            <button onClick={() => onToggle(item.id, "new")} className="text-gray-500 hover:text-gold text-xs font-sans tracking-wide px-1" title="Unmark">
              Reset
            </button>
          )}
        </div>
      </div>
      <p className="ml-2 font-bold text-gray-200">{item.summary}</p>
      {item.details && <p className="ml-2 mt-1 text-xs text-gray-400 italic">{item.details}</p>}
    </div>
  );
};
