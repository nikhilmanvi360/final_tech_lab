import { useState } from "react";
import { AlertTriangle, Lock, Unlock, Database } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BreachProtocol } from "./BreachProtocol";
import { useSharedState } from "../../hooks/useSharedState";
import { api } from "../../services/api";
import { toast } from "sonner";
import { RoundCutscene } from "../../components/RoundCutscene";

const PHASE_A_CARDS = [
  {
    id: 1,
    text: "Rohan Dasgupta installed workspace_monitor.exe on Priya's laptop 6 weeks before her death",
  },
  {
    id: 2,
    text: "workspace_monitor.exe contained a hidden cleanup_routine function not listed in any manifest",
  },
  {
    id: 3,
    text: "Vikram Sundaram called Rohan Dasgupta at 02:47 AM on April 12th — 17 minutes before the wipe",
  },
  {
    id: 4,
    text: "Remote API call from Sundaram Infrastructure IP sent at 03:04:17 AM",
  },
  {
    id: 5,
    text: "ARCHIVE logged REMOTE_WIPE_EXECUTED at 03:04:17 AM — 11 minutes before death was reported",
  },
  {
    id: 6,
    text: 'Priya texted Dev Sharma at 02:51 AM: "I have the names. All of them."',
  },
  {
    id: 7,
    text: "ARCHIVE's final auto-save: 03:04:16 AM — 1 second before the kill signal",
  },
  {
    id: 8,
    text: "Priya's death reported at 03:15 AM — 11 minutes after kill signal",
  },
  {
    id: 9,
    text: "IMD data: no storm in Delhi on April 12th — police explanation disproved",
  },
  {
    id: 10,
    text: "19 of 23 subcontractors were shell companies — ₹47 crore routed back to Sundaram",
  },
  {
    id: 11,
    text: "Rohan accessed server room at 02:58 AM — 11 minutes after Sundaram's call",
  },
  {
    id: 12,
    text: "Priya's medical records show mild hypertension — consistent with cardiac arrest theory",
  },
];

const CORRECT_CHAIN = [1, 2, 3, 4, 5];

const ROUND3_INTRO = {
  title: "Final Verdict",
  subtitle: "Operational Dossier Assembly",
  description: [
    "Compiling all recovered evidence fragments...",
    "Establishing a secure broadcast to the independent tribunal.",
    "Warning: Sundaram's legal team is attempting a network shutdown.",
    "Mission: Reconstruct the chronological kill-signal timeline and file the official verdict.",
    "Objective: Secure justice for Priya Mehta before the link is lost."
  ]
};

