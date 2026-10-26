// src/pages/GridStatusPage.jsx
// Stage 7: Grid Status
// Simple page: current grid intensity, a small 24-hour intensity chart,
// and the next clean window, labelled as simulated data.

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sun,
  TrendingDown,
  Info,
  Globe,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { getGridStatus, MOCK_GRID_STATUS } from '../api/mockApi';

export default function GridStatusPage() {
  const [gridData, setGridData] = useState(MOCK_GRID_STATUS);

  useEffect(() => {
    let mounted = true;
    async function loadGrid() {
      try {
        const data = await getGridStatus();
        if (mounted && data) {
          setGridData(data);
        }
      } catch (err) {
        console.error('Failed to load grid status', err);
      }
    }
    loadGrid();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full text-[#0B1220] font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220]">
              Grid Status
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#10B981] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Live signal
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Regional power grid dispatch intensity and clean solar energy windows.
          </p>
        </div>

        {/* Region label */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-[#0B1220] shadow-xs">
          <Globe className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{gridData?.region || 'India - South Grid (Simulated)'}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 1. Current Grid Intensity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Current Intensity
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E8EEFF] text-[#123C2D] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#10B981]" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-bold text-[#123C2D] font-['Plus_Jakarta_Sans']">
                {gridData?.currentIntensity || 640}
              </span>
              <span className="text-sm font-semibold text-[#64748B]">{gridData?.unit || 'gCO₂/kWh'}</span>
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#10B981]/15 text-[#10B981] mt-1.5">
              Cleaner in {gridData?.cleanerIn || '3h'}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] pt-2 border-t border-slate-100">
            {gridData?.signalNote || 'Solar influx expected at 1:30 PM'}
          </p>
        </div>

        {/* 2. Next Clean Window */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Next Clean Window
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-xl sm:text-2xl font-bold text-[#123C2D] font-['Plus_Jakarta_Sans']">
              {gridData?.nextCleanWindow?.time || '1:30 PM - 4:00 PM'}
            </div>
            <div className="text-xs font-bold text-[#10B981] flex items-center gap-1 mt-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{gridData?.nextCleanWindow?.intensityDrop || 'Down to 370 gCO₂/kWh (-42%)'}</span>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[#123C2D] pt-2 border-t border-slate-100">
            {gridData?.nextCleanWindow?.countdown || 'Starts in 3h 15m'}
          </p>
        </div>
      </div>

      {/* Small 24-Hour Intensity Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-[#0B1220] font-['Plus_Jakarta_Sans']">
              24-Hour Regional Grid Carbon Intensity
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Regional dispatch curve showing solar trough and evening peak
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-[#10B981] font-semibold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              Clean Window (11:30 - 15:30)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={gridData?.hourlyTrend || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gridIntensityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[300, 800]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
                formatter={(val) => [`${val} gCO₂/kWh`, 'Carbon Intensity']}
              />
              <ReferenceLine
                y={500}
                stroke="#10B981"
                strokeDasharray="3 3"
                label={{ value: 'Clean Threshold', fill: '#10B981', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="intensity"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gridIntensityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Labelled as simulated data banner */}
      <div className="p-3.5 rounded-xl bg-[#E8EEFF] border border-slate-200/80 flex items-start gap-2.5 text-xs text-[#0B1220]">
        <Info className="w-4 h-4 text-[#123C2D] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>Simulated data: </strong>
          {gridData?.disclaimer ||
            'Figures are simulated. Source: Regional power dispatch model for hackathon demonstration.'}
        </div>
      </div>
    </div>
  );
}
