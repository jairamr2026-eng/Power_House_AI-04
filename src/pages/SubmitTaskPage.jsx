// src/pages/SubmitTaskPage.jsx
// Stage 4: ChatGPT / Claude style AI Task Optimizer
// - Collapsible history panel on left, dark by default (#0B1220) with sun/moon toggle
// - Empty state: ONLY "Welcome back, Priya" (centered, medium size)
// - Fixed bottom input: auto-growing textarea, Enter sends, Shift+Enter new line,
//   attach file chip, chips for Urgency, Quality, Deadline, Model Picker, Send/Stop button
// - Animated thinking sequence, typewriter streaming, comparison card with Accept/Override
// - Accept: confetti, streamed confirmation (+20 Green Points, carbon equivalent, no rupees),
//   immediate updates to shared state
// - Copy, Regenerate, Thumbs up/down, Edit last user message, New Chat, history rename/delete

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Paperclip,
  Square,
  ArrowDown,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
  Search,
  X,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { submitTask, acceptTask } from '../api/mockApi';
import AgentThinkingSequence from '../components/AgentThinkingSequence';
import CarbonComparisonCard from '../components/CarbonComparisonCard';
import TypewriterText from '../components/TypewriterText';
import ModelPicker from '../components/ModelPicker';

// NOTE: Replacing src/assets/priya-avatar.svg with a real photo of the same name updates it everywhere across the app.
import priyaAvatar from '../assets/priya-avatar.svg';