export function Round3Page() {
  const { team } = useOutletContext<{ team: any }>();
  const isIntel = team?.playerRole?.includes("Intel");
  const [showIntro, setShowIntro] = useState(true);
  // Active Tab remains local so members can look at different things
  const [activeTab, setActiveTab] = useState<"A" | "B" | "C">("A");

  const [phaseAChain, setPhaseAChain] = useSharedState<number[]>(
    "r3_phaseA",
    [],
  );
  const [phaseAStatus, setPhaseAStatus] = useSharedState<
    "PENDING" | "SUCCESS" | "ERROR"
  >("r3_phaseAStatus", "PENDING");

  const [phaseBAnswers, setPhaseBAnswers] = useSharedState<
    Record<string, string>
  >("r3_phaseB", {});
  const [phaseBStatus, setPhaseBStatus] = useSharedState<"PENDING" | "FILED">(
    "r3_phaseBStatus",
    "PENDING",
  );

  const [phaseCStatus, setPhaseCStatus] = useSharedState<
    "LOCKED" | "PENDING" | "SUCCESS" | "ERROR"
  >("r3_phaseCStatus", "LOCKED");

  const [showFinalReveal, setShowFinalReveal] = useSharedState(
    "r3_reveal",
    false,
  );
  const navigate = useNavigate();

  const handleCardClick = (id: number) => {
    if (phaseAStatus === "SUCCESS") return;
    if (phaseAChain.includes(id)) {
      setPhaseAChain(phaseAChain.filter((cid) => cid !== id));
    } else if (phaseAChain.length < 5) {
      setPhaseAChain([...phaseAChain, id]);
    }
  };

  const submitPhaseA = () => {
    const isCorrect =
      JSON.stringify(phaseAChain) === JSON.stringify(CORRECT_CHAIN);
    if (isCorrect) {
      setPhaseAStatus("SUCCESS");
      setPhaseCStatus("PENDING");
      toast.success("SYSTEM STABILIZED. Evidence chain verified.");
    } else {
      setPhaseAStatus("ERROR");
      // Trigger Brute Force Penalty tracker
      api.post("/api/systems/fail").catch(() => {});
      setTimeout(() => setPhaseAStatus("PENDING"), 2000);
    }
  };

  const submitPhaseC = () => {
    api.post("/api/r3/claim").catch(() => {});
    setPhaseCStatus("SUCCESS");
    setTimeout(() => setShowFinalReveal(true), 1500);
  };

  const handleStartOver = () => {
    setPhaseAChain([]);
    setPhaseAStatus("PENDING");
    setPhaseCStatus("LOCKED");
    setActiveTab("A");
  };

  if (showFinalReveal) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-gold font-mono">
        <div className="max-w-3xl space-y-6 text-xl leading-relaxed">
          <h1 className="text-4xl font-bold border-b border-gold pb-4 mb-8 text-center tracking-widest uppercase">
            The Case is Complete
          </h1>
          <p>They found the 847 drafts Priya left behind.</p>
          <p>They traced the call at 02:47 AM.</p>
          <p>They read the logs that said REMOTE_WIPE_EXECUTED.</p>
          <p>
            They understood that 11 minutes is not a coincidence.
            <br />
            It is a timeline.
          </p>
          <p>
            Rohan Dasgupta has been detained.
            <br />
            Vikram Sundaram's offices are under search.
          </p>
          <p>
            Priya wrote at 03:04:16 AM:
            <br />
            "The contractor who signed off was Vikram Sundaram."
          </p>
          <p className="text-white mt-8">
            She trusted ARCHIVE to hold the story.
            <br />
            ARCHIVE held it. You came looking.
          </p>
          <p className="text-2xl font-bold text-center mt-12 text-green-500 tracking-widest">
            — ARCHIVE / OFFLINE
          </p>
          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gold text-black font-bold uppercase transition hover:bg-yellow-500"
            >
              Return to Base
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <RoundCutscene
        roundNumber={3}
        title={ROUND3_INTRO.title}
        subtitle={ROUND3_INTRO.subtitle}
        description={ROUND3_INTRO.description}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col pt-2 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-gold uppercase tracking-widest flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500" /> OPERATION VERDICT
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleStartOver}
            className="px-6 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 font-bold text-sm uppercase transition-all flex items-center"
          >
            Start Over
          </button>
          {["A", "B", "C"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-2 font-bold text-lg transition-all ${activeTab === tab ? "bg-gold text-black" : "bg-black/50 text-gold border border-gold hover:bg-gold/20"}`}
            >
              PHASE {tab}
            </button>
          ))}
          {team?.role === "admin" && (
            <button
              onClick={() => {
                setPhaseAStatus("SUCCESS");
                setPhaseBStatus("FILED");
                setPhaseCStatus("PENDING");
              }}
              className="px-6 py-2 border border-purple-500 border-dashed text-purple-400 hover:bg-purple-900/30 hover:text-white font-bold text-sm uppercase transition-all ml-4"
              title="Unlock all phases for testing"
            >
              [ADMIN] Overide
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-black/40 border border-border p-8 overflow-y-auto relative">
        {/* PHASE A - TIMELINE CHAIN */}
        {activeTab === "A" && (
          <div className="space-y-8 flex flex-col h-full relative">
            {isIntel && (
              <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm border-2 border-red-500/50">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest mb-2">
                  Access Restricted
                </h2>
                <p className="text-center text-muted max-w-md">
                  Your access level does not permit compiling behavioral
                  evidence timelines. Your Field Agent partner must complete
                  this chronological sort.
                </p>
              </div>
            )}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2 uppercase">
                Establish Timeline
              </h2>
              <p className="text-muted text-sm">
                Select 5 evidence fragments in chronological order to
                reconstruct the kill signal methodology.
              </p>
            </div>

            {/* Submission Slots */}
            <div className="flex gap-4 justify-center">
              {[0, 1, 2, 3, 4].map((idx) => {
                const cardId = phaseAChain[idx];
                const card = PHASE_A_CARDS.find((c) => c.id === cardId);
                return (
                  <div
                    key={idx}
                    className="w-1/5 min-h-[120px] p-4 text-xs xl:text-sm border-2 border-dashed border-border bg-black/60 text-white flex items-center justify-center text-center cursor-pointer hover:border-red-500 transition-colors"
                    onClick={() => cardId && handleCardClick(cardId)}
                  >
                    {card ? (
                      card.text
                    ) : (
                      <span className="text-muted/50">SLOT {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Verification Button */}
            <div className="flex justify-center">
              <button
                onClick={submitPhaseA}
                disabled={
                  phaseAChain.length !== 5 || phaseAStatus === "SUCCESS"
                }
                className={`px-8 py-3 font-bold uppercase transition-all tracking-widest w-1/3 ${
                  phaseAStatus === "SUCCESS"
                    ? "bg-green-600 text-white"
                    : phaseAStatus === "ERROR"
                      ? "bg-red-600 text-white"
                      : phaseAChain.length === 5
                        ? "bg-gold text-black hover:bg-yellow-500"
                        : "bg-border text-muted cursor-not-allowed"
                }`}
              >
                {phaseAStatus === "SUCCESS"
                  ? "CHAIN VERIFIED"
                  : phaseAStatus === "ERROR"
                    ? "INCORRECT CHAIN"
                    : "Verify Timeline"}
              </button>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-4 gap-4 mt-8 flex-1">
              {PHASE_A_CARDS.map((card) => {
                const isSelected = phaseAChain.includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`p-4 text-xs flex items-center justify-center text-center border cursor-pointer transition-all min-h-[100px] ${
                      isSelected
                        ? "border-gold bg-gold/10 text-gold opacity-50"
                        : "border-border bg-background hover:border-gold hover:text-gold"
                    }`}
                  >
                    {card.text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE B - RADIO VERDICT */}
        {activeTab === "B" && (
          <div className="space-y-8 max-w-4xl mx-auto relative">
            {!isIntel && (
              <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm border-2 border-red-500/50">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest mb-2">
                  Access Restricted
                </h2>
                <p className="text-center text-muted max-w-md">
                  Your operative profile lacks permissions to file official
                  verdicts. This action requires an Intel Officer. Coordinate
                  with your partner to transmit the answers.
                </p>
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-6 uppercase text-center border-b border-border pb-4">
              Official Assessment
            </h2>

            <div className="space-y-6">
              <div className="bg-black/60 p-6 border border-border">
                <p className="font-bold text-gold mb-4 uppercase">
                  1. Who ordered the kill switch to be triggered?
                </p>
                <div className="space-y-3 pl-4">
                  {[
                    "Vikram Sundaram",
                    "Rohan Dasgupta",
                    "Inspector R. Varma",
                    "An anonymous hacker",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer text-white hover:text-gold transition-colors"
                    >
                      <input
                        type="radio"
                        name="q1"
                        value={opt}
                        onChange={() =>
                          setPhaseBAnswers({ ...phaseBAnswers, q1: opt })
                        }
                        className="accent-gold w-4 h-4 cursor-pointer"
                        disabled={phaseBStatus === "FILED"}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-black/60 p-6 border border-border">
                <p className="font-bold text-gold mb-4 uppercase">
                  2. What was the true purpose of workspace_monitor.exe?
                </p>
                <div className="space-y-3 pl-4">
                  {[
                    "To remotely destroy evidence of Priya's story on command",
                    "To back up Priya's files securely",
                    "To monitor Priya's internet usage",
                    "To protect her machine from external hackers",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer text-white hover:text-gold transition-colors"
                    >
                      <input
                        type="radio"
                        name="q2"
                        value={opt}
                        onChange={() =>
                          setPhaseBAnswers({ ...phaseBAnswers, q2: opt })
                        }
                        className="accent-gold w-4 h-4 cursor-pointer"
                        disabled={phaseBStatus === "FILED"}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-black/60 p-6 border border-border">
                <p className="font-bold text-gold mb-4 uppercase">
                  3. What single piece of evidence disproves the official cause
                  of death?
                </p>
                <div className="space-y-3 pl-4">
                  {[
                    "ARCHIVE's kill signal log at 03:04:17 AM — 11 minutes before death was reported",
                    "Priya's medical records showing hypertension",
                    "Dev Sharma's testimony about her text",
                    "The absence of storm data from IMD",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer text-white hover:text-gold transition-colors"
                    >
                      <input
                        type="radio"
                        name="q3"
                        value={opt}
                        onChange={() =>
                          setPhaseBAnswers({ ...phaseBAnswers, q3: opt })
                        }
                        className="accent-gold w-4 h-4 cursor-pointer"
                        disabled={phaseBStatus === "FILED"}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPhaseBStatus("FILED")}
                disabled={
                  Object.keys(phaseBAnswers).length < 3 ||
                  phaseBStatus === "FILED"
                }
                className="w-full py-4 text-center font-bold tracking-widest uppercase transition-all bg-gold text-black disabled:bg-border disabled:text-muted"
              >
                {phaseBStatus === "FILED"
                  ? "Dossier Filed // Pending Review"
                  : "Submit Verdict"}
              </button>
            </div>
          </div>
        )}

        {/* PHASE C - AUTHORIZATION */}
        {activeTab === "C" && (
          <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6">
            {phaseCStatus === "LOCKED" ? (
              <div className="text-center">
                <Lock className="w-24 h-24 text-red-500 mb-4 mx-auto" />
                <h2 className="text-2xl font-bold text-red-500 tracking-widest uppercase">
                  Access Denied
                </h2>
                <p className="text-muted">
                  Phase A Timeline must be stabilized before Final Override keys
                  are accepted.
                </p>
                <button
                  onClick={() => setActiveTab("A")}
                  className="mt-8 px-6 py-2 border border-border text-white hover:bg-border transition-colors"
                >
                  Return to Phase A
                </button>
              </div>
            ) : phaseCStatus === "SUCCESS" ? (
              <div className="text-center">
                <Database className="w-24 h-24 mb-4 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-green-500 tracking-widest uppercase mt-8 animate-pulse">
                  EVIDENCE PACKAGE TRANSMITTED
                </h2>
              </div>
            ) : (
              <div className="w-full">
                <h2 className="text-2xl font-bold text-gold tracking-widest uppercase mb-4 text-center border-b border-gold/30 pb-4">
                  Terminal Override Sequence
                </h2>
                <BreachProtocol
                  onSuccess={submitPhaseC}
                  onFail={() => {
                    api.post("/api/systems/fail").catch(() => {});
                    setPhaseCStatus("ERROR");
                    setTimeout(() => setPhaseCStatus("PENDING"), 2000);
                  }}
                />
                {phaseCStatus === "ERROR" && (
                  <div className="mt-4 p-4 bg-red-900 border border-red-500 text-red-100 text-center font-bold uppercase tracking-widest animate-pulse">
                    BUFFER OVERFLOW // TRACE COMPROMISED // TRY AGAIN
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
