// src/api/mockApi.js
// Holds all mock data and endpoints for Powerhouse: CarbonShield Companion.
// Every function checks USE_MOCK: if true returns mock data (as a Promise),
// otherwise delegates to the real backend via client.js.

import { USE_MOCK } from './config';
import { apiClient } from './client';

// ================= CONSTANTS & CONVERSIONS =================
// 1 phone charge = 8 gCO2e
// 1 km driven = 120 gCO2e
// 1 LED bulb hour = 6 gCO2e
// 1 tree-day = 60 gCO2e (approx.)
export const CONVERSION_RATE = {
  GCO2E_PER_PHONE_CHARGE: 8,
  GCO2E_PER_KM_DRIVEN: 120,
  GCO2E_PER_LED_HOUR: 6,
  GCO2E_PER_TREE_DAY: 60,
};

export function calculateCarbonEquivalents(gCO2e) {
  const amount = Number(gCO2e) || 0;
  const phoneCharges = Math.round(amount / CONVERSION_RATE.GCO2E_PER_PHONE_CHARGE);
  const kmDriven = +(amount / CONVERSION_RATE.GCO2E_PER_KM_DRIVEN).toFixed(1);
  const ledHours = Math.round(amount / CONVERSION_RATE.GCO2E_PER_LED_HOUR);
  const treeDays = +(amount / CONVERSION_RATE.GCO2E_PER_TREE_DAY).toFixed(1);

  return {
    phoneCharges,
    kmDriven,
    ledHours,
    treeDays,
    text: `≈ ${phoneCharges} phone charges · ${kmDriven} km approx.`,
  };
}

// ================= MOCK DATA STORES =================

export const MOCK_USER = {
  id: 'usr-priya-01',
  name: 'Priya Sharma',
  email: 'priya@powerhouse.com',
  role: 'Employee',
  department: 'Data & AI Engineering',
  avatar: 'PS',
  badge: 'Eco Pioneer',
  points: 320,
  carbonSaved: 482,
};

export const MOCK_WORK_SCHEDULE = {
  organization: 'Powerhouse',
  workingDays: 'Mon - Fri',
  workDaysList: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  workingHours: '9:00 AM - 6:00 PM',
  timezone: 'Asia/Kolkata',
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
  nextWorkingPeriod: 'Tomorrow at 9:00 AM',
};

// Stage 4 Models: Kept in one list, brand names without version numbers
// Claude Opus, Claude Sonnet, Claude Haiku, Gemini Pro, Gemini Flash, ChatGPT flagship, ChatGPT mini
export const AI_MODELS = [
  {
    id: 'auto',
    name: 'Auto (CarbonShield recommended)',
    shortName: 'Auto',
    provider: 'CarbonShield',
    badge: 'AU',
    tier: 'Recommended',
    carbonBadge: 'Low',
    carbonColor: '#10B981',
    gCO2e: 12,
    inrCost: 2.5,
    barPercent: 40,
    isAuto: true,
  },
  // Anthropic Models
  {
    id: 'claude-opus',
    name: 'Claude Opus',
    shortName: 'Opus',
    provider: 'Anthropic',
    badge: 'CO',
    tier: 'Large',
    carbonBadge: 'High',
    carbonColor: '#DC2626',
    gCO2e: 30,
    inrCost: 4.0,
    barPercent: 100,
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    shortName: 'Sonnet',
    provider: 'Anthropic',
    badge: 'CS',
    tier: 'Medium',
    carbonBadge: 'Medium',
    carbonColor: '#F59E0B',
    gCO2e: 20,
    inrCost: 3.0,
    barPercent: 66,
  },
  {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    shortName: 'Haiku',
    provider: 'Anthropic',
    badge: 'CH',
    tier: 'Small',
    carbonBadge: 'Low',
    carbonColor: '#10B981',
    gCO2e: 12,
    inrCost: 2.5,
    barPercent: 40,
  },
  // Google Models
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    shortName: 'Gemini Pro',
    provider: 'Google',
    badge: 'GP',
    tier: 'Large',
    carbonBadge: 'High',
    carbonColor: '#DC2626',
    gCO2e: 30,
    inrCost: 4.0,
    barPercent: 100,
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    shortName: 'Gemini Flash',
    provider: 'Google',
    badge: 'GF',
    tier: 'Small',
    carbonBadge: 'Low',
    carbonColor: '#10B981',
    gCO2e: 12,
    inrCost: 2.5,
    barPercent: 40,
  },
  // OpenAI Models
  {
    id: 'chatgpt-flagship',
    name: 'ChatGPT flagship',
    shortName: 'ChatGPT flagship',
    provider: 'OpenAI',
    badge: 'CF',
    tier: 'Large',
    carbonBadge: 'High',
    carbonColor: '#DC2626',
    gCO2e: 30,
    inrCost: 4.0,
    barPercent: 100,
  },
  {
    id: 'chatgpt-mini',
    name: 'ChatGPT mini',
    shortName: 'ChatGPT mini',
    provider: 'OpenAI',
    badge: 'CM',
    tier: 'Small',
    carbonBadge: 'Low',
    carbonColor: '#10B981',
    gCO2e: 12,
    inrCost: 2.5,
    barPercent: 40,
  },
];

