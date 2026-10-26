// src/components/ModelPicker.jsx
// Stage 4: Claude-style upward model selector pill with search box,
// grouped by provider, showing 2-letter badges, size-tier tags,
// carbon badges (Low #10B981, Medium #F59E0B, High #DC2626), thin carbon bars,
// and footer text "Illustrative estimates (simulated), not measured values".

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronUp,
  Search,
  Leaf,
  Check,
} from 'lucide-react';
import { AI_MODELS } from '../api/mockApi';

export default function ModelPicker({ selectedModelId, onSelectModel, isDark = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Current selected model
  const currentModel = AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Filter models by search
  const filteredModels = AI_MODELS.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by provider: CarbonShield, Anthropic, Google, OpenAI
  const providers = ['CarbonShield', 'Anthropic', 'Google', 'OpenAI'];

  const handleSelect = (model) => {
    onSelectModel(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Selector Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
          isDark
            ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700'
            : 'bg-white hover:bg-slate-50 text-[#0B1220] border-slate-300'
        }`}
        title="Select AI Model"
      >
        {currentModel.isAuto ? (
          <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
        ) : (
          <span
            className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: currentModel.carbonColor }}
          >
            {currentModel.badge}
          </span>
        )}

        <span className="truncate max-w-[170px]">{currentModel.name}</span>

        {currentModel.isAuto && (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981]">
            Recommended
          </span>
        )}

        <ChevronUp className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Upward Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute bottom-full left-0 mb-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-2 z-50 transition-all font-['Inter'] ${
            isDark
              ? 'bg-[#0F172A] border-slate-700 text-slate-100'
              : 'bg-white border-slate-200 text-[#0B1220]'
          }`}
        >
          {/* Search Box */}
          <div className="p-1 mb-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-[#F4F7FB] border-slate-200 text-[#0B1220]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-transparent focus:outline-none placeholder:text-[#64748B] text-xs"
                autoFocus
              />
            </div>
          </div>

          {/* Grouped Model List */}
          <div className="max-h-72 overflow-y-auto space-y-3 px-1">
            {providers.map((provider) => {
              const providerModels = filteredModels.filter((m) => m.provider === provider);
              if (providerModels.length === 0) return null;

              return (
                <div key={provider}>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    {provider}
                  </div>
                  <div className="space-y-1">
                    {providerModels.map((model) => {
                      const isSelected = model.id === currentModel.id;

                      return (
                        <div
                          key={model.id}
                          onClick={() => handleSelect(model)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? isDark
                                ? 'bg-slate-800/90 ring-1 ring-[#10B981]'
                                : 'bg-[#E8EEFF]/80 ring-1 ring-[#10B981]'
                              : isDark
                              ? 'hover:bg-slate-800/60'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Round 2-letter badge (no company logos) */}
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: model.carbonColor }}
                              >
                                {model.badge}
                              </div>

                              {/* Model Name */}
                              <span className="font-semibold text-xs truncate">
                                {model.name}
                              </span>

                              {/* Size-tier tag */}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                  isDark
                                    ? 'bg-slate-800 text-slate-300'
                                    : 'bg-slate-100 text-[#64748B]'
                                }`}
                              >
                                {model.tier}
                              </span>

                              {model.isAuto && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981]">
                                  Recommended
                                </span>
                              )}
                            </div>

                            {/* Carbon badge + Checkmark */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{
                                  backgroundColor: `${model.carbonColor}20`,
                                  color: model.carbonColor,
                                }}
                              >
                                {model.carbonBadge}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
                              )}
                            </div>
                          </div>

                          {/* Carbon estimate per typical task and thin bar */}
                          <div className="flex items-center justify-between gap-3 text-[11px] text-[#64748B] pt-0.5">
                            <span>
                              {model.isAuto
                                ? 'Typical: 30 gCO₂e (Auto picks eco tier)'
                                : `Typical: ${model.gCO2e} gCO₂e · ₹${model.inrCost.toFixed(2)}`}
                            </span>

                            {/* Thin bar showing relative carbon intensity */}
                            <div className="w-20 bg-slate-200/50 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden shrink-0">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${model.barPercent}%`,
                                  backgroundColor: model.carbonColor,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer text */}
          <div
            className={`mt-2 pt-2 border-t px-2 text-[10px] text-center ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-[#64748B]'
            }`}
          >
            Illustrative estimates (simulated), not measured values
          </div>
        </div>
      )}
    </div>
  );
}
