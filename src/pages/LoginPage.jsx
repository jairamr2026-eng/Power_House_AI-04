// src/pages/LoginPage.jsx
// Stage 1: Minimal single-card login with mock authentication and work-schedule enforcement.
// Pressing Ctrl+Shift+H toggles simulated after-hours mode (no visible button).

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  Eye,
  EyeOff,
  Clock,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestException } from '../api/mockApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Keybinding toggle for simulating after hours: Ctrl+Shift+H (no visible button)
  const [simulateAfterHours, setSimulateAfterHours] = useState(false);

  // Modal 1: Your Workday Has Ended
  const [showWorkdayEndedModal, setShowWorkdayEndedModal] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);

  // Modal 2: Request after-hours access exception
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqStartTime, setReqStartTime] = useState('19:00');
  const [reqEndTime, setReqEndTime] = useState('21:00');
  const [reqReason, setReqReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestNotification, setRequestNotification] = useState(null);

  // Listen for Ctrl+Shift+H
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        setSimulateAfterHours((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError('');

    if (!email.trim()) {
      setValidationError('Please enter your Powerhouse work email.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    try {
      const result = await login(email, password, simulateAfterHours);
      if (result.outsideHours) {
        setAccessInfo(result.accessInfo);
        setShowWorkdayEndedModal(true);
      } else {
        navigate('/home');
      }
    } catch {
      // Error is set in AuthContext
    }
  };

  const handleOpenRequestModal = () => {
    setShowWorkdayEndedModal(false);
    setRequestNotification(null);
    setShowRequestModal(true);
  };

  const handleExceptionSubmit = async (e) => {
    e.preventDefault();
    if (!reqReason.trim()) {
      setValidationError('Please enter a business reason for after-hours access.');
      return;
    }

    setSubmittingRequest(true);
    try {
      const res = await requestException({
        startTime: reqStartTime,
        endTime: reqEndTime,
        reason: reqReason,
      });
      setSubmittingRequest(false);
      setRequestNotification(res);
    } catch (err) {
      setSubmittingRequest(false);
      setValidationError(err.message || 'Failed to submit exception request');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F7FB] text-[#0B1220] p-4 font-['Inter']">
      {/* Centered Single Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8">
        {/* Leaf Logo with "Powerhouse" */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#123C2D] flex items-center justify-center text-[#10B981] shadow-xs mb-3">
            <Leaf className="w-6 h-6 stroke-[2.4]" />
          </div>
          <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] tracking-tight">
            Powerhouse
          </h1>
        </div>

        {/* Validation or Auth Error Message */}
        {(validationError || error) && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/20 flex items-start gap-2 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0B1220] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@powerhouse.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#E8EEFF]/50 border border-slate-200 text-xs text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white transition-all"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1220] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#E8EEFF]/50 border border-slate-200 text-xs text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white transition-all pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1220] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#123C2D] hover:bg-[#1a4a39] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Tiny gray line under the button */}
        <p className="text-[11px] text-center text-[#64748B] mt-4">
          Demo: priya@powerhouse.com / demo123
        </p>
      </div>

      {/* MODAL 1: Your Workday Has Ended */}
      {showWorkdayEndedModal && accessInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#123C2D] text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-white">
                    Your Workday Has Ended
                  </h3>
                  <p className="text-xs text-slate-200">
                    Powerhouse Green Governance Policy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkdayEndedModal(false)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Schedule Card */}
            <div className="p-6 space-y-4">
              <div className="bg-[#F4F7FB] rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#123C2D]" />
                    Organization
                  </span>
                  <span className="font-semibold text-[#0B1220]">{accessInfo.organization}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#123C2D]" />
                    Working Days
                  </span>
                  <span className="font-semibold text-[#0B1220]">{accessInfo.workingDays}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#123C2D]" />
                    Working Hours
                  </span>
                  <span className="font-semibold text-[#0B1220]">{accessInfo.workingHours} (Asia/Kolkata)</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Current Time</span>
                  <span className="font-semibold text-[#DC2626]">{accessInfo.currentTime}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Next Working Period</span>
                  <span className="font-semibold text-[#10B981]">{accessInfo.nextWorkingPeriod}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#0B1220]">
                <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="text-[12px] text-[#64748B]">
                  Exception approval is required for after-hours tasks. Access is never granted automatically.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowWorkdayEndedModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleOpenRequestModal}
                className="px-4 py-2 rounded-lg bg-[#123C2D] hover:bg-[#1a4a39] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Request Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Request After-Hours Access */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#123C2D] text-white p-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-white">
                  Request After-Hours Access
                </h3>
                <p className="text-xs text-slate-200">
                  Submit exception request to supervisor
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestNotification ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#E8EEFF] text-[#123C2D] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8EEFF] text-[#123C2D] mb-1">
                    Status: Pending
                  </span>
                  <h4 className="text-base font-bold text-[#0B1220]">
                    Request Submitted Successfully
                  </h4>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    {requestNotification.message}
                  </p>
                  <p className="text-xs font-mono text-[#64748B] mt-1">
                    Request ID: {requestNotification.requestId}
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="w-full py-2.5 rounded-lg bg-[#123C2D] text-white text-xs font-semibold hover:bg-[#1a4a39] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExceptionSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0B1220] mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={reqStartTime}
                      onChange={(e) => setReqStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#E8EEFF]/60 border border-slate-200 text-xs text-[#0B1220] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0B1220] mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={reqEndTime}
                      onChange={(e) => setReqEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#E8EEFF]/60 border border-slate-200 text-xs text-[#0B1220] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0B1220] mb-1">
                    Business Reason
                  </label>
                  <textarea
                    rows={3}
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    placeholder="e.g. Critical production analysis requiring off-peak compute."
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEFF]/60 border border-slate-200 text-xs text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                    required
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-[#F4F7FB] border border-slate-200 text-[11px] text-[#64748B]">
                  <strong>Policy notice:</strong> Requests require supervisor sign-off. AI compute access is never granted automatically.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-4 py-2 rounded-lg bg-[#123C2D] hover:bg-[#1a4a39] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {submittingRequest ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