// Stage 5 sample tasks (5 tasks)
export const MOCK_TASKS = [
  {
    id: 'task-101',
    name: 'Q3 Financial Summary Report Analysis',
    prompt: 'Summarize key revenue drivers and EBITDA margins from 42 quarterly report PDFs.',
    status: 'Completed',
    date: '2026-10-25 14:30',
    modelUsed: 'Claude Haiku',
    typicalModel: 'Claude Opus',
    gCO2eSaved: 24,
    inrSaved: 3.20,
    equivalence: '3 phone charges · 0.2 km driven',
    urgency: 'Flexible',
    quality: 'Standard',
  },
  {
    id: 'task-102',
    name: 'Customer Support Sentiment Classification (Batch 4k)',
    prompt: 'Classify 4,000 incoming Zendesk tickets into sentiment and routing categories.',
    status: 'Completed',
    date: '2026-10-25 11:15',
    modelUsed: 'Gemini Flash',
    typicalModel: 'Gemini Pro',
    gCO2eSaved: 48,
    inrSaved: 6.50,
    equivalence: '6 phone charges · 0.4 km driven',
    urgency: 'Flexible',
    quality: 'Standard',
  },
  {
    id: 'task-103',
    name: 'Weekly Codebase Vulnerability Scan',
    prompt: 'Audit core payments and auth repositories for CVE security vulnerabilities.',
    status: 'Scheduled',
    date: '2026-10-26 14:00',
    modelUsed: 'ChatGPT mini',
    typicalModel: 'ChatGPT flagship',
    gCO2eSaved: 36,
    inrSaved: 4.80,
    equivalence: '4.5 phone charges · 0.3 km driven',
    urgency: 'Flexible',
    quality: 'High',
  },
  {
    id: 'task-104',
    name: 'Product Catalog Image Tagging & Embeddings',
    prompt: 'Generate multi-modal embeddings for 1,200 new autumn inventory SKUs.',
    status: 'Completed',
    date: '2026-10-24 16:45',
    modelUsed: 'Claude Haiku',
    typicalModel: 'Claude Sonnet',
    gCO2eSaved: 64,
    inrSaved: 8.40,
    equivalence: '8 phone charges · 0.5 km driven',
    urgency: 'Flexible',
    quality: 'Standard',
  },
  {
    id: 'task-105',
    name: 'Executive Briefing Audio Transcription',
    prompt: 'Transcribe 90-minute board briefing audio into formatted markdown with speakers.',
    status: 'Scheduled',
    date: '2026-10-26 13:45',
    modelUsed: 'Gemini Flash',
    typicalModel: 'Gemini Pro',
    gCO2eSaved: 16,
    inrSaved: 2.10,
    equivalence: '2 phone charges · 0.1 km driven',
    urgency: 'Urgent',
    quality: 'High',
  },
];

