// Stage 1: Minimal single-card login with mock authentication.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

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
      await login(email, password);
      navigate('/home');
    } catch {
      // Error is set in AuthContext
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F7FB] text-[#0B1220] p-4 font-['Inter']">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#123C2D] flex items-center justify-center text-[#10B981] shadow-xs mb-3">
            <Leaf className="w-6 h-6 stroke-[2.4]" />
          </div>
          <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#0B1220] tracking-tight">
            Powerhouse
          </h1>
        </div>

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

        <p className="text-[11px] text-center text-[#64748B] mt-4">
          Demo: priya@powerhouse.com / demo123
        </p>
      </div>
    </div>
  );
}