export default function SubmitTaskPage() {
  const {
    chats,
    setChats,
    theme,
    setTheme,
    selectedModelId,
    setSelectedModelId,
    addPointsAndCarbon,
    setTasks,
  } = useApp();

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Chat history panel
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editChatTitle, setEditChatTitle] = useState('');

  // Active chat state
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Form input states
  const [inputText, setInputText] = useState('');
  const [urgency, setUrgency] = useState('Flexible'); // Flexible | Urgent
  const [quality, setQuality] = useState('Standard'); // Standard | High
  const [deadline, setDeadline] = useState('Flexible'); // Flexible | End of Day | Within 1 Hour
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  // Message reaction states: { [msgId]: 'liked' | 'disliked' }
  const [reactions, setReactions] = useState({});
  const [copiedMap, setCopiedMap] = useState({});

  // Floating scroll-to-bottom
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Scroll handler
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Start fresh chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputText('');
    setAttachedFile(null);
    setIsProcessing(false);
    abortControllerRef.current = false;
  };

  // Select existing chat from history
  const handleSelectChat = (chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages || []);
    if (chat.modelId) {
      setSelectedModelId(chat.modelId);
    }
    setIsProcessing(false);
    setShowHistory(false);
  };

  // Rename chat
  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditChatTitle(chat.title);
  };

  const handleSaveRename = (chatId) => {
    if (!editChatTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: editChatTitle.trim() } : c))
    );
    setEditingChatId(null);
  };

  // Delete chat
  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  // Send message
  const handleSendMessage = async (textOverride = null) => {
    const promptToSend = (textOverride !== null ? textOverride : inputText).trim();
    if (!promptToSend || isProcessing) return;

    abortControllerRef.current = false;

    const userMsgId = `msg-u-${Date.now()}`;
    const assistantMsgId = `msg-a-${Date.now() + 1}`;

    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: promptToSend,
      urgency,
      quality,
      deadline,
      modelId: selectedModelId,
      attachedFile: attachedFile ? attachedFile.name : null,
    };

    const assistantPlaceholder = {
      id: assistantMsgId,
      sender: 'assistant',
      isThinking: true,
      comparisonData: null,
      introText: null,
      modelLabel: selectedModelId === 'auto' ? 'CarbonShield Auto' : selectedModelId,
      promptText: promptToSend,
    };

    const updatedMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(updatedMessages);
    setInputText('');
    setAttachedFile(null);
    setIsProcessing(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Save chat to history list
    let chatId = currentChatId;
    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      setCurrentChatId(chatId);
      const newChatRecord = {
        id: chatId,
        title: promptToSend.slice(0, 38) + (promptToSend.length > 38 ? '...' : ''),
        date: 'Today',
        modelId: selectedModelId,
        messages: updatedMessages,
      };
      setChats((prev) => [newChatRecord, ...prev]);
    }

    try {
      // POST /api/tasks
      const analysisResult = await submitTask({
        prompt: promptToSend,
        modelId: selectedModelId,
        urgency,
        quality,
        deadline,
      });

      if (abortControllerRef.current) return;

      setMessages((prev) => {
        const nextList = prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                comparisonData: analysisResult,
                modelLabel: analysisResult.suggested?.model || 'Claude Haiku',
              }
            : msg
        );
        setChats((all) =>
          all.map((c) => (c.id === chatId ? { ...c, messages: nextList } : c))
        );
        return nextList;
      });
    } catch (err) {
      if (abortControllerRef.current) return;
      console.error('Task submission failed', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                isThinking: false,
                introText: 'Failed to optimize task. Please check server connectivity.',
              }
            : msg
        )
      );
      setIsProcessing(false);
    }
  };

  // Stop button handler (cancels agent thinking or streaming)
  const handleStop = () => {
    abortControllerRef.current = true;
    setIsProcessing(false);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isThinking
          ? {
              ...msg,
              isThinking: false,
              introText: 'Task optimization stopped by user.',
            }
          : msg
      )
    );
  };

  // Thinking sequence completed
  const handleThinkingDone = (msgId) => {
    if (abortControllerRef.current) return;
    setMessages((prev) => {
      const nextList = prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              isThinking: false,
              introText:
                'I analyzed your workload against the India - South electrical grid dispatch curve. Here is the CarbonShield recommended schedule and model setup:',
            }
          : msg
      );
      if (currentChatId) {
        setChats((all) =>
          all.map((c) => (c.id === currentChatId ? { ...c, messages: nextList } : c))
        );
      }
      return nextList;
    });
    setIsProcessing(false);
  };

  // Regenerate assistant response
  const handleRegenerate = async (msgId) => {
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg || isProcessing) return;

    abortControllerRef.current = false;
    setIsProcessing(true);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              isThinking: true,
              introText: null,
              comparisonData: null,
              isAccepted: false,
              isOverridden: false,
              confirmationStream: null,
            }
          : m
      )
    );

    try {
      const analysisResult = await submitTask({
        prompt: targetMsg.promptText || 'Optimized AI Task',
        modelId: selectedModelId,
        urgency,
        quality,
        deadline,
      });

      if (abortControllerRef.current) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                comparisonData: analysisResult,
                modelLabel: analysisResult.suggested?.model || 'Claude Haiku',
              }
            : m
        )
      );
    } catch {
      setIsProcessing(false);
    }
  };

  // Copy assistant response
  const handleCopy = (msg) => {
    const textToCopy = `CarbonShield Recommendation:
Typical: ${msg.comparisonData?.typical?.model || 'Large model'} (${msg.comparisonData?.typical?.carbon || 30} gCO2e)
Suggested: ${msg.comparisonData?.suggested?.model || 'Claude Haiku'} (${msg.comparisonData?.suggested?.carbon || 12} gCO2e)
Schedule: ${msg.comparisonData?.suggested?.schedule || '2:00 PM'}
Savings: ${msg.comparisonData?.savings?.gCO2e || 18} gCO2e (${msg.comparisonData?.savings?.text || ''})`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedMap((prev) => ({ ...prev, [msg.id]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [msg.id]: false }));
    }, 2000);
  };

  // Thumbs up / down
  const handleReaction = (msgId, type) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type,
    }));
  };

  // Edit user message (resends after editing)
  const handleEditUserMessage = (userMsg) => {
    setInputText(userMsg.text);
    if (userMsg.urgency) setUrgency(userMsg.urgency);
    if (userMsg.quality) setQuality(userMsg.quality);
    if (userMsg.deadline) setDeadline(userMsg.deadline);
    if (userMsg.modelId) setSelectedModelId(userMsg.modelId);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Accept recommendation: fire confetti, award points & carbon, stream confirmation
  const handleAcceptSuggestion = async (msgId, comparisonData) => {
    try {
      // POST /api/tasks/{id}/accept
      const res = await acceptTask(comparisonData.taskId, comparisonData);

      // Add to shared state immediately (triggers animations everywhere)
      addPointsAndCarbon(res.pointsAwarded, res.gCO2eSaved);
      setTasks((prev) => [res.task, ...prev]);

      const equivCharges = Math.round(res.gCO2eSaved / 8);
      const confirmationText = `Task scheduled successfully with ${res.task.modelUsed}. You earned +20 Green Points (≈ ${equivCharges} phone charges)!`;

      setMessages((prev) => {
        const nextList = prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                isAccepted: true,
                confirmationStream: confirmationText,
                note: res.note,
              }
            : msg
        );
        if (currentChatId) {
          setChats((all) =>
            all.map((c) => (c.id === currentChatId ? { ...c, messages: nextList } : c))
          );
        }
        return nextList;
      });
    } catch (err) {
      console.error('Failed to accept recommendation', err);
    }
  };

  // Override recommendation
  const handleOverrideSuggestion = (msgId) => {
    setMessages((prev) => {
      const nextList = prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              isOverridden: true,
              confirmationStream:
                'Task dispatched immediately on the standard cluster. No Green Points awarded.',
            }
          : msg
      );
      if (currentChatId) {
        setChats((all) =>
          all.map((c) => (c.id === currentChatId ? { ...c, messages: nextList } : c))
        );
      }
      return nextList;
    });
  };

  // Handle mock file attachment
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredHistory = chats.filter((c) =>
    c.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  const hasMessages = messages.length > 0;
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');

  return (
    <div
      style={{
        '--chat-bg': isDark ? '#0B1220' : '#F4F7FB',
        '--chat-text': isDark ? '#FFFFFF' : '#0B1220',
        '--chat-welcome': isDark ? '#FFFFFF' : '#0B1220',
      }}
      className={`h-full flex overflow-hidden font-['Inter'] transition-colors duration-200 ${
        isDark ? 'bg-[#0B1220] text-slate-100' : 'bg-[#F4F7FB] text-[#0B1220]'
      }`}
    >
      {/* Left Collapsible History Panel */}
      {showHistory && (
        <aside
          className={`w-64 shrink-0 flex flex-col justify-between border-r transition-colors duration-200 z-20 ${
            isDark ? 'bg-[#080d17] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col h-full p-3">
            {/* Top: New Chat button & Close panel */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <button
                type="button"
                onClick={handleNewChat}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#123C2D] text-white hover:bg-[#1a4a39] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#10B981]" />
                <span>New Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-[#64748B] hover:text-[#0B1220] hover:bg-slate-100'
                }`}
                title="Collapse history"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search box for history */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs mb-3 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-[#F4F7FB] border-slate-200 text-[#0B1220]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search past chats..."
                className="w-full bg-transparent focus:outline-none placeholder:text-[#64748B] text-xs"
              />
            </div>

            {/* List of past chats */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredHistory.map((chat) => {
                const isActive = chat.id === currentChatId;
                const isEditing = editingChatId === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'bg-[#E8EEFF] text-[#123C2D] font-semibold'
                        : isDark
                        ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        : 'text-[#64748B] hover:bg-slate-100 hover:text-[#0B1220]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editChatTitle}
                          onChange={(e) => setEditChatTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(chat.id);
                            if (e.key === 'Escape') setEditingChatId(null);
                          }}
                          onBlur={() => handleSaveRename(chat.id)}
                          autoFocus
                          className={`w-full px-1.5 py-0.5 rounded border text-xs font-normal ${
                            isDark ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-black border-slate-300'
                          }`}
                        />
                      ) : (
                        <>
                          <span className="block truncate">{chat.title}</span>
                          <span className="block text-[10px] text-[#64748B] font-mono mt-0.5">
                            {chat.date}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Rename and Delete action icons on hover */}
                    {!isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, chat)}
                          className="p-1 hover:text-[#10B981]"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="p-1 hover:text-[#DC2626]"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      )}

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
        {/* Chat Header with History Toggle & Sun/Moon Theme Toggle */}
        <div
          className={`h-11 px-4 flex items-center justify-between border-b shrink-0 z-10 transition-colors ${
            isDark ? 'border-slate-800 bg-[#0B1220]/80' : 'border-slate-200 bg-white/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {!showHistory && (
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-[#64748B] hover:text-[#0B1220] hover:bg-slate-100'
                }`}
                title="Open history"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleNewChat}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                  : 'bg-[#E8EEFF] hover:bg-[#dbe4fd] text-[#123C2D]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#10B981]" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Right: Sun / Moon theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 text-amber-300 hover:bg-slate-800'
                : 'border-slate-300 text-[#0B1220] hover:bg-slate-100'
            }`}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#0B1220]" />}
          </button>
        </div>

        {/* Messages or Empty State Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          {!hasMessages ? (
            /* EMPTY STATE: Middle shows ONLY "Welcome back, Priya" */
            <div className="h-full flex items-center justify-center">
              <h2
                style={{ color: 'var(--chat-welcome)' }}
                className="text-2xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight"
              >
                Welcome back, Priya
              </h2>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {msg.sender === 'user' ? (
                    /* User Message Bubble with Priya avatar */
                    <div className="flex justify-end items-start gap-2.5 group">
                      {/* Edit Button on User's Message */}
                      {msg.id === lastUserMsg?.id && !isProcessing && (
                        <button
                          type="button"
                          onClick={() => handleEditUserMessage(msg)}
                          className="opacity-0 group-hover:opacity-100 mt-2 p-1 text-[#64748B] hover:text-[#10B981] transition-opacity cursor-pointer"
                          title="Edit message"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="max-w-xl rounded-2xl rounded-tr-sm bg-[#123C2D] text-white p-4 shadow-sm text-xs leading-relaxed">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.attachedFile && (
                          <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-white text-[11px] w-fit">
                            <Paperclip className="w-3 h-3 text-[#10B981]" />
                            <span className="truncate max-w-xs">{msg.attachedFile}</span>
                          </div>
                        )}
                      </div>

                      <img
                        src={priyaAvatar}
                        alt="Priya Sharma"
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#10B981]/40 shrink-0 mt-0.5"
                      />
                    </div>
                  ) : (
                    /* Assistant Reply */
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#123C2D] flex items-center justify-center text-[#10B981] shrink-0 mt-0.5 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Small model label above reply */}
                        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-[#10B981]">
                          <Cpu className="w-3 h-3" />
                          <span>{msg.modelLabel || 'CarbonShield AI'}</span>
                        </div>

                        {/* Animated Thinking Sequence */}
                        {msg.isThinking && (
                          <AgentThinkingSequence
                            theme={theme}
                            onComplete={() => handleThinkingDone(msg.id)}
                          />
                        )}

                        {/* Streamed Typewriter Intro Text */}
                        {!msg.isThinking && msg.introText && (
                          <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#0B1220]'}`}>
                            <TypewriterText text={msg.introText} speed={12} />
                          </div>
                        )}

                        {/* Comparison Card */}
                        {!msg.isThinking && msg.comparisonData && (
                          <CarbonComparisonCard
                            comparisonData={msg.comparisonData}
                            theme={theme}
                            onAccept={(data) => handleAcceptSuggestion(msg.id, data)}
                            onOverride={() => handleOverrideSuggestion(msg.id)}
                          />
                        )}

                        {/* Streamed Confirmation when accepted or overridden */}
                        {msg.confirmationStream && (
                          <div
                            className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
                              msg.isAccepted
                                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] font-semibold'
                                : 'bg-slate-500/10 border-slate-500/20 text-[#64748B]'
                            }`}
                          >
                            <TypewriterText text={msg.confirmationStream} speed={12} />
                            {msg.note && (
                              <p className="mt-1 text-[11px] font-normal opacity-85">
                                {msg.note}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons: Copy, Regenerate, Thumbs up/down */}
                        {!msg.isThinking && (msg.introText || msg.comparisonData) && (
                          <div className={`flex items-center gap-1.5 mt-3 pt-2 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                            <button
                              type="button"
                              onClick={() => handleCopy(msg)}
                              className={`p-1.5 rounded-md hover:bg-slate-500/15 transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                                copiedMap[msg.id] ? 'text-[#10B981]' : ''
                              }`}
                              title="Copy response"
                            >
                              {copiedMap[msg.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                                  <span className="text-[#10B981] font-semibold">Copied</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRegenerate(msg.id)}
                              disabled={isProcessing}
                              className="p-1.5 rounded-md hover:bg-slate-500/15 transition-colors flex items-center gap-1 text-[11px] disabled:opacity-40 cursor-pointer"
                              title="Regenerate recommendation"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Regenerate</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReaction(msg.id, 'liked')}
                              className={`p-1.5 rounded-md hover:bg-slate-500/15 transition-colors cursor-pointer ${
                                reactions[msg.id] === 'liked' ? 'text-[#10B981]' : ''
                              }`}
                              title="Helpful recommendation"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReaction(msg.id, 'disliked')}
                              className={`p-1.5 rounded-md hover:bg-slate-500/15 transition-colors cursor-pointer ${
                                reactions[msg.id] === 'disliked' ? 'text-[#DC2626]' : ''
                              }`}
                              title="Unhelpful recommendation"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom Floating Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-28 right-8 z-30 p-2 rounded-full bg-[#123C2D] text-white shadow-lg border border-[#10B981]/40 hover:scale-105 transition-all cursor-pointer"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Fixed Bottom Input Area */}
        <div
          className={`w-full pt-2 pb-3 px-4 sticky bottom-0 z-20 transition-colors ${
            isDark
              ? 'bg-gradient-to-t from-[#0B1220] via-[#0B1220]/95 to-transparent'
              : 'bg-gradient-to-t from-[#F4F7FB] via-[#F4F7FB]/95 to-transparent'
          }`}
        >
          <div className="max-w-3xl mx-auto w-full">
            {/* Attached file chip */}
            {attachedFile && (
              <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8EEFF] text-[#123C2D] text-xs font-semibold w-fit">
                <Paperclip className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="truncate max-w-xs">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="hover:text-[#DC2626] ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Chips for Urgency, Quality, Deadline + Model Picker */}
            <div className="flex items-center gap-2 mb-2 px-1 text-xs flex-wrap">
              {/* Urgency */}
              <div
                className={`flex items-center rounded-lg p-0.5 border ${
                  isDark ? 'border-slate-700 bg-slate-900/90' : 'border-slate-300 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setUrgency('Flexible')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    urgency === 'Flexible'
                      ? 'bg-[#10B981] text-[#0B1220] shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#64748B] hover:text-[#0B1220]'
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
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#64748B] hover:text-[#0B1220]'
                  }`}
                >
                  <Flame className="h-3 w-3" />
                  <span>Urgent (Run now)</span>
                </button>
              </div>

              {/* Quality */}
              <div
                className={`flex items-center rounded-lg p-0.5 border ${
                  isDark ? 'border-slate-700 bg-slate-900/90' : 'border-slate-300 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuality('Standard')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    quality === 'Standard'
                      ? isDark
                        ? 'bg-slate-700 text-white'
                        : 'bg-[#123C2D] text-white'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#64748B] hover:text-[#0B1220]'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setQuality('High')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    quality === 'High'
                      ? isDark
                        ? 'bg-slate-700 text-white'
                        : 'bg-[#123C2D] text-white'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#64748B] hover:text-[#0B1220]'
                  }`}
                >
                  High
                </button>
              </div>

              {/* Deadline */}
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] border ${
                  isDark ? 'border-slate-700 bg-slate-900/90 text-slate-200' : 'border-slate-300 bg-white text-[#0B1220]'
                }`}
              >
                <Clock className="h-3 w-3 text-[#10B981] shrink-0" />
                <span className={isDark ? 'text-slate-300 font-medium' : 'text-[#64748B] font-medium'}>
                  Deadline:
                </span>
                <select
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-transparent font-semibold text-[#10B981] outline-none cursor-pointer text-[11px]"
                >
                  <option value="Flexible" className={isDark ? 'bg-[#0B1220] text-slate-200' : 'bg-white text-[#0B1220]'}>
                    Flexible
                  </option>
                  <option value="End of Day" className={isDark ? 'bg-[#0B1220] text-slate-200' : 'bg-white text-[#0B1220]'}>
                    End of Day
                  </option>
                  <option value="Within 1 Hour" className={isDark ? 'bg-[#0B1220] text-slate-200' : 'bg-white text-[#0B1220]'}>
                    Within 1 Hour
                  </option>
                </select>
              </div>

              {/* Model Picker Pill */}
              <ModelPicker
                selectedModelId={selectedModelId}
                onSelectModel={(id) => setSelectedModelId(id)}
                isDark={isDark}
              />
            </div>

            {/* Main Auto-growing Textarea Input Box */}
            <div
              className={`relative flex flex-col rounded-2xl p-2 shadow-xl transition-all border ${
                isDark
                  ? 'border-slate-700 bg-[#0F172A] focus-within:border-[#10B981]'
                  : 'border-slate-300 bg-white focus-within:border-[#10B981]'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask CarbonShield Companion to run an AI task..."
                className={`w-full resize-none bg-transparent px-3 py-2 text-sm outline-none min-h-[44px] max-h-[160px] ${
                  isDark
                    ? 'text-white placeholder:text-slate-400'
                    : 'text-[#0B1220] placeholder:text-slate-400'
                }`}
              />

              {/* Bottom bar of input: attach file, shift+enter note, send/stop button */}
              <div
                className={`flex items-center justify-between pt-1 px-2 border-t mt-1 ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'text-slate-300 hover:text-[#10B981] hover:bg-slate-800' : 'text-[#64748B] hover:text-[#10B981] hover:bg-slate-100'
                    }`}
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    Shift + Enter for new line
                  </span>
                </div>

                {/* Send button turns into Stop button while thinking or streaming */}
                {isProcessing ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    aria-label="Stop generating"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DC2626] text-white hover:bg-red-700 transition-all cursor-pointer shadow-sm text-xs font-semibold"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    aria-label="Send task"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981] text-[#0B1220] hover:bg-[#0ea372] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Tiny gray line under input */}
            <div className={`mt-2 text-center text-[11px] ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              CarbonShield estimates are simulated and may differ from real measurements.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
