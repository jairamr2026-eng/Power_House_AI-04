// src/pages/DashboardPage.jsx
// Stage 3: Home Dashboard (minimal, fits 1366x768 without scrolling)
// - Slim welcome banner (~110px tall), gradient #123C2D to #0B1220: "Welcome back, Priya",
//   "Next clean energy window starts in 3h 15m." in white, emerald "Submit AI Task" button on right.
// - Three equal stat cards:
//   1. Green Points: "320 pts" with phone-charge and km icons showing "60" and "4" (no rupees).
//   2. Carbon Saved: "482 gCO₂e" with small 7-day bar chart (bars #10B981, no gridlines, tiny day labels).
//   3. Grid Now: "640 gCO₂/kWh" and "Cleaner in 3h".
// - Recent tasks: 3 simple rows (task name, status label, gCO₂e saved) + "View all" link to My Tasks.
// - One tiny gray line: "Figures are simulated."
// - Numbers count up on load.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts';
import { Smartphone, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CountUpNumber from '../components/CountUpNumber';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { points, carbonSaved, sevenDaySavings, tasks } = useApp();

  // Equivalents for Green Points card (1 phone charge = 8 gCO2e, 1 km driven = 120 gCO2e)
  // For default 482 gCO2e: 482 / 8 ≈ 60 phone charges, 482 / 120 ≈ 4 km
  const phoneCharges = Math.round((carbonSaved || 482) / 8);
  const kmDriven = Math.round((carbonSaved || 482) / 120);

  // Take first 3 tasks for recent tasks list
  const recentTasks = (tasks && tasks.length >= 3 ? tasks.slice(0, 3) : [
    {
      id: 'task-101',
      name: 'Q3 Financial Summary Report Analysis',
      status: 'Completed',
      gCO2eSaved: 24,
    },
    {
      id: 'task-102',
      name: 'Customer Support Sentiment Classification (Batch 4k)',
      status: 'Completed',
      gCO2eSaved: 48,
    },
    {
      id: 'task-103',
      name: 'Weekly Codebase Vulnerability Scan',
      status: 'Scheduled',
      gCO2eSaved: 36,
    },
  ]);

  return (
    <div className="h-full max-w-5xl mx-auto p-5 md:p-6 flex flex-col justify-between text-[#0B1220] font-['Inter']">
      {/* 1. Slim Welcome Banner (~110px tall), gradient from #123C2D to #0B1220 */}
      <div className="h-[110px] min-h-[110px] rounded-2xl bg-gradient-to-r from-[#123C2D] to-[#0B1220] px-6 md:px-8 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h2
              style={{ color: '#FFFFFF' }}
              className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight"
>
  Welcome back, Priya
</h2>
          <p className="text-xs md:text-sm text-[#FFFFFF] mt-1 font-normal opacity-95">
            Next clean energy window starts in 3h 15m.
          </p>
        </div>

        {/* Emerald "Submit AI Task" button */}
        <button
          type="button"
          onClick={() => navigate('/submit')}
          className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#0ea372] text-[#0B1220] text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          Submit AI Task
        </button>
      </div>

      {/* 2. Three Equal Stat Cards in one row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-4 shrink-0">
        {/* Card 1: Green Points: "320 pts" with phone-charge and km icons showing "60" and "4" (no rupees) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-[155px]">
          <span className="text-xs font-medium text-[#64748B]">
            Green Points
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] tracking-tight">
              <CountUpNumber end={points || 320} duration={800} /> pts
            </span>
          </div>
          {/* Phone-charge and km icons showing "60" and "4" (strictly no rupees) */}
          <div className="flex items-center gap-4 text-xs font-semibold text-[#123C2D]">
            <div className="flex items-center gap-1.5" title={`${phoneCharges} phone charges equivalent`}>
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{phoneCharges}</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${kmDriven} km driven equivalent`}>
              <Car className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{kmDriven}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Carbon Saved: "482 gCO₂e" with small 7-day bar chart (bars #10B981, no gridlines, tiny day labels) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              Carbon Saved
            </span>
            <span className="text-[10px] text-[#64748B]">Last 7 days</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] tracking-tight">
              <CountUpNumber end={carbonSaved || 482} duration={850} /> gCO₂e
            </span>
          </div>
          {/* Small 7-day bar chart, bars #10B981, no gridlines, tiny day labels */}
          <div className="w-full h-10 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDaySavings} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#64748B' }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '2px 8px',
                  }}
                  formatter={(val) => [`${val} gCO₂e`, 'Saved']}
                />
                <Bar dataKey="saved" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Grid Now: "640 gCO₂/kWh" and "Cleaner in 3h" */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-[155px]">
          <span className="text-xs font-medium text-[#64748B]">
            Grid Now
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] tracking-tight">
              <CountUpNumber end={640} duration={850} /> gCO₂/kWh
            </span>
          </div>
          <span className="text-xs text-[#64748B]">
            Cleaner in 3h
          </span>
        </div>
      </div>

      {/* 3. Recent Tasks: 3 simple rows (task name, status label, gCO₂e saved) + "View all" link */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex-1 flex flex-col justify-between min-h-[180px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold font-['Plus_Jakarta_Sans'] text-[#0B1220]">
            Recent tasks
          </h3>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="text-xs font-medium text-[#123C2D] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="py-2 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-4">
                <span className="font-medium text-[#0B1220] truncate block">
                  {task.name}
                </span>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-[#64748B] text-xs">
                  {task.status}
                </span>
                <span className="font-medium text-[#0B1220] min-w-[70px] text-right font-mono">
                  {task.gCO2eSaved} gCO₂e
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. One tiny gray line */}
      <div className="pt-3 text-center">
        <p className="text-xs text-[#64748B]">
          Figures are simulated.
        </p>
      </div>
    </div>
  );
}
