// src/components/GreenPointsPill.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function GreenPointsPill() {
  const { points, inrValue, pointAwardAnimation } = useApp();
  const [displayPoints, setDisplayPoints] = useState(points);
  const [showFloatBonus, setShowFloatBonus] = useState(false);
  const [bonusInfo, setBonusInfo] = useState(null);
  const prevPointsRef = useRef(points);

  // Animate number count-up when points change
  useEffect(() => {
    const start = prevPointsRef.current;
    const end = points;
    prevPointsRef.current = points;

    if (start === end) return;

    const duration = 600;
    const steps = 15;
    const stepTime = duration / steps;
    const stepIncrement = (end - start) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayPoints(end);
        clearInterval(interval);
      } else {
        setDisplayPoints(Math.round(start + stepIncrement * currentStep));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [points]);

  // Trigger floating +20 badge when animation event arrives
  useEffect(() => {
    if (!pointAwardAnimation) return;
    const info = pointAwardAnimation;
    const animTimeout = setTimeout(() => {
      setBonusInfo(info);
      setShowFloatBonus(true);
    }, 10);

    const hideTimeout = setTimeout(() => {
      setShowFloatBonus(false);
    }, 2600);

    return () => {
      clearTimeout(animTimeout);
      clearTimeout(hideTimeout);
    };
  }, [pointAwardAnimation]);

  return (
    <div className="relative inline-flex items-center">
      <Link
        to="/points"
        title="View Green Points and Rewards"
        className="group relative flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-[#0d1624]/90 px-3.5 py-1.5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)] hover:border-emerald-400/60 hover:shadow-[0_0_20px_-2px_rgba(16,185,129,0.4)] transition-all cursor-pointer backdrop-blur-md"
      >
        {/* Glowing Leaf icon */}
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
          <Leaf className="h-3.5 w-3.5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>

        {/* Value text: "320 pts · ₹160" */}
        <div className="flex items-baseline gap-1.5 text-xs font-semibold">
          <motion.span
            key={displayPoints}
            initial={{ scale: 1.15, color: '#34d399' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
            className="tracking-tight text-white font-mono text-[13px]"
          >
            {displayPoints} pts
          </motion.span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-mono text-[12px]">
            ₹{inrValue % 1 === 0 ? inrValue : inrValue.toFixed(1)}
          </span>
        </div>

        <TrendingUp className="h-3.5 w-3.5 text-emerald-400/70 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
      </Link>

      {/* Floating Animated Reward Notification */}
      <AnimatePresence>
        {showFloatBonus && bonusInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1.05 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute -top-1 right-0 pointer-events-none z-50 flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-500 px-3 py-1 text-xs font-extrabold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
          >
            <Sparkles className="h-3.5 w-3.5 fill-black" />
            <span>+{bonusInfo.amount} pts (₹{bonusInfo.inr})</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
