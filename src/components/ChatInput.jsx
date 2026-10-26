// src/components/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Clock, Sparkles, Flame } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled = false, initialText = '' }) {
  const [inputText, setInputText] = useState(initialText);
  const [urgency, setUrgency] = useState('Flexible'); // 'Flexible' | 'Urgent'
  const [quality, setQuality] = useState('Standard'); // 'Standard' | 'High'
  const [deadline, setDeadline] = useState('Flexible'); // 'Flexible' | 'Within 1 hr' | 'Before 5:00 PM' | 'End of Day'
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialText]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || disabled) return;

    onSendMessage({
      text: inputText.trim(),
      urgency,
      quality,
      deadline,
    });
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const deadlineOptions = ['Flexible', 'Within 1 hr', 'Before 5:00 PM', 'End of Day'];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Configuration Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-2 px-1 text-xs">
        {/* Urgency Chip: Flexible vs Urgent */}
        <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-900/80 p-0.5">
          <button
            type="button"
            onClick={() => setUrgency('Flexible')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              urgency === 'Flexible'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Flexible (Eco)</span>
          </button>
          <button
            type="button"
            onClick={() => setUrgency('Urgent')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              urgency === 'Urgent'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3 w-3" />
            <span>Urgent</span>
          </button>
        </div>

        {/* Quality Chip: Standard vs High */}
        <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-900/80 p-0.5">
          <button
            type="button"
            onClick={() => setQuality('Standard')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              quality === 'Standard'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setQuality('High')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              quality === 'High'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High Quality
          </button>
        </div>

        {/* Deadline selector dropdown chip */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300">
          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-400">Deadline:</span>
          <select
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="bg-transparent font-medium text-emerald-400 outline-none cursor-pointer text-[11px]"
          >
            {deadlineOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Input Container (ChatGPT Style) */}
      <div className="relative flex flex-col rounded-2xl border border-slate-700/80 bg-[#0d1424]/90 p-2 shadow-2xl backdrop-blur-md focus-within:border-emerald-500/70 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask CarbonShield Companion to run an AI task (e.g. summarize report, classify data, run code tests)..."
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none min-h-[44px] max-h-[160px]"
        />

        {/* Bottom bar inside input */}
        <div className="flex items-center justify-between pt-1 px-2 border-t border-slate-800/60 mt-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Shift + Enter for new line</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputText.trim() || disabled}
            aria-label="Send AI task prompt"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <div className="mt-2 text-center text-[10px] text-slate-500">
        CarbonShield Companion optimizes cloud compute with regional green energy grids.
      </div>
    </div>
  );
}
