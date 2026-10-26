// src/components/TopBar.jsx
// Stage 2 Top Bar:
// Page title with subtitle "Powerhouse Employee Sustainability Portal",
// Region dropdown (India - South Grid, 640 gCO2/kWh, simulated),
// Primary "Submit Task" button,
// Priya avatar with "Priya Sharma" in bold and "Powerhouse" in small gray beneath (hidden on small screens).

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// NOTE: Replacing src/assets/priya-avatar.svg with a real photo of the same name updates it everywhere across the app.
import priyaAvatar from '../assets/priya-avatar.svg';

export default function TopBar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { points } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('India - South Grid, 640 gCO2/kWh, simulated');

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/home':
        return 'Home Dashboard';
      case '/submit':
        return 'Submit AI Task';
      case '/tasks':
        return 'My Tasks';
      case '/points':
        return 'Green Points';
      case '/grid':
        return 'Grid Status';
      default:
        return 'CarbonShield Companion';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger + Page Title + Subtitle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B1220] hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold text-[#0B1220] font-['Plus_Jakarta_Sans'] leading-none">
            {getPageTitle()}
          </h1>
          <span className="text-[11px] text-[#64748B] hidden sm:inline">
            Powerhouse Employee Sustainability Portal
          </span>
        </div>
      </div>

      {/* Right: Region dropdown, "Submit Task" primary button, Priya avatar with name */}
      <div className="flex items-center gap-3">
        {/* Region Dropdown */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F7FB] border border-slate-200 text-xs text-[#0B1220]">
          <Globe className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none text-xs text-[#0B1220] focus:outline-none font-medium cursor-pointer"
          >
            <option value="India - South Grid, 640 gCO2/kWh, simulated">
              India - South Grid, 640 gCO2/kWh, simulated
            </option>
            <option value="India - West Grid, 710 gCO2/kWh, simulated">
              India - West Grid, 710 gCO2/kWh, simulated
            </option>
            <option value="India - North Grid, 690 gCO2/kWh, simulated">
              India - North Grid, 690 gCO2/kWh, simulated
            </option>
          </select>
        </div>

        {/* Primary Action Button: "Submit Task" */}
        <button
          type="button"
          onClick={() => navigate('/submit')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123C2D] hover:bg-[#1a4a39] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Submit Task</span>
        </button>

        {/* Priya Sharma Avatar & Name */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={priyaAvatar}
            alt={user?.name || 'Priya Sharma'}
            title={`${user?.name || 'Priya Sharma'} (${points} pts)`}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#10B981]/30 shrink-0"
          />
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-[#0B1220] font-['Plus_Jakarta_Sans']">
              {user?.name || 'Priya Sharma'}
            </span>
            <span className="text-[11px] text-[#64748B]">
              Powerhouse
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
