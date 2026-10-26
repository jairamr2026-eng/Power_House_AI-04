// src/context/AppContext.jsx
// Shared application state: Green Points, carbon saved, tasks, chats, and theme.
// Adheres strictly to conversion factors:
// 1 phone charge = 8 gCO2e
// 1 km driven = 120 gCO2e
// 1 LED bulb hour = 6 gCO2e
// 1 tree-day = 60 gCO2e (approx.)
// Money in rupees (₹) ONLY for compute costs. Green Points never show rupees.

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getMyTasks,
  calculateCarbonEquivalents,
  MOCK_7_DAY_SAVINGS,
} from '../api/mockApi';

const AppContext = createContext(null);

const INITIAL_SAMPLE_CHATS = [
  {
    id: 'chat-sample-1',
    title: 'Q3 Financial Summary Report Analysis',
    date: 'Yesterday',
    modelId: 'claude-haiku',
    messages: [
      {
        id: 'msg-u-1',
        sender: 'user',
        text: 'Summarize key revenue drivers and EBITDA margins from 42 quarterly report PDFs.',
        urgency: 'Flexible',
        quality: 'Standard',
        deadline: 'Flexible',
      },
      {
        id: 'msg-a-1',
        sender: 'assistant',
        isThinking: false,
        modelLabel: 'Claude Haiku',
        introText: 'Analysis completed. Deferring to 2:00 PM peak solar window with Claude Haiku.',
        comparisonData: {
          taskId: 'task-sample-1',
          prompt: 'Summarize key revenue drivers and EBITDA margins from 42 quarterly report PDFs.',
          urgency: 'Flexible',
          quality: 'Standard',
          deadline: 'Flexible',
          typical: { name: 'Typical large model', model: 'Claude Opus', carbon: 30, cost: 4.0, time: '12 min' },
          suggested: { name: 'CarbonShield suggestion', model: 'Claude Haiku', carbon: 12, cost: 2.5, schedule: '2:00 PM', duration: '45 min' },
          savings: { gCO2e: 18, inr: 1.5, phoneCharges: 2, kmDriven: 0.2, text: '≈ 2 phone charges · 0.2 km approx.' },
          whyRecommendation: 'Routing from Claude Opus to Claude Haiku within Anthropic keeps the same prompt format while avoiding 18 gCO₂e of emissions.',
          disclaimer: { tag: 'Estimated', source: 'Source: simulated data' },
          pointsAwarded: 20,
          note: 'Points are earned only for verified actions during working hours.',
        },
      },
    ],
  },
  {
    id: 'chat-sample-2',
    title: 'Customer Support Sentiment Classification',
    date: '2 days ago',
    modelId: 'gemini-flash',
    messages: [
      {
        id: 'msg-u-2',
        sender: 'user',
        text: 'Classify 4,000 incoming Zendesk tickets into sentiment and routing categories.',
        urgency: 'Flexible',
        quality: 'Standard',
        deadline: 'Flexible',
      },
      {
        id: 'msg-a-2',
        sender: 'assistant',
        isThinking: false,
        modelLabel: 'Gemini Flash',
        introText: 'Workload benchmarked. Using Gemini Flash during clean solar window saves 48 gCO2e.',
        comparisonData: {
          taskId: 'task-sample-2',
          prompt: 'Classify 4,000 incoming Zendesk tickets into sentiment and routing categories.',
          urgency: 'Flexible',
          quality: 'Standard',
          deadline: 'Flexible',
          typical: { name: 'Gemini Pro', model: 'Gemini Pro', carbon: 30, cost: 4.0, time: '12 min' },
          suggested: { name: 'CarbonShield suggestion', model: 'Gemini Flash', carbon: 12, cost: 2.5, schedule: '2:00 PM', duration: '45 min' },
          savings: { gCO2e: 18, inr: 1.5, phoneCharges: 2, kmDriven: 0.2, text: '≈ 2 phone charges · 0.2 km approx.' },
          whyRecommendation: 'Gemini Flash provides identical sentiment categorization accuracy with a 60% lower carbon footprint.',
          disclaimer: { tag: 'Estimated', source: 'Source: simulated data' },
          pointsAwarded: 20,
          note: 'Points are earned only for verified actions during working hours.',
        },
      },
    ],
  },
  {
    id: 'chat-sample-3',
    title: 'Weekly Codebase Vulnerability Scan',
    date: '3 days ago',
    modelId: 'chatgpt-mini',
    messages: [
      {
        id: 'msg-u-3',
        sender: 'user',
        text: 'Audit core payments and auth repositories for CVE security vulnerabilities.',
        urgency: 'Flexible',
        quality: 'High',
        deadline: 'End of Day',
      },
      {
        id: 'msg-a-3',
        sender: 'assistant',
        isThinking: false,
        modelLabel: 'ChatGPT mini',
        introText: 'Code security audit configured with specialized pattern scanning model.',
        comparisonData: {
          taskId: 'task-sample-3',
          prompt: 'Audit core payments and auth repositories for CVE security vulnerabilities.',
          urgency: 'Flexible',
          quality: 'High',
          deadline: 'End of Day',
          typical: { name: 'ChatGPT flagship', model: 'ChatGPT flagship', carbon: 30, cost: 4.0, time: '12 min' },
          suggested: { name: 'CarbonShield suggestion', model: 'ChatGPT mini', carbon: 12, cost: 2.5, schedule: '2:00 PM', duration: '45 min' },
          savings: { gCO2e: 18, inr: 1.5, phoneCharges: 2, kmDriven: 0.2, text: '≈ 2 phone charges · 0.2 km approx.' },
          whyRecommendation: 'Defers compilation analysis to 2:00 PM solar hours while preserving CVE pattern matching accuracy.',
          disclaimer: { tag: 'Estimated', source: 'Source: simulated data' },
          pointsAwarded: 20,
          note: 'Points are earned only for verified actions during working hours.',
        },
      },
    ],
  },
];

