// src/pages/MyTasksPage.jsx
// Stage 5: My Tasks - Compact table of 5 sample tasks.
// Columns: task, status, model used, gCO₂e saved, ₹ compute cost saved.

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Search,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MyTasksPage() {
  const { tasks } = useApp();
  const [filter, setFilter] = useState('All'); // 'All' | 'Completed' | 'Scheduled'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesFilter =
      filter === 'All' || task.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.modelUsed?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full text-[#0B1220] font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220]">
              My Tasks
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8EEFF] text-[#123C2D]">
              {tasks.length}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit log of AI tasks optimized for carbon reduction and solar grid alignment.
          </p>
        </div>

        {/* Filter pills & search */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg bg-[#E8EEFF] p-0.5 text-xs">
            {['All', 'Completed', 'Scheduled'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-[#123C2D] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1220]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#10B981] w-40"
            />
          </div>
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F7FB] border-b border-slate-200 text-[#64748B] font-semibold">
                <th className="py-2.5 px-4">task</th>
                <th className="py-2.5 px-4">status</th>
                <th className="py-2.5 px-4">model used</th>
                <th className="py-2.5 px-4 text-right">gCO₂e saved</th>
                <th className="py-2.5 px-4 text-right">₹ compute cost saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#64748B]">
                    No tasks found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status?.toLowerCase() === 'completed';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-[#F4F7FB]/60 transition-colors"
                    >
                      {/* Task Name & Details */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-[#0B1220] truncate">
                          {task.name}
                        </div>
                        {task.prompt && (
                          <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                            {task.prompt}
                          </div>
                        )}
                        <div className="text-[10px] text-[#64748B] mt-0.5 font-mono">
                          {task.date || 'Today'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isCompleted
                              ? 'bg-[#10B981]/15 text-[#10B981]'
                              : 'bg-[#E8EEFF] text-[#123C2D]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-[#123C2D]" />
                          )}
                          <span>{task.status}</span>
                        </span>
                      </td>

                      {/* Model Used */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-[#0B1220]">
                          <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>{task.modelUsed}</span>
                        </div>
                      </td>

                      {/* gCO2e Saved */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-[#10B981] font-mono text-xs bg-[#10B981]/10 px-2 py-0.5 rounded">
                          +{task.gCO2eSaved} gCO₂e
                        </span>
                      </td>

                      {/* ₹ Compute Cost Saved */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-[#123C2D] font-mono">
                          ₹{typeof task.inrSaved === 'number' ? task.inrSaved.toFixed(2) : (task.inrSaved || '2.50')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
