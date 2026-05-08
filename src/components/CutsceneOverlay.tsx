import { useEffect, useState, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Cutscene Data ────────────────────────────────────────────────────────────

export type CutsceneId = "phase_0_to_1" | "phase_1_to_2" | "phase_2_to_3";

interface CutsceneFrame {
  duration: number; // ms
  content: ReactNode;
}

interface CutsceneConfig {
  id: CutsceneId;
  title: string;
  frames: CutsceneFrame[];
  accentColor: string;
  glowColor: string;
  skipAllowed: boolean;
}

// ─── Individual Frame Components ─────────────────────────────────────────────

function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)",
        backgroundSize: "100% 2px",
      }}
    />
  );
}

function GlitchText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [glitched, setGlitched] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitched(true);
      setTimeout(() => setGlitched(false), 80);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`${className} transition-all ${glitched ? "opacity-60 translate-x-[2px] skew-x-2" : ""}`}
      style={{ display: "inline-block" }}
    >
      {text}
    </span>
  );
}

function TypewriterText({
  text,
  delay = 0,
  speed = 30,
  className,
}: {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">▌</span>
      )}
    </span>
  );
}

// ─── Cutscene Configs ──────────────────────────────────────────────────────

const CUTSCENES: Record<CutsceneId, CutsceneConfig> = {
  phase_0_to_1: {
    id: "phase_0_to_1",
    title: "Phase 0 → 1",
    accentColor: "#d4a017",
    glowColor: "rgba(212,160,23,0.3)",
    skipAllowed: true,
    frames: [
      {
        duration: 3000,
        content: (
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-xs font-mono text-red-500 tracking-[0.5em] uppercase"
            >
              /// OPERATION: RED THREAD ///
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl md:text-7xl font-black tracking-widest uppercase"
              style={{
                color: "#d4a017",
                textShadow: "0 0 40px rgba(212,160,23,0.8), 0 0 80px rgba(212,160,23,0.4)",
              }}
            >
              <GlitchText text="THE CASE" className="" />
              <br />
              <GlitchText text="IS RE-OPENED" className="" />
            </motion.div>
          </div>
        ),
      },
      {
        duration: 5000,
        content: (
          <div className="flex flex-col items-center justify-center gap-8 text-center max-w-3xl">
            {/* Breaking News Bar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full bg-red-700 border-l-8 border-red-400 px-6 py-3 text-left"
            >
              <span className="text-white font-black text-xs uppercase tracking-widest mr-4">
                ⚡ BREAKING
              </span>
              <span className="text-white font-mono text-sm">
                Priya Singh Death — New Evidence Emerges From Whistleblower
              </span>
            </motion.div>

            {/* CCTV Frame */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="relative border-2 border-green-700/50 bg-black/80 p-2 w-80 h-44 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/10 to-transparent animate-pulse" />
              <div className="text-green-500 font-mono text-xs absolute top-2 left-2">
                CAM_04 // SUNDARAM TOWER
              </div>
              <div className="text-green-500 font-mono text-xs absolute top-2 right-2">
                REC ● 23:49:11
              </div>
              <div className="absolute bottom-2 left-2 text-green-400 font-mono text-[10px]">
                MOTION DETECTED // FLOOR 14
              </div>
              {/* Simulated grainy building */}
              <div
                className="absolute inset-0 mt-6"
                style={{
                  background:
                    "radial-gradient(ellipse at bottom, #0a1a0a 0%, #000 100%)",
                }}
              >
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-28 bg-gradient-to-t from-gray-900 to-gray-800 border border-gray-700">
                  {/* window lights */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-1.5 bg-yellow-400/70"
                      style={{
                        top: `${15 + (i % 3) * 25}%`,
                        left: i < 3 ? "20%" : "55%",
                        opacity: Math.random() > 0.3 ? 0.8 : 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-green-500 font-mono text-sm"
            >
              <TypewriterText
                text="> ARCHIVE access restored. Database modules loading..."
                delay={0}
                speed={40}
              />
            </motion.div>
          </div>
        ),
      },
      {
        duration: 4000,
        content: (
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-black uppercase tracking-widest text-white"
            >
              CLEARANCE GRANTED
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent max-w-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="font-mono text-green-400 text-xl tracking-wider"
            >
              <TypewriterText
                text="PHASE 1: DATABASE BREACH — INITIATING"
                speed={45}
                delay={800}
              />
            </motion.div>
          </div>
        ),
      },
    ],
  },

  phase_1_to_2: {
    id: "phase_1_to_2",
    title: "Phase 1 → 2",
    accentColor: "#ef4444",
    glowColor: "rgba(239,68,68,0.35)",
    skipAllowed: true,
    frames: [
      {
        duration: 3000,
        content: (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-red-900/80 border-y-4 border-red-500 py-6 px-8 max-w-2xl"
            >
              <div className="text-red-300 font-mono text-xs tracking-[0.4em] mb-2 uppercase">
                ⚠ Security Alert // Priority: CRITICAL
              </div>
              <div
                className="text-4xl font-black uppercase tracking-widest"
                style={{
                  color: "#ff4444",
                  textShadow: "0 0 30px rgba(255,68,68,0.9)",
                }}
              >
                <GlitchText text="INTRUDER DETECTED" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1] }}
              transition={{ delay: 0.5, duration: 1.5, times: [0, 0.3, 0.6, 1] }}
              className="text-red-400 font-mono text-lg tracking-widest animate-pulse"
            >
              NEWSROOM SECURITY — MOBILIZED
            </motion.div>
          </div>
        ),
      },
      {
        duration: 6000,
        content: (
          <div className="flex gap-6 items-center justify-center w-full max-w-4xl">
            {/* Left: Terminal */}
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="flex-1 bg-black border border-green-800 p-4 font-mono text-xs text-green-500 h-52 overflow-hidden"
            >
              <div className="text-green-700 mb-2">// ARCHIVE DB — BREACH LOG</div>
              {[
                "SELECT * FROM evidence WHERE status='DELETED';",
                "ERROR: Row 47 — REDACTED BY SYS_ADMIN",
                "INJECTING... payload_7x.sql",
                "SUCCESS: 3 fragments recovered",
                "WARNING: Intrusion detected on node 14",
                "TRACE INITIATED — SOURCE: 192.168.1.44",
                "ALERT: Security escalation in progress...",
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.3 }}
                  className={i >= 4 ? "text-red-500" : ""}
                >
                  {`> ${line}`}
                </motion.div>
              ))}
            </motion.div>

            {/* Right: Sec-Bot */}
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="flex-1 flex flex-col items-center justify-center h-52 bg-black/60 border border-red-900 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #ff000008 0px, #ff000008 1px, transparent 1px, transparent 40px)",
                }}
              />
              {/* Bot silhouette */}
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-2">🤖</div>
                <div className="text-red-500 font-mono text-xs tracking-widest animate-pulse">
                  SEC-BOT PATROL — ACTIVE
                </div>
                <div className="mt-2 flex gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ),
      },
      {
        duration: 4000,
        content: (
          <div className="flex flex-col items-center justify-center gap-6 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 font-mono text-sm"
            >
              <TypewriterText
                text='"They know someone has the files. The newsroom is on lockdown."'
                speed={35}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="bg-red-950/60 border border-red-500 px-8 py-4"
            >
              <div className="text-red-300 font-mono text-xs mb-1 tracking-widest">MISSION OBJECTIVE</div>
              <div className="text-white font-black text-xl tracking-wider uppercase">
                INFILTRATE THE NEWSROOM
              </div>
              <div className="text-red-400 font-mono text-xs mt-2 animate-pulse">
                PHASE 2: INITIATING NOW
              </div>
            </motion.div>
          </div>
        ),
      },
    ],
  },

  phase_2_to_3: {
    id: "phase_2_to_3",
    title: "Phase 2 → 3 — THE CLIMAX",
    accentColor: "#d4a017",
    glowColor: "rgba(212,160,23,0.2)",
    skipAllowed: false, // Make them watch this one
    frames: [
      {
        duration: 4000,
        content: (
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted font-mono text-xs tracking-[0.5em] uppercase"
            >
              Recovering final evidence fragments...
            </motion.div>
            {/* Evidence cards appearing */}
            <div className="grid grid-cols-3 gap-3 max-w-2xl">
              {[
                { label: "CALL LOG", content: "Last call: 23:49 → UNKNOWN", color: "#ef4444" },
                { label: "AUTHORIZATION", content: "Kill-Switch // Sundaram Exec Board", color: "#d4a017" },
                { label: "SUBJECT", content: "P. Singh — Desk // Coffee: Half-drunk", color: "#3b82f6" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, rotate: (i - 1) * 5 }}
                  animate={{ opacity: 1, y: 0, rotate: (i - 1) * 2 }}
                  transition={{ delay: i * 0.5 + 0.5, duration: 0.6 }}
                  className="bg-black/80 border p-3 text-left"
                  style={{ borderColor: card.color }}
                >
                  <div
                    className="text-[10px] font-mono tracking-widest mb-1 uppercase"
                    style={{ color: card.color }}
                  >
                    [{card.label}]
                  </div>
                  <div className="text-white text-xs font-mono">{card.content}</div>
                </motion.div>
              ))}
            </div>
            {/* Red string connecting them */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-red-500 font-mono text-xs tracking-widest"
            >
              ────────── CONNECTING THE THREADS ──────────
            </motion.div>
          </div>
        ),
      },
      {
        duration: 5000,
        content: (
          <div className="flex flex-col items-center justify-center gap-6 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="space-y-3"
            >
              <div className="text-red-400 font-mono text-xs tracking-widest uppercase animate-pulse">
                CLASSIFIED // OPERATION RED THREAD // FINAL RECORD
              </div>
              <div
                className="text-4xl md:text-5xl font-black uppercase tracking-widest"
                style={{
                  color: "#d4a017",
                  textShadow: "0 0 60px rgba(212,160,23,0.7)",
                }}
              >
                THE FINAL
                <br />
                11 MINUTES
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-body font-mono text-sm leading-loose max-w-lg italic"
            >
              <TypewriterText
                text='"You have the fragments. You have the motive. Now one question remains — who gave the order?"'
                speed={30}
                delay={1500}
              />
            </motion.div>
          </div>
        ),
      },
      {
        duration: 5000,
        content: (
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              className="relative"
            >
              <div
                className="text-8xl md:text-9xl font-black font-mono"
                style={{
                  color: "#ff2222",
                  textShadow: "0 0 80px rgba(255,34,34,1), 0 0 30px rgba(255,34,34,0.8)",
                }}
              >
                FINAL
              </div>
              <div
                className="text-8xl md:text-9xl font-black font-mono -mt-4"
                style={{
                  color: "#d4a017",
                  textShadow: "0 0 80px rgba(212,160,23,1)",
                }}
              >
                VERDICT
              </div>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
              style={{ background: "linear-gradient(90deg, transparent, #d4a017, transparent)" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-green-400 font-mono text-lg tracking-widest animate-pulse"
            >
              <TypewriterText
                text="ASSEMBLE THE DOSSIER // DELIVER JUSTICE // PHASE 3 INITIATED"
                speed={40}
                delay={1200}
              />
            </motion.div>
          </div>
        ),
      },
    ],
  },
};