// Stage 6 Green Points Perks & History
export const MOCK_PERKS = [
  {
    id: 'perk-cafe',
    name: 'Café Cup',
    costPoints: 200,
    icon: 'Coffee',
  },
  {
    id: 'perk-gift',
    name: 'Gift Card',
    costPoints: 500,
    icon: 'Gift',
  },
  {
    id: 'perk-metro',
    name: 'EV and Metro Pass',
    costPoints: 800,
    icon: 'Zap',
  },
];

export const MOCK_POINTS_HISTORY = [
  {
    id: 'hist-1',
    title: 'Carbon-Optimized Task Scheduled',
    points: 20,
    type: 'earned',
    date: '26 Oct',
  },
  {
    id: 'hist-2',
    title: 'Batch Sentiment Analysis Optimized',
    points: 20,
    type: 'earned',
    date: '25 Oct',
  },
  {
    id: 'hist-3',
    title: 'Cafe Voucher Redeemed',
    points: -200,
    type: 'redeemed',
    date: '23 Oct',
  },
];

export const MOCK_SPARKLINE_DATA = [
  { p: 200 },
  { p: 220 },
  { p: 270 },
  { p: 70 },
  { p: 120 },
  { p: 300 },
  { p: 320 },
];

export const MOCK_7_DAY_SAVINGS = [
  { day: 'Mon', saved: 52 },
  { day: 'Tue', saved: 74 },
  { day: 'Wed', saved: 61 },
  { day: 'Thu', saved: 88 },
  { day: 'Fri', saved: 79 },
  { day: 'Sat', saved: 48 },
  { day: 'Sun', saved: 80 },
];

export const MOCK_GRID_STATUS = {
  region: 'India - South Grid (Simulated)',
  currentIntensity: 640,
  unit: 'gCO₂/kWh',
  cleanerIn: '3h',
  liveSignal: '640 g/kWh',
  signalNote: 'Solar influx expected at 1:30 PM',
  nextCleanWindow: {
    time: '1:30 PM - 4:00 PM',
    countdown: 'Starts in 3h 15m',
    intensityDrop: 'Down to 370 gCO₂/kWh (-42%)',
  },
  disclaimer: 'Source: Simulated regional power dispatch model for hackathon demonstration. Calibrated against southern Indian electrical grid diurnal solar cycles.',
  hourlyTrend: [
    { time: '00:00', intensity: 710 },
    { time: '02:00', intensity: 690 },
    { time: '04:00', intensity: 670 },
    { time: '06:00', intensity: 680 },
    { time: '08:00', intensity: 720 },
    { time: '10:00', intensity: 610 },
    { time: '11:30', intensity: 480 },
    { time: '13:00', intensity: 390 },
    { time: '14:00', intensity: 370 },
    { time: '15:30', intensity: 410 },
    { time: '17:00', intensity: 580 },
    { time: '18:30', intensity: 730 },
    { time: '20:00', intensity: 750 },
    { time: '22:00', intensity: 700 },
  ],
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Calculate current time in Asia/Kolkata
export function getCurrentKolkataTimeInfo() {
  const now = new Date();
  const kolkataTimeString = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const kolkataDay = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  });

  // Calculate hour and minute in Kolkata
  const kolkataParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour = parseInt(kolkataParts.find((p) => p.type === 'hour')?.value || '12', 10);
  const minute = parseInt(kolkataParts.find((p) => p.type === 'minute')?.value || '0', 10);

  const isWeekend = kolkataDay === 'Saturday' || kolkataDay === 'Sunday';
  const currentTotalMinutes = hour * 60 + minute;
  // Derive bounds from MOCK_WORK_SCHEDULE so the check always matches the displayed policy.
  const startTotalMinutes = MOCK_WORK_SCHEDULE.startHour * 60 + MOCK_WORK_SCHEDULE.startMinute;
  const endTotalMinutes = MOCK_WORK_SCHEDULE.endHour * 60 + MOCK_WORK_SCHEDULE.endMinute;

  const isWithinHours = !isWeekend && currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;

  return {
    day: kolkataDay,
    timeText: kolkataTimeString,
    fullText: `${kolkataDay}, ${kolkataTimeString} (Asia/Kolkata)`,
    isWithinHours,
  };
}

// ================= STAGE 8 API FUNCTIONS =================

