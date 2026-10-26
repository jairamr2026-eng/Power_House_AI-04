// src/components/Sidebar.jsx
// Stage 2: Light sidebar with Powerhouse brand, navigation items with badges, live grid signal, and logout.
// Strictly NO employee name or profile card in the sidebar.

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  ListTodo,
  Award,
  Zap,
  LogOut,
  Leaf,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { points, tasks } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/home',
      label: 'Home Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/submit',
      label: 'Submit AI Task',
      icon: Sparkles,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981] text-white tracking-wide">
          New
        </span>
      ),
    },
    {
      to: '/tasks',
      label: 'My Tasks',
      icon: ListTodo,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E8EEFF] text-[#123C2D]">
          {tasks.length || 5}
        </span>
      ),
    },
    {
      to: '/points',
      label: 'Green Points',
      icon: Award,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10B981]/15 text-[#10B981]">
          {points} pts
        </span>
      ),
    },
    {
      to: '/grid',
      label: 'Grid Status',
      icon: Zap,
      badge: (
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-68 flex-col justify-between border-r border-slate-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4">
          {/* Logo Section: Leaf logo with "Powerhouse" in bold, "CarbonShield Companion" below */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#123C2D] flex items-center justify-center text-[#10B981] shadow-xs shrink-0">
              <Leaf className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <span className="block text-base font-bold text-[#0B1220] font-['Plus_Jakarta_Sans'] leading-tight">
                Powerhouse
              </span>
              <span className="block text-xs font-medium text-[#64748B] mt-0.5 whitespace-nowrap">
                CarbonShield Companion
              </span>
            </div>
          </div>

          {/* Navigation Items (Pill-shaped icon navigation) */}
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-2 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#123C2D] text-white shadow-xs font-semibold'
                        : 'text-[#64748B] hover:bg-[#E8EEFF]/60 hover:text-[#0B1220]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Small "Live grid signal" card */}
          <div className="p-3 rounded-xl bg-[#F4F7FB] border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#0B1220] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                Live grid signal
              </span>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded font-bold">
                640 g/kWh
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-tight">
              Solar influx expected at 1:30 PM
            </p>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-slate-200 text-xs font-medium text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
