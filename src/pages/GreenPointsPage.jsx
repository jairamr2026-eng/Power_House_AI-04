// src/pages/GreenPointsPage.jsx
// Stage 6: Green Points (visual, almost no text, no rupees)
// Page title "Green Points" only: no subtitle, no tags, no paragraphs. Only numbers, icons, and 1-2 word labels.
// - Balance: large radial ring showing 320/500 with "320" in center; icon chips (phone 60, km 4, LED 75, tree 8, "approx.")
// - Monthly: 7-day bar chart (Mon 52, Tue 74, Wed 61, Thu 88, Fri 79, Sat 48, Sun 80), big number "482" "gCO₂e", tooltip with equivalence
// - Next reward: gift icon, thin progress bar, "320 / 500"
// - Perks: icon tiles (cafe 200 pts, gift card 500 pts, EV/metro 800 pts), small bar/ring, Redeem button, full names on hover
// - History: small sparkline above vertical icon timeline (dot, points chip, date; titles on hover)

import React, { useEffect, useMemo, useState } from 'react';
import {
  Gift,
  Coffee,
  Zap,
  Lock,
  Smartphone,
  Car,
  Lightbulb,
  TreePine,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../context/AppContext';
import CountUpNumber from '../components/CountUpNumber';
import { getGreenPoints, MOCK_PERKS, MOCK_POINTS_HISTORY, MOCK_SPARKLINE_DATA } from '../api/mockApi';
import { USE_MOCK } from '../api/config';

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const charges = Math.round(val / 8);
    const km = +(val / 120).toFixed(1);
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-md text-xs text-[#0B1220]">
        <span className="font-semibold text-[#10B981]">
          {val} gCO₂e ≈ {charges} phone charges · {km} km
        </span>
      </div>
    );
  }
  return null;
};