/**
 * login -> POST /api/auth/login
 * Validates credentials and returns fake token and user info without password.
 * May later be replaced by Supabase sign-in.
 */
export async function login(email, password) {
  if (!USE_MOCK) {
    throw new Error('Use Supabase Auth through the login form.');
  }

  await delay(350);
  if (email.trim().toLowerCase() === 'priya@powerhouse.com' && password === 'demo123') {
    const fakeToken = 'mock-jwt-token-priya-sharma-powerhouse-2026';
    localStorage.setItem('carbonshield_token', fakeToken);
    return {
      token: fakeToken,
      user: { ...MOCK_USER },
    };
  }
  throw new Error('Invalid email or password. Please use priya@powerhouse.com / demo123');
}

/**
 * getMe -> GET /api/me
 * Returns currently authenticated employee profile.
 */
export async function getMe() {
  if (!USE_MOCK) {
    return apiClient('/me');
  }

  await delay(150);
  return { ...MOCK_USER };
}

/**
 * getAccessStatus -> GET /api/me/access-status
 * Evaluates whether current employee is within working hours (Mon-Fri 9:00 AM - 6:00 PM Asia/Kolkata).
 */
export async function getAccessStatus(simulateAfterHours = false) {
  if (!USE_MOCK) {
    return apiClient('/users/me/access-status');
  }

  await delay(200);
  const timeInfo = getCurrentKolkataTimeInfo();

  if (simulateAfterHours) {
    return {
      allowed: false,
      reason: 'outside_working_hours',
      currentTime: '7:45 PM (Asia/Kolkata, Simulated)',
      organization: MOCK_WORK_SCHEDULE.organization,
      workingDays: MOCK_WORK_SCHEDULE.workingDays,
      workingHours: MOCK_WORK_SCHEDULE.workingHours,
      nextWorkingPeriod: MOCK_WORK_SCHEDULE.nextWorkingPeriod,
      simulated: true,
    };
  }

  if (!timeInfo.isWithinHours) {
    return {
      allowed: false,
      reason: 'outside_working_hours',
      currentTime: timeInfo.fullText,
      organization: MOCK_WORK_SCHEDULE.organization,
      workingDays: MOCK_WORK_SCHEDULE.workingDays,
      workingHours: MOCK_WORK_SCHEDULE.workingHours,
      nextWorkingPeriod: MOCK_WORK_SCHEDULE.nextWorkingPeriod,
      simulated: false,
    };
  }

  return {
    allowed: true,
    currentTime: timeInfo.fullText,
    organization: MOCK_WORK_SCHEDULE.organization,
    workingDays: MOCK_WORK_SCHEDULE.workingDays,
    workingHours: MOCK_WORK_SCHEDULE.workingHours,
  };
}

/**
 * getWorkSchedule -> GET /api/me/work-schedule
 * Returns official working hours policy (Powerhouse, Mon-Fri, 9:00 AM - 6:00 PM, Asia/Kolkata).
 */
export async function getWorkSchedule() {
  if (!USE_MOCK) {
    return apiClient('/users/me/access-status');
  }

  await delay(150);
  return { ...MOCK_WORK_SCHEDULE };
}

/**
 * requestException -> POST /api/employee/exception-requests
 * Submits employee after-hours exception request. Always returns Pending review.
 */
export async function requestException(payload) {
  if (!USE_MOCK) {
    return apiClient('/employee/exception-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  await delay(400);
  const requestId = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    success: true,
    status: 'Pending',
    requestId,
    startTime: payload.startTime,
    endTime: payload.endTime,
    reason: payload.reason,
    message: 'Exception request submitted and marked Pending. A supervisor must review before after-hours AI compute is permitted.',
  };
}

/**
 * getDashboardStats -> GET /api/me/dashboard
 * Retrieves Green Points, carbon saved, 7-day trend, and current grid metric.
 */
export async function getDashboardStats() {
  if (!USE_MOCK) {
    return apiClient('/me/dashboard');
  }

  await delay(200);
  return {
    points: 320,
    carbonSaved: 482,
    gridIntensity: 640,
    cleanerIn: '3h',
    cleanEnergyWindowStarts: '3h 15m',
    recentTasks: MOCK_TASKS.slice(0, 3).map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      gCO2eSaved: t.gCO2eSaved,
    })),
    sevenDaySavings: MOCK_7_DAY_SAVINGS,
  };
}