export function AppProvider({ children }) {
  // 1. Green Points in shared state
  const [points, setPoints] = useState(() => {
    try {
      const stored = localStorage.getItem('carbonshield_points');
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) return val;
      }
    } catch {}
    return 320;
  });

  // 2. Carbon Saved in shared state
  const [carbonSaved, setCarbonSaved] = useState(() => {
    try {
      const stored = localStorage.getItem('carbonshield_carbon_saved');
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) return val;
      }
    } catch {}
    return 482;
  });

  // 3. 7-Day Savings Trend
  const [sevenDaySavings, setSevenDaySavings] = useState(() => {
    try {
      const stored = localStorage.getItem('carbonshield_seven_day_savings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return MOCK_7_DAY_SAVINGS;
  });

  // 4. Tasks list in shared state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // 5. Chats in shared state (persisted in localStorage)
  const [chats, setChats] = useState(() => {
    try {
      const stored = localStorage.getItem('carbonshield_saved_chats');
      return stored ? JSON.parse(stored) : INITIAL_SAMPLE_CHATS;
    } catch {
      return INITIAL_SAMPLE_CHATS;
    }
  });

  // 6. Theme in shared state: dark by default, remembered in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('carbonshield_chat_theme') || 'dark';
  });

  // 7. Selected Model choice: remembered in localStorage
  const [selectedModelId, setSelectedModelId] = useState(() => {
    return localStorage.getItem('carbonshield_selected_model') || 'auto';
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('carbonshield_points', String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem('carbonshield_carbon_saved', String(carbonSaved));
  }, [carbonSaved]);

  useEffect(() => {
    localStorage.setItem('carbonshield_seven_day_savings', JSON.stringify(sevenDaySavings));
  }, [sevenDaySavings]);

  useEffect(() => {
    localStorage.setItem('carbonshield_saved_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('carbonshield_chat_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('carbonshield_selected_model', selectedModelId);
  }, [selectedModelId]);

  // Load initial tasks
  useEffect(() => {
    let mounted = true;
    async function loadTasks() {
      try {
        const list = await getMyTasks();
        if (mounted) {
          setTasks(list);
          setTasksLoading(false);
        }
      } catch (err) {
        console.error('Failed to load tasks', err);
        if (mounted) setTasksLoading(false);
      }
    }
    loadTasks();
    return () => {
      mounted = false;
    };
  }, []);

  // Badge animation key to animate every points number, ring, bar
  const [badgeAnimateKey, setBadgeAnimateKey] = useState(0);

  const triggerBadgeAnimation = () => {
    setBadgeAnimateKey((prev) => prev + 1);
  };

  // Real-world carbon equivalents
  const equivalents = calculateCarbonEquivalents(carbonSaved);

  /**
   * addPointsAndCarbon:
   * Called when CarbonShield recommendation is accepted.
   * Immediately updates shared state and triggers animation.
   */
  const addPointsAndCarbon = (pointsToAdd = 20, co2ToAdd = 18) => {
    setPoints((prev) => prev + pointsToAdd);
    setCarbonSaved((prev) => prev + co2ToAdd);
    setSevenDaySavings((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          ...updated[lastIdx],
          saved: updated[lastIdx].saved + co2ToAdd,
        };
      }
      return updated;
    });
    triggerBadgeAnimation();
  };

  const deductPoints = (amount) => {
    setPoints((prev) => Math.max(0, prev - amount));
    triggerBadgeAnimation();
  };

  const value = {
    // Shared state items
    points,
    setPoints,
    carbonSaved,
    setCarbonSaved,
    sevenDaySavings,
    setSevenDaySavings,
    tasks,
    setTasks,
    tasksLoading,
    chats,
    setChats,
    theme,
    setTheme,
    selectedModelId,
    setSelectedModelId,
    // Utilities & animations
    equivalents,
    addPointsAndCarbon,
    deductPoints,
    badgeAnimateKey,
    triggerBadgeAnimation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
