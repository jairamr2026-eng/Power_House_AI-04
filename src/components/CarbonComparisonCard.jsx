// src/components/CarbonComparisonCard.jsx
// Stage 4: CarbonShield Comparison Card
// - Left, red-tinted: "Your choice" (or "You already chose a low-carbon model")
// - Right, green-tinted: "CarbonShield suggestion" with cleaner run time 2:00 PM (or "Run now" if Urgent)
// - Below: "You save X gCO₂e", real-world equivalences, "Why this recommendation",
//   "Estimated" tag with "Source: simulated data", Accept / Override buttons.

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  AlertTriangle,
  Clock,
  Coins,
  Cpu,
  Smartphone,
  Navigation,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CarbonComparisonCard({
  comparisonData,
  onAccept,
  onOverride,
  theme = 'dark',
}) {
  const [decisionState, setDecisionState] = useState(null); // 'accepted' | 'overridden' | null
  const isDark = theme === 'dark';

  const {
    typical,
    suggested,
    savings,
    whyRecommendation,
    disclaimer,
    alreadyLowCarbon,
    isUrgent,
  } = comparisonData;

  const handleAccept = () => {
    setDecisionState('accepted');

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10B981', '#34D399', '#123C2D', '#FFFFFF'],
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }

    if (onAccept) onAccept(comparisonData);
  };

  const handleOverride = () => {
    setDecisionState('overridden');
    if (onOverride) onOverride(comparisonData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`mt-3 w-full max-w-2xl rounded-2xl p-5 shadow-xl transition-colors font-['Inter'] ${
        isDark
          ? 'border border-slate-800 bg-[#0F172A] text-slate-100'
          : 'border border-slate-200 bg-white text-[#0B1220]'
      }`}
    >
      {/* Top Header & Source Disclaimer */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#10B981]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
            CarbonShield Recommendation
          </span>
        </div>

        {/* Estimated tag with Source: simulated data */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] ${
            isDark
              ? 'border border-slate-700 bg-slate-800/80 text-slate-300'
              : 'border border-slate-200 bg-[#F4F7FB] text-[#64748B]'
          }`}
        >
          <span className="font-semibold text-[#10B981]">{disclaimer?.tag || 'Estimated'}</span>
          <span>•</span>
          <span>{disclaimer?.source || 'Source: simulated data'}</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
        {/* Left: Your choice (red-tinted) OR "You already chose a low-carbon model" */}
        {alreadyLowCarbon ? (
          <div
            className={`rounded-xl border p-4 relative ${
              isDark
                ? 'border-[#10B981]/50 bg-[#10B981]/10 text-white'
                : 'border-[#10B981]/50 bg-[#10B981]/5 text-[#0B1220]'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-[#10B981]">
                <Check className="h-4 w-4 text-[#10B981] stroke-[2.5]" />
                You already chose a low-carbon model
              </span>
              <span className="rounded bg-[#10B981]/20 border border-[#10B981]/40 px-1.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                Low Carbon
              </span>
            </div>

            <div className="text-sm font-semibold flex items-center gap-1.5 mb-3">
              <Cpu className="h-4 w-4 text-[#10B981]" />
              <span>{typical?.model}</span>
            </div>

            <div className="space-y-1.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Model emissions:</span>
                <span className="font-mono font-bold text-[#10B981]">{typical?.carbon} gCO₂e</span>
              </div>
              <div className="flex justify-between">
                <span>Compute cost:</span>
                <span className="font-mono font-bold text-[#123C2D]">₹{typical?.cost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Timing:</span>
                <span className="font-medium text-[#0B1220]">{isUrgent ? 'Immediate' : 'Run at solar peak'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl border p-4 relative ${
              isDark
                ? 'border-[#DC2626]/40 bg-[#FEF2F2]/5 text-white'
                : 'border-[#DC2626]/30 bg-[#FEF2F2] text-[#0B1220]'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-[#DC2626]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Your choice
              </span>
              <span className="rounded bg-[#DC2626]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#DC2626]">
                High Footprint
              </span>
            </div>

            <div className="text-sm font-semibold flex items-center gap-1.5 mb-3">
              <Cpu className="h-4 w-4 text-[#DC2626]" />
              <span>{typical?.model || 'Typical large model'}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Model emissions:</span>
                <span className="font-mono font-bold text-[#DC2626]">{typical?.carbon || 30} gCO₂e</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Compute cost:</span>
                <span className="font-mono font-bold text-[#0B1220]">₹{typical?.cost ? typical.cost.toFixed(2) : '4.00'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Estimated time:</span>
                <span className="font-medium text-[#64748B]">{typical?.time || '12 min'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Right: CarbonShield suggestion (green-tinted) */}
        <div
          className={`rounded-xl border p-4 relative ${
            isDark
              ? 'border-[#10B981]/50 bg-[#10B981]/10 text-white'
              : 'border-[#10B981]/40 bg-[#10B981]/5 text-[#0B1220]'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-[#10B981]">
              <Leaf className="h-3.5 w-3.5" />
              CarbonShield suggestion
            </span>
            <span className="rounded bg-[#10B981]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#10B981]">
              Clean Window
            </span>
          </div>

          <div className="text-sm font-semibold flex items-center gap-1.5 mb-3">
            <Cpu className="h-4 w-4 text-[#10B981]" />
            <span>{suggested?.model || 'Claude Haiku'}</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Model emissions:</span>
              <span className="font-mono font-bold text-[#10B981]">{suggested?.carbon || 12} gCO₂e</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Compute cost:</span>
              <span className="font-mono font-bold text-[#123C2D]">₹{suggested?.cost ? suggested.cost.toFixed(2) : '2.50'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Run schedule:</span>
              <span className="font-bold text-[#10B981] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {suggested?.schedule || '2:00 PM'} ({suggested?.duration || '45 min'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Below: Savings difference & Real-World Equivalences */}
      <div
        className={`p-3.5 rounded-xl mb-4 border ${
          isDark
            ? 'bg-slate-800/60 border-slate-700/80'
            : 'bg-[#E8EEFF]/70 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#64748B] font-medium">You save</span>
            <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#10B981]">
              {savings?.gCO2e || 18} gCO₂e
            </span>
            <span className="text-xs text-[#64748B] ml-1">
              (₹{savings?.inr ? savings.inr.toFixed(2) : '1.50'} compute cost)
            </span>
          </div>

          {/* Equivalences from that difference */}
          <div className="flex items-center gap-3 text-xs font-semibold text-[#123C2D]">
            <div className="flex items-center gap-1" title="Equivalent phone charges">
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              <span>≈ {savings?.phoneCharges || 2} phone charges</span>
            </div>
            <div className="flex items-center gap-1" title="Equivalent km driven">
              <Navigation className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{savings?.kmDriven || 0.2} km driven approx.</span>
            </div>
          </div>
        </div>

        {/* "Why this recommendation" sentence */}
        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#0B1220]'}`}>
          <strong>Why this recommendation: </strong>
          {whyRecommendation}
        </p>
      </div>

      {/* Decision Buttons: Accept / Override */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {decisionState === null ? (
          <>
            <button
              type="button"
              onClick={handleOverride}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-[#0B1220] hover:bg-slate-100'
              }`}
            >
              Override
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-lg bg-[#123C2D] hover:bg-[#1a4a39] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Accept Recommendation (+20 pts)</span>
            </button>
          </>
        ) : decisionState === 'accepted' ? (
          <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
            <Check className="w-4 h-4" />
            <span>Recommendation Accepted (+20 Green Points)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <span>Task Dispatched Immediately (No points earned)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