/**
 * getMyTasks -> GET /api/me/tasks
 * Returns audit list of 5 sample tasks with compute cost and carbon savings.
 */
export async function getMyTasks() {
  if (!USE_MOCK) {
    return apiClient('/me/tasks');
  }

  await delay(200);
  return [...MOCK_TASKS];
}

/**
 * getModels -> GET /api/models
 * Returns the catalog of AI models with tiers, carbon intensity, and compute costs.
 */
export async function getModels() {
  if (!USE_MOCK) {
    return apiClient('/models');
  }

  await delay(150);
  return [...AI_MODELS];
}

/**
 * submitTask -> POST /api/tasks
 * Analyzes prompt, selected model, and constraints; calculates carbon comparison.
 */
export async function submitTask({ prompt, modelId = 'auto', urgency = 'Flexible', quality = 'Standard', deadline = 'Flexible' }) {
  if (!USE_MOCK) {
    return apiClient('/tasks', {
      method: 'POST',
      body: JSON.stringify({ prompt, modelId, urgency, quality, deadline }),
    });
  }

  await delay(400);

  // Determine user's selected model details
  let userModel = AI_MODELS.find((m) => m.id === modelId);
  const isAuto = !userModel || userModel.isAuto;

  let typicalModelName = 'Typical large model';
  let typicalCarbon = 30;
  let typicalCost = 4.0;
  let typicalTime = '12 min';

  if (!isAuto && userModel) {
    typicalModelName = userModel.name;
    typicalCarbon = userModel.gCO2e;
    typicalCost = userModel.inrCost;
  }

  // Determine suggestion: Smallest tier from the SAME provider
  // Opus or Sonnet -> Haiku
  // Gemini Pro -> Flash
  // ChatGPT flagship -> mini
  // Auto -> Haiku / Flash / mini (CarbonShield recommended low-carbon model)
  let suggestedModel = AI_MODELS.find((m) => m.id === 'claude-haiku');
  if (userModel?.provider === 'Google') {
    suggestedModel = AI_MODELS.find((m) => m.id === 'gemini-flash');
  } else if (userModel?.provider === 'OpenAI') {
    suggestedModel = AI_MODELS.find((m) => m.id === 'chatgpt-mini');
  }

  const isAlreadyLowCarbon = !isAuto && userModel?.tier === 'Small';

  // Savings calculation: difference between selected and suggested
  const carbonSaved = isAlreadyLowCarbon ? 0 : Math.max(0, typicalCarbon - (suggestedModel?.gCO2e || 12));
  const inrSaved = +(Math.max(0, typicalCost - (suggestedModel?.inrCost || 2.5))).toFixed(2);

  // Time & schedule:
  // If urgency is Urgent: recommend running now with no delay.
  // Otherwise: cleaner run time of 2:00 PM and 45 min.
  const isUrgent = urgency === 'Urgent';
  const scheduleTime = isUrgent ? 'Run now (no delay)' : '2:00 PM';
  const duration = isUrgent ? '12 min' : '45 min';

  const equiv = calculateCarbonEquivalents(carbonSaved || 18);

  let whyRecommendation = '';
  if (isAlreadyLowCarbon) {
    whyRecommendation = isUrgent
      ? `You already chose ${userModel.name}, which is a low-carbon model. With urgent priority, running now immediately with zero deferral.`
      : `You already chose ${userModel.name}, which is a low-carbon model. Scheduling at 2:00 PM aligns with the Southern Grid peak solar influx for cleanest power.`;
  } else if (isUrgent) {
    whyRecommendation = `Urgent priority specified: routing to ${suggestedModel.name} to minimize emissions per token while executing immediately with no delay.`;
  } else {
    whyRecommendation = `Routing from ${typicalModelName} to ${suggestedModel.name} and deferring execution to 2:00 PM harnesses peak solar grid generation, saving ${carbonSaved} gCO₂e.`;
  }

  const taskId = `task-${Date.now()}`;

  return {
    taskId,
    prompt,
    selectedModelId: modelId,
    alreadyLowCarbon: isAlreadyLowCarbon,
    isUrgent,
    typical: {
      name: isAuto ? 'Typical large model' : userModel.name,
      model: isAuto ? 'Typical large model' : userModel.name,
      carbon: typicalCarbon,
      cost: typicalCost,
      time: typicalTime,
    },
    suggested: {
      name: 'CarbonShield suggestion',
      model: isAlreadyLowCarbon ? userModel.name : suggestedModel.name,
      carbon: isAlreadyLowCarbon ? userModel.gCO2e : suggestedModel.gCO2e,
      cost: isAlreadyLowCarbon ? userModel.inrCost : suggestedModel.inrCost,
      schedule: scheduleTime,
      duration,
    },
    savings: {
      gCO2e: carbonSaved,
      inr: inrSaved,
      phoneCharges: equiv.phoneCharges,
      kmDriven: equiv.kmDriven,
      text: equiv.text,
    },
    whyRecommendation,
    disclaimer: {
      tag: 'Estimated',
      source: 'Source: simulated data',
    },
    pointsAwarded: 20,
    note: 'Points are earned only for verified actions during working hours.',
  };
}

