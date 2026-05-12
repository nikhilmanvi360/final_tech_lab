import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CheckCircle, Terminal, Code, FileCode, Lock } from "lucide-react";
import { useSharedState } from "../../hooks/useSharedState";
import { api } from "../../services/api";
import { toast } from "sonner";
import { RoundCutscene } from "../../components/RoundCutscene";

import { MATH_MCQS } from "./mcqData";

const TASKS = [
  {
    id: "HTML",
    title: "Reconstruct the Source List",
    desc: "Priya's article source table is corrupted. Rebuild the HTML to display her verified source list.",
    startingCode:
      "<!-- PRIYA'S SOURCE LOG — TABLE STRUCTURE BROKEN -->\n<tr><td>Source 01: Project Engineer (anonymous)</td><td>VERIFIED</td></tr>\n<tr><td>Source 02: Subcontractor Invoice Leak</td><td>VERIFIED</td></tr>\n<tr><td>Source 03: Shell Company Registration Docs</td><td>VERIFIED</td></tr>",
    hint: "Wrap all rows inside a <table> element.",
    icon: FileCode,
  },
  {
    id: "CSS",
    title: "Reveal the Redacted Name",
    desc: "A name in Priya's encrypted notes has been visually redacted. Override the filter to read the contractor's name.",
    startingCode:
      ".redacted {\n  filter: blur(8px);\n  color: #f4e6c4;\n  /* TODO: Remove the blur to reveal the name */\n}",
    hint: "Set the filter property to 'none'.",
    icon: Code,
  },
  {
    id: "PYTHON",
    title: "Decode the Message Fragment",
    desc: "Priya's final draft contained a Caesar cipher. Decode it to confirm the identity.",
    startingCode:
      "encoded = 'YLNUDP VXQGDUDP'\n# TODO: Decode using Caesar cipher shift -3 and print the result\n",
    hint: "Subtract 3 from each letter's position. Use chr() and ord().",
    icon: Terminal,
  },
];

