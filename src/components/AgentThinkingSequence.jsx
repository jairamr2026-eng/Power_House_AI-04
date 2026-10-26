// src/components/AgentThinkingSequence.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Cpu, Zap, BarChart3, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Analyzing task complexity & token volume', shortLabel: 'Analyzing task', icon: Cpu },
  { id: 2, label: 'Checking regional grid carbon intensity & solar forecast', shortLabel: 'Checking grid carbon intensity', icon: Zap },
  { id: 3, label: 'Comparing model parameters, latency & emissions', shortLabel: 'Comparing models', icon: BarChart3 },
  { id: 4, label: 'Recommendation ready', shortLabel: 'Recommendation ready', icon: CheckCircle2 },
];

export default function AgentThinkingSequence({ onComplete, theme = 'dark' }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    const stepDurations = [600, 650, 650, 500];

    if (currentStepIndex < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, stepDurations[currentStepIndex]);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 550);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStepIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`my-3 rounded-2xl p-4 shadow-lg backdrop-blur-md max-w-xl transition-colors ${
        isDark
          ? 'border border-[#10B981]/30 bg-[#0c1322]/90 text-slate-100'
          : 'border border-[#10B981]/40 bg-white text-[#0B1220]'
      }`}
    >
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-[#10B981]">
        <Sparkles className="h-4 w-4 animate-spin text-[#10B981]" />
        <span>CarbonShield AI Optimizer</span>
      </div>

      <div className="space-y-2.5">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <motion.div
              key={step.id}
              initial={false}
              animate={{
                opacity: isPending ? 0.35 : 1,
                x: isCurrent ? 4 : 0,
              }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-1.5 transition-colors ${
                isCurrent
                  ? isDark
                    ? 'bg-[#10B981]/15 border border-[#10B981]/30'
                    : 'bg-[#10B981]/10 border border-[#10B981]/40'
                  : isDone
                  ? isDark
                    ? 'bg-slate-900/40 text-slate-300'
                    : 'bg-[#F4F7FB] text-[#0B1220]'
                  : 'text-slate-400'
              }`}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                {isDone ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" />
                ) : (
                  <div className={`h-2 w-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                )}
              </div>

              <span
                className={`text-xs font-medium ${
                  isCurrent
                    ? 'text-[#10B981] font-semibold'
                    : isDone
                    ? isDark
                      ? 'text-slate-200'
                      : 'text-[#0B1220]'
                    : 'text-slate-400'
                }`}
              >
                {step.shortLabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