/**
 * acceptTask -> POST /api/tasks/{id}/accept
 * Accepts CarbonShield recommendation: schedules task and awards +20 Green Points.
 */
export async function acceptTask(id, payload = {}) {
  if (!USE_MOCK) {
    return apiClient(`/tasks/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  await delay(350);
  const pointsAwarded = 20;
  const gCO2eSaved = payload.savings?.gCO2e || 18;
  const inrSaved = payload.savings?.inr || 1.50;

  const newTask = {
    id: id || `task-${Date.now()}`,
    name: payload.prompt ? (payload.prompt.slice(0, 40) + '...') : 'Optimized AI Task',
    prompt: payload.prompt || '',
    status: payload.isUrgent ? 'Completed' : 'Scheduled',
    date: 'Today',
    modelUsed: payload.suggested?.model || 'Claude Haiku',
    typicalModel: payload.typical?.model || 'Typical large model',
    gCO2eSaved,
    inrSaved,
    equivalence: `${Math.round(gCO2eSaved / 8)} phone charges · ${+(gCO2eSaved / 120).toFixed(1)} km driven`,
    urgency: payload.isUrgent ? 'Urgent' : 'Flexible',
    quality: 'Standard',
  };

  return {
    success: true,
    taskId: id,
    pointsAwarded,
    gCO2eSaved,
    task: newTask,
    note: 'Points are earned only for verified actions during working hours.',
  };
}

/**
 * getGreenPoints -> GET /api/me/green-points
 * Retrieves points balance, perks catalog, 7-day savings, and points history.
 */
export async function getGreenPoints() {
  if (!USE_MOCK) {
    return apiClient('/me/green-points');
  }

  await delay(200);
  return {
    balance: 320,
    target: 500,
    perks: [...MOCK_PERKS],
    history: [...MOCK_POINTS_HISTORY],
    sparkline: [...MOCK_SPARKLINE_DATA],
    sevenDaySavings: [...MOCK_7_DAY_SAVINGS],
  };
}

/**
 * getGridStatus -> GET /api/grid/status
 * Retrieves current regional grid intensity, 24-hr forecast, and next solar window.
 */
export async function getGridStatus() {
  if (!USE_MOCK) {
    return apiClient('/grid/status');
  }

  await delay(200);
  return { ...MOCK_GRID_STATUS };
}

// ================= REDEEM VOUCHER HELPER =================
export async function redeemRewardVoucher(perkId) {
  await delay(300);
  const perk = MOCK_PERKS.find((p) => p.id === perkId);
  const cost = perk ? perk.costPoints : 200;

  return {
    success: true,
    cost,
    perkName: perk?.name || 'Perk',
    historyItem: {
      id: `hist-${Date.now()}`,
      title: `${perk?.name || 'Voucher'} Redeemed`,
      points: -cost,
      type: 'redeemed',
      date: 'Today',
    },
  };
}