export function Round0Page() {
  const { team } = useOutletContext<{ team: any }>();
  const playerRole = (team?.playerRole || "").toLowerCase();
  const isIntel = playerRole.includes("intel") || playerRole.includes("2nd year"); // 2nd year = HTML, CSS
  const firstTaskForRole = isIntel ? 0 : 2;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(firstTaskForRole);
  const isTaskAllowed =
    (currentTaskIndex === 0 && isIntel) ||
    (currentTaskIndex === 1 && isIntel) ||
    (currentTaskIndex === 2 && !isIntel);

  const [htmlCode, setHtmlCode] = useSharedState(
    "r0_html",
    TASKS[0].startingCode,
  );
  const [cssCode, setCssCode] = useSharedState("r0_css", TASKS[1].startingCode);
  const [pyCode, setPyCode] = useSharedState("r0_py", TASKS[2].startingCode);

  const [status, setStatus] = useSharedState<Record<string, boolean>>(
    "r0_status",
    { HTML: false, CSS: false, PYTHON: false },
  );
  const [showBriefing, setShowBriefing] = useSharedState("r0_briefing", false);

  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const pyodideLoaded = useRef(false);
  const navigate = useNavigate();
  const [pyodideInstance, setPyodideInstance] = useState<any>(null);
  const [quizScores, setQuizScores] = useState<Record<number, boolean>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const getCode = (index: number) => {
    if (index === 0) return htmlCode;
    if (index === 1) return cssCode;
    return pyCode;
  };

  const code = getCode(currentTaskIndex);

  const handleCodeChange = (val: string) => {
    if (currentTaskIndex === 0) setHtmlCode(val);
    else if (currentTaskIndex === 1) setCssCode(val);
    else setPyCode(val);
  };

  useEffect(() => {
    // Load Pyodide from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.onload = async () => {
      const pyodide = await (window as any).loadPyodide();
      setPyodideInstance(pyodide);
      pyodideLoaded.current = true;
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    setOutput("");
    setError("");
  }, [currentTaskIndex]);

  useEffect(() => {
    setCurrentTaskIndex(firstTaskForRole);
  }, [firstTaskForRole]);

  const handleSubmit = async () => {
    const task = TASKS[currentTaskIndex];
    let isCorrect = false;

    if (task.id === "HTML") {
      isCorrect = code.toLowerCase().includes("<table");
    } else if (task.id === "CSS") {
      isCorrect = code.replace(/\s/g, "").includes("filter:none") || !code.includes("blur");
    } else if (task.id === "PYTHON") {
      if (!pyodideInstance) {
        setError("Python environment still loading...");
        return;
      }
      try {
        pyodideInstance.runPython(`
          import sys
          import io
          sys.stdout = io.StringIO()
        `);
        pyodideInstance.runPython(code);
        const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
        setOutput(stdout);
        isCorrect = stdout.includes("VIKRAM") && stdout.includes("SUNDARAM");
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }

    if (isCorrect) {
      if (!status[task.id]) {
        setStatus((prev) => ({ ...prev, [task.id]: true }));
        // Notify Backend only once per completed task.
        await api.post("/api/r0/submit", { task: task.id });
      }

      if (currentTaskIndex < 2) {
        setTimeout(() => setCurrentTaskIndex((prev) => prev + 1), 1000);
      } else {
        setTimeout(() => setShowBriefing(true), 1500);
      }
    } else {
      setError("VALIDATION FAILED: Output or structure incorrect.");
    }
  };

  if (showIntro) {
    return (
      <RoundCutscene
        roundNumber={0}
        title="Diagnostics"
        subtitle="System Access Restoration"
        description={[
          "Establishing secure link to the Newsroom network...",
          "Warning: Core system files are corrupted or redacted.",
          "Mission: Reconstruct the source list and bypass visual redaction filters.",
          "Note: Field Agents must execute the Python decryption tools to proceed."
        ]}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  if (showBriefing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-3xl font-bold text-gold mb-6 border-b border-border w-full text-center pb-4">
          SYSTEM RESTORED // BRIEFING UNLOCKED
        </h2>
        <div className="bg-black/50 border border-border p-6 max-w-2xl text-sm space-y-4">
          <p className="font-bold text-red-500 uppercase">
            INTERROGATION TRANSCRIPT // R. DASGUPTA
          </p>
          <div className="space-y-4 text-muted">
            <p>
              <span className="text-body font-bold">Q:</span> "Why did you set
              up Priya Mehta's secure workspace personally?"
            </p>
            <p>
              <span className="text-body font-bold">A:</span> "It's standard
              practice. Any journalist working on sensitive stories gets a
              hardened environment. I do it for everyone."
            </p>
            <p>
              <span className="text-body font-bold">Q:</span> "What is
              workspace_monitor.exe?"
            </p>
            <p>
              <span className="text-body font-bold">A:</span> "A basic system
              health monitor. CPU usage, memory, that sort of thing. I install
              it on all staff machines."
            </p>
            <p>
              <span className="text-body font-bold">Q:</span> "Where were you on
              the night of April 11th into the 12th?"
            </p>
            <p>
              <span className="text-body font-bold">A:</span> "Home. Asleep. I
              have nothing to do with what happened to Priya."
            </p>
          </div>
          <div className="p-2 border border-red-900/50 bg-red-900/10 text-red-400 mt-4 font-bold">
            [NOTE: Server room access log shows Rohan entered at 02:58 AM.]
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-8 px-6 py-2 bg-gold text-black font-bold uppercase w-full"
          >
            Return to Board
          </button>
        </div>
      </div>
    );
  }

  const currentTask = TASKS[currentTaskIndex];
  const isCurrentTaskComplete = status[currentTask.id];
  const canMoveNext =
    currentTaskIndex < TASKS.length - 1 &&
    (!isTaskAllowed || isCurrentTaskComplete);
  const canUnlockBriefing =
    currentTaskIndex === TASKS.length - 1 && isCurrentTaskComplete;

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-border pr-6 flex flex-col gap-4">
        {TASKS.map((t, idx) => {
          const Icon = t.icon;
          const isDone = status[t.id];
          const isActive = idx === currentTaskIndex;

          return (
            <div
              key={t.id}
              className={`p-4 border ${isActive ? "bg-black/40 border-gold" : "border-border/50 bg-background"} flex items-center gap-4 transition-all`}
            >
              <Icon
                className={`w-6 h-6 ${isDone ? "text-green-500" : isActive ? "text-gold" : "text-muted"}`}
              />
              <div className="flex-1 font-bold">{t.id}</div>
              {isDone && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          );
        })}
      </div>

      {/* Editor Main */}
      <div className="w-2/4 flex flex-col gap-4">
        <div className="border border-border p-4 bg-black/40">
          <h2 className="text-xl font-bold text-gold uppercase">
            {currentTask.title}
          </h2>
          <p className="text-muted mt-2 text-sm">{currentTask.desc}</p>
          <p className="text-red-400 mt-2 text-xs font-bold uppercase">
            HINT: {currentTask.hint}
          </p>
        </div>

        {isTaskAllowed ? (
          <div className="flex-1 flex gap-4 min-h-0">
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 bg-black text-body font-mono p-4 border border-border focus:outline-none focus:border-gold resize-none"
            />
            {(currentTask.id === "HTML" || currentTask.id === "CSS") && (
              <div className="flex-1 bg-[#f4f4f4] text-black border border-border overflow-auto relative">
                <div className="absolute top-0 left-0 right-0 bg-gray-200 border-b border-gray-300 text-gray-500 font-mono text-xs p-1 px-2 uppercase flex justify-between items-center">
                  <span>Live Browser Preview</span>
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 block"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-400 block"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400 block"></span>
                  </span>
                </div>
                <div className="p-4 mt-6">
                  {currentTask.id === "CSS" && (
                    <div className="text-sm text-gray-500 mb-4 border-b pb-2">
                      This preview renders the HTML from Task 1, applying your
                      CSS.
                    </div>
                  )}
                  <style>{cssCode}</style>
                  <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-black/50 text-body font-mono p-4 border border-border flex flex-col opacity-90 overflow-y-auto">
            <div className="flex flex-col items-center justify-center mb-6 mt-4 border-b border-border/50 pb-6">
              <Lock className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-muted text-sm uppercase text-center font-bold">
                Encrypted File Type
              </p>
              <p className="text-xs text-red-400 mt-2 text-center max-w-lg">
                Your operative profile lacks the necessary decryption keys for
                this task. Only{" "}
                {isIntel ? "Field Agents (Year 1)" : "Intel Officers (Year 2)"}{" "}
                can access this module. Coordinate with them.
              </p>
              {!isIntel && (
                <div className="mt-4 bg-blue-900/20 border border-blue-500/50 p-4 text-blue-300 text-xs w-full max-w-2xl text-center">
                  <strong>IDLE TIME DETECTED:</strong> Please complete the
                  Discrete Mathematical Structures quiz while waiting for the
                  Intel Officers.
                </div>
              )}
            </div>

            {!isIntel && (
              <div className="space-y-6 max-w-2xl mx-auto w-full pb-8">
                <div className="flex justify-between items-center bg-blue-900/30 p-4 border border-blue-500/50">
                  <div>
                    <h3 className="text-blue-300 font-bold">
                      Discrete Mathematics Diagnostic
                    </h3>
                    <p className="text-blue-400 text-xs mt-1">
                      Answer questions to earn bonus points for your team.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono text-gold font-bold">
                      {Object.values(quizScores).filter(Boolean).length} /{" "}
                      {MATH_MCQS.length}
                    </div>
                    <div className="text-blue-300 text-xs">Score</div>
                  </div>
                </div>
                {MATH_MCQS.map((mcq, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-black/40 border border-white/10 p-4"
                  >
                    <p className="font-bold text-blue-100 text-sm mb-3">
                      {qIdx + 1}. {mcq.q}
                    </p>
                    <div className="space-y-2">
                      {mcq.options.map((opt, optIdx) => {
                        const isSelectedAndCorrect =
                          quizScores[qIdx] === true && mcq.a === optIdx;
                        const isSelectedAndWrong =
                          quizScores[qIdx] === false && mcq.a !== optIdx;
                        // Just simple instant feedback: if they click, we show outcome?
                        // Wait, let's keep it simple. They click an option, and it turns green if correct, or red if wrong, and permanently sets it?
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (quizScores[qIdx] !== undefined) return;
                              setQuizScores((prev) => ({
                                ...prev,
                                [qIdx]: optIdx === mcq.a,
                              }));
                            }}
                            disabled={quizScores[qIdx] !== undefined}
                            className={`w-full text-left text-xs p-2 border ${
                              quizScores[qIdx] === undefined
                                ? "border-white/10 hover:bg-white/5 hover:border-white/30"
                                : optIdx === mcq.a
                                  ? "bg-green-900/30 border-green-500 text-green-300" // Always highlight correct answer once answered
                                  : quizScores[qIdx] === false &&
                                      optIdx !== mcq.a
                                    ? "opacity-50 border-white/5" // Dim other wrong options
                                    : "opacity-50 border-white/5"
                            } transition-colors`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(quizScores).length > 0 && (
                  <button
                    onClick={async () => {
                      if (quizSubmitted) return;
                      const score =
                        Object.values(quizScores).filter(Boolean).length;
                      try {
                        await api.post("/api/systems/win", { score });
                        setQuizSubmitted(true);
                        toast.success(
                          `Quiz submitted! You earned ${score * 10} bonus points for your team!`,
                        );
                      } catch (err: any) {
                        if (err.status === 409) {
                          setQuizSubmitted(true);
                          toast.warning("Math assessment was already submitted.");
                        } else {
                          toast.error("Failed to submit quiz score.");
                        }
                      }
                    }}
                    disabled={
                      quizSubmitted ||
                      Object.keys(quizScores).length < MATH_MCQS.length
                    }
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {quizSubmitted
                      ? "Quiz Score Submitted"
                      : Object.keys(quizScores).length < MATH_MCQS.length
                      ? `Answer all ${MATH_MCQS.length} questions to submit...`
                      : "Submit Quiz for Bonus Points"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isTaskAllowed}
          className="bg-border border border-gold text-gold font-bold py-3 uppercase hover:bg-gold hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status[currentTask.id] ? "Verify Again" : "Execute & Verify"}
        </button>

        <div className="flex justify-between items-center mt-2">
          <button
            onClick={() =>
              setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))
            }
            disabled={currentTaskIndex === 0}
            className="px-4 py-2 border border-border text-muted hover:text-gold hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs font-bold transition"
          >
            &lt; Previous Task
          </button>
          <button
            onClick={() => {
              if (
                currentTaskIndex === TASKS.length - 1 &&
                status[TASKS[currentTaskIndex].id]
              ) {
                setShowBriefing(true);
              } else {
                setCurrentTaskIndex(
                  Math.min(TASKS.length - 1, currentTaskIndex + 1),
                );
              }
            }}
            disabled={
              currentTaskIndex === TASKS.length - 1
                ? !canUnlockBriefing
                : !canMoveNext
            }
            className="px-4 py-2 border border-border text-muted hover:text-gold hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs font-bold transition"
          >
            {currentTaskIndex === TASKS.length - 1
              ? "Unlock Briefing >"
              : "Next Task >"}
          </button>
        </div>
      </div>

      {/* Preview Pane */}
      <div className="w-1/4 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-muted uppercase tracking-widest border-b border-border pb-2">
          {currentTask.id === "PYTHON" ? "Terminal Output" : "Workspace Status"}
        </h3>
        <div className="flex-1 bg-black border border-border p-4 overflow-auto space-y-8">
          {currentTask.id === "PYTHON" && (
            <div>
              <h4 className="text-xs text-muted mb-2 uppercase">
                Python Decryption Link
              </h4>
              <div className="border border-border p-2 min-h-[100px] bg-black">
                {error ? (
                  <p className="text-red-500 text-xs break-words">[{error}]</p>
                ) : output ? (
                  <pre className="text-green-400 whitespace-pre-wrap text-xs">
                    {output}
                  </pre>
                ) : status.PYTHON ? (
                  <pre className="text-green-400 whitespace-pre-wrap text-xs">
                    VIKRAM SUNDARAM
                  </pre>
                ) : (
                  <p className="text-muted text-xs italic">
                    Awaiting Python Execution...
                  </p>
                )}
              </div>
            </div>
          )}
          {currentTask.id !== "PYTHON" && (
            <div className="text-muted text-xs italic">
              Live visualization is active in the main workspace. System
              monitoring background tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