// ─── Main Overlay Component ────────────────────────────────────────────────

interface CutsceneOverlayProps {
  cutsceneId: CutsceneId | null;
  onComplete: () => void;
}

export function CutsceneOverlay({ cutsceneId, onComplete }: CutsceneOverlayProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cutscene = cutsceneId ? CUTSCENES[cutsceneId] : null;

  useEffect(() => {
    if (cutsceneId) {
      setCurrentFrame(0);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [cutsceneId]);

  useEffect(() => {
    if (!isVisible || !cutscene) return;

    const frame = cutscene.frames[currentFrame];
    if (!frame) return;

    timerRef.current = setTimeout(() => {
      if (currentFrame < cutscene.frames.length - 1) {
        setCurrentFrame((f) => f + 1);
      } else {
        // All frames done
        setTimeout(() => {
          setIsVisible(false);
          onComplete();
        }, 800);
      }
    }, frame.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, currentFrame, cutscene, onComplete]);

  const handleSkip = () => {
    if (!cutscene?.skipAllowed) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && cutscene && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#040200" }}
        >
          <ScanlineOverlay />

          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${cutscene.glowColor} 0%, transparent 70%)`,
            }}
          />

          {/* Cinematic bars */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-black z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-20" />

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-30 flex items-center justify-between px-8">
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted/60">
              OPERATION: RED THREAD
            </div>
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted/60">
              {cutscene.title}
            </div>
          </div>

          {/* Frame progress dots */}
          <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-2">
            {cutscene.frames.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background: i <= currentFrame ? cutscene.accentColor : "rgba(255,255,255,0.2)",
                  boxShadow: i === currentFrame ? `0 0 8px ${cutscene.accentColor}` : "none",
                }}
              />
            ))}
            {cutscene.skipAllowed && (
              <button
                onClick={handleSkip}
                className="ml-6 text-[10px] font-mono text-muted/50 hover:text-muted transition-colors border border-muted/20 px-3 py-1 hover:border-muted/50"
              >
                SKIP →
              </button>
            )}
          </div>

          {/* Main content area */}
          <div className="relative z-10 w-full flex items-center justify-center px-12 py-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFrame}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl flex items-center justify-center"
              >
                {cutscene.frames[currentFrame]?.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
