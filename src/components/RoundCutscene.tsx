import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, AlertTriangle, Zap, ChevronRight } from 'lucide-react';

interface RoundCutsceneProps {
  roundNumber: number;
  title: string;
  subtitle: string;
  description: string[];
  onComplete: () => void;
}

export const RoundCutscene: React.FC<RoundCutsceneProps> = ({
  roundNumber,
  title,
  subtitle,
  description,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (step === 2 && textIndex < description.length) {
      const text = description[textIndex];
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => {
            if (textIndex < description.length - 1) {
              setTextIndex(prev => prev + 1);
              setDisplayText('');
            } else {
              setStep(3);
            }
          }, 1500);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step, textIndex, description]);

  // Initial sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden font-mono">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            y: [-100, 100]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-20 bg-gold/10 blur-xl"
        />
      </div>

      <div className="max-w-4xl w-full px-8 relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Terminal className="w-16 h-16 text-gold animate-pulse mb-4" />
              <div className="text-gold text-xl tracking-[0.3em] uppercase">Initializing Round {roundNumber}...</div>
            </motion.div>
          )}

          {step >= 1 && (
            <motion.div
              key="main"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              {/* Header */}
              <div className="border-l-4 border-gold pl-6 space-y-2">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gold font-bold text-sm tracking-[0.5em] uppercase"
                >
                  Phase {roundNumber} // Operation: Red Thread
                </motion.div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl font-black text-body uppercase tracking-tighter"
                >
                  {title}
                </motion.h1>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-muted text-xl uppercase tracking-widest"
                >
                  {subtitle}
                </motion.div>
              </div>

              {/* Description Body */}
              <div className="min-h-[200px] bg-black/40 border border-border p-8 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold" />
                
                <div className="flex items-start gap-4">
                  <Zap className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div className="text-body text-lg leading-relaxed font-mono">
                    {displayText}
                    <motion.span
                      animate={{ opacity: [0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-5 bg-gold ml-1 align-middle"
                    />
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-8 flex gap-2">
                  {description.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1 flex-1 transition-colors duration-500 ${
                        idx < textIndex ? 'bg-gold' : 
                        idx === textIndex ? 'bg-gold/40' : 'bg-border'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: step === 3 ? 1 : 0, y: step === 3 ? 0 : 20 }}
                className="flex justify-center"
              >
                <button
                  onClick={onComplete}
                  className="group relative px-12 py-4 bg-gold hover:bg-gold/90 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_2s_infinite]" />
                  <span className="relative flex items-center gap-3 text-black font-black uppercase tracking-[0.2em]">
                    Begin Mission <ChevronRight className="w-5 h-5" />
                  </span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Overlays */}
      <div className="fixed top-8 left-8 flex gap-4 text-[10px] text-muted uppercase tracking-[0.2em]">
        <div className="flex flex-col gap-1">
          <span>System: Secure</span>
          <span>Buffer: 100%</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col gap-1">
          <span>LAT: 40.7128 N</span>
          <span>LNG: 74.0060 W</span>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 text-[10px] text-muted uppercase tracking-[0.2em] flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" /> Encrypted Connection Established
        </div>
        <div className="bg-gold/10 px-2 py-1 border border-gold/20">
          Terminal ID: TRM-889-X
        </div>
      </div>
    </div>
  );
};