export default function GreenPointsPage() {
  const {
    points,
    carbonSaved,
    sevenDaySavings,
    deductPoints,
    badgeAnimateKey,
  } = useApp();

  const [historyList, setHistoryList] = useState(USE_MOCK ? MOCK_POINTS_HISTORY : []);
  const [perks, setPerks] = useState(USE_MOCK ? MOCK_PERKS : []);
  const [redeemedPerkId, setRedeemedPerkId] = useState(null);

  // Real-world equivalents based on saved carbon (no rupees)
  // 1 phone charge = 8 gCO2e
  // 1 km driven = 120 gCO2e
  // 1 LED bulb hour = 6 gCO2e
  // 1 tree-day = 60 gCO2e (label "approx.")
  const phoneCharges = Math.round(carbonSaved / 8);
  const kmDriven = Math.round(carbonSaved / 120);
  const ledHours = Math.round(carbonSaved / 6.4);
  const treeDays = Math.round(carbonSaved / 60);
  const sparkline = useMemo(() => USE_MOCK ? MOCK_SPARKLINE_DATA : [...historyList].reverse().reduce((items, row) => {
    const prior = items.at(-1)?.p || 0; items.push({ p: prior + Number(row.points || 0) }); return items;
  }, []), [historyList]);

  useEffect(() => {
    if (USE_MOCK) return;
    void getGreenPoints().then((data) => {
      setHistoryList((data.history || []).map((row) => ({ id: row.id, title: row.reason, points: Number(row.points), date: new Date(row.created_at).toLocaleDateString() })));
      setPerks([]);
    }).catch(() => undefined);
  }, []);

  const targetPoints = 500;
  const progressPercent = Math.min(100, Math.round((points / targetPoints) * 100));

  // Radial progress ring: radius 46
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleRedeem = (perk) => {
    if (points < perk.costPoints) return;
    deductPoints(perk.costPoints);
    setRedeemedPerkId(perk.id);

    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      title: `${perk.name} Redeemed`,
      points: -perk.costPoints,
      type: 'redeemed',
      date: 'Today',
    };
    setHistoryList((prev) => [newHistoryEntry, ...prev]);

    setTimeout(() => setRedeemedPerkId(null), 2500);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full text-[#0B1220] font-['Inter']">
      {/* Page title "Green Points" ONLY: no subtitle, no tags, no paragraphs */}
      <h1 className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] mb-5">
        Green Points
      </h1>

      {/* TOP ROW: Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* (1) Balance Card: Large radial ring with "320" in center + row of equivalent icon chips */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center justify-between min-h-[220px]">
          <span className="text-xs font-semibold text-[#64748B] self-start">
            Balance
          </span>

          {/* Animated Radial Ring */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="text-slate-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                key={badgeAnimateKey}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] leading-none">
                <CountUpNumber end={points} duration={800} />
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">pts</span>
            </div>
          </div>

          {/* Row of equivalent icon chips (phone charges 60, km 4, LED hours 75, tree-days 8, "approx.") */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100 w-full text-[11px] font-semibold text-[#123C2D]">
            <div className="flex items-center gap-1" title="Phone charges">
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{phoneCharges}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1" title="Km driven">
              <Car className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{kmDriven}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1" title="LED bulb hours">
              <Lightbulb className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{ledHours}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1" title="Tree-days">
              <TreePine className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{treeDays}</span>
            </div>
            <span className="text-[10px] font-normal text-[#64748B]">approx.</span>
          </div>
        </div>

        {/* (2) Monthly Card: 7-day bar chart with big number "482" and "gCO₂e", tooltip with day's equivalence */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              Monthly
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220]">
                <CountUpNumber end={carbonSaved} duration={850} />
              </span>
              <span className="text-xs text-[#64748B] font-semibold">gCO₂e</span>
            </div>
          </div>

          <div className="w-full h-24 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDaySavings} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#64748B' }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={<CustomBarTooltip />}
                />
                <Bar dataKey="saved" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-[#64748B] text-center">
            {carbonSaved} gCO₂e recorded this week
          </div>
        </div>

        {/* (3) Next Reward Card: Gift icon, thin animated progress bar, "320 / 500" */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <span className="text-xs font-semibold text-[#64748B]">
            Next reward
          </span>

          <div className="flex flex-col items-center justify-center my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EEFF] flex items-center justify-center text-[#123C2D] mb-3">
              <Gift className="w-6 h-6 text-[#10B981]" />
            </div>
            <span className="text-lg font-bold text-[#0B1220] font-['Plus_Jakarta_Sans']">
              <CountUpNumber end={points} duration={800} /> / 500
            </span>
          </div>

          <div className="w-full bg-[#E8EEFF] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#10B981] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
              key={badgeAnimateKey}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Perks Grid (Left) & History Timeline with Sparkline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Perks Grid (7 cols): Cafe cup 200 pts, Gift card 500 pts, EV & metro pass 800 pts */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Perks
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {perks.length === 0 ? <p className="col-span-3 text-center text-xs text-[#64748B] py-6">No reward catalog is configured.</p> : perks.map((perk) => {
              const canAfford = points >= perk.costPoints;
              const ratio = Math.min(100, Math.round((points / perk.costPoints) * 100));

              let Icon = Gift;
              if (perk.icon === 'Coffee') Icon = Coffee;
              if (perk.icon === 'Zap') Icon = Zap;

              return (
                <div
                  key={perk.id}
                  title={perk.name}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-[#F4F7FB]/50 hover:bg-[#F4F7FB] flex flex-col items-center justify-between text-center transition-all group"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-[#123C2D] group-hover:scale-105 transition-transform shadow-xs mb-2">
                    <Icon className="w-6 h-6 text-[#10B981]" />
                  </div>

                  {/* Points Cost */}
                  <div className="my-1.5">
                    <span className="text-xs font-bold text-[#0B1220]">
                      {perk.costPoints} pts
                    </span>
                  </div>

                  {/* Small progress bar for how close balance is */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-[#10B981] h-full rounded-full transition-all duration-700"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>

                  {/* Redeem Button (locked shows lock icon) */}
                  <button
                    type="button"
                    onClick={() => handleRedeem(perk)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-[#123C2D] hover:bg-[#1a4a39] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                    }`}
                  >
                    {!canAfford ? (
                      <Lock className="w-3 h-3 shrink-0" />
                    ) : redeemedPerkId === perk.id ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : null}
                    <span>{redeemedPerkId === perk.id ? 'Claimed' : canAfford ? 'Redeem' : 'Locked'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* History: Sparkline of points over time + Vertical icon timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                History
              </span>

              {/* Sparkline of points over time */}
              <div className="w-24 h-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ptsSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="p"
                      stroke="#10B981"
                      strokeWidth={1.8}
                      fill="url(#ptsSpark)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vertical Icon Timeline */}
            <div className="space-y-3 pt-1">
              {historyList.map((item) => {
                const isEarned = item.points > 0;

                return (
                  <div
                    key={item.id}
                    title={item.title}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F7FB] transition-colors cursor-default"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Icon dot */}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isEarned ? 'bg-[#10B981]' : 'bg-[#DC2626]'
                        }`}
                      />
                      <span className="text-xs text-[#64748B] font-mono">
                        {item.date}
                      </span>
                    </div>

                    {/* Points chip (+20 pts green, -200 pts red) */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                        isEarned
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-[#DC2626]/10 text-[#DC2626]'
                      }`}
                    >
                      {isEarned ? `+${item.points}` : item.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
