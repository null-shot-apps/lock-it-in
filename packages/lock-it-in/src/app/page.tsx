'use client';

import { useEffect, useState } from 'react';

type Goal = {
  id: string;
  name: string;
  color: string;
  pomodoros: number;
  totalMinutes: number;
  weeklyPomodoros?: number;
  monthlyPomodoros?: number;
};

type UnlinkedStats = {
  pomodoros: number;
  totalMinutes: number;
};

type Reflection = {
  id: string;
  goalId: string;
  date: string;
  workDescription: string;
  feeling: string;
  duration: number;
};

type TimerPreset = {
  name: string;
  work: number;
  break: number;
  description: string;
};

type Theme = {
  name: string;
  gradient: string;
  card: string;
  cardBorder: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  text: string;
  textSecondary: string;
  accent: string;
};

const themes: Record<string, Theme> = {
  zen: {
    name: 'Zen Neutrals',
    gradient: 'from-stone-100 via-amber-50 to-stone-100',
    card: 'bg-white/80',
    cardBorder: 'border-stone-200',
    primary: 'bg-stone-700 hover:bg-stone-800',
    primaryHover: 'hover:bg-stone-100',
    secondary: 'bg-stone-200 hover:bg-stone-300',
    text: 'text-stone-900',
    textSecondary: 'text-stone-600',
    accent: 'bg-amber-100',
  },
  forest: {
    name: 'Forest Calm',
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    card: 'bg-white/80',
    cardBorder: 'border-emerald-200',
    primary: 'bg-emerald-700 hover:bg-emerald-800',
    primaryHover: 'hover:bg-emerald-100',
    secondary: 'bg-emerald-200 hover:bg-emerald-300',
    text: 'text-emerald-950',
    textSecondary: 'text-emerald-700',
    accent: 'bg-green-100',
  },
  sunrise: {
    name: 'Sunrise Focus',
    gradient: 'from-orange-50 via-pink-50 to-rose-50',
    card: 'bg-white/80',
    cardBorder: 'border-orange-200',
    primary: 'bg-orange-600 hover:bg-orange-700',
    primaryHover: 'hover:bg-orange-100',
    secondary: 'bg-orange-200 hover:bg-orange-300',
    text: 'text-orange-950',
    textSecondary: 'text-orange-700',
    accent: 'bg-pink-100',
  },
  midnight: {
    name: 'Midnight Flow',
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    card: 'bg-white/10',
    cardBorder: 'border-white/20',
    primary: 'bg-purple-600 hover:bg-purple-700',
    primaryHover: 'hover:bg-white/20',
    secondary: 'bg-slate-600 hover:bg-slate-700',
    text: 'text-white',
    textSecondary: 'text-purple-200',
    accent: 'bg-purple-900/30',
  },
};

const presets: TimerPreset[] = [
  { name: 'Short Focus', work: 25, break: 5, description: 'Classic Pomodoro' },
  { name: 'Medium Focus', work: 45, break: 10, description: 'Extended session' },
  { name: 'Deep Focus', work: 90, break: 20, description: 'Flow state' },
];

const goalColors = [
  '#7849EF', // Purple
  '#326CD8', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
];

export default function PomodoroApp() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [unlinkedStats, setUnlinkedStats] = useState<UnlinkedStats>({ pomodoros: 0, totalMinutes: 0 });
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [isCustom, setIsCustom] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [selectedColor, setSelectedColor] = useState(goalColors[0]);
  
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('midnight');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Reflection state
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionWork, setReflectionWork] = useState('');
  const [reflectionFeeling, setReflectionFeeling] = useState('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [completedSessionMinutes, setCompletedSessionMinutes] = useState(0);
  const [showWeeklyView, setShowWeeklyView] = useState(false);

  const theme = themes[currentTheme];

  // Load goals, reflections, unlinked stats, and theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro-goals');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
    const savedReflections = localStorage.getItem('pomodoro-reflections');
    if (savedReflections) {
      setReflections(JSON.parse(savedReflections));
    }
    const savedUnlinked = localStorage.getItem('pomodoro-unlinked');
    if (savedUnlinked) {
      setUnlinkedStats(JSON.parse(savedUnlinked));
    }
    const savedTheme = localStorage.getItem('pomodoro-theme');
    if (savedTheme && savedTheme in themes) {
      setCurrentTheme(savedTheme as keyof typeof themes);
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('pomodoro-goals', JSON.stringify(goals));
    }
  }, [goals]);

  // Save reflections to localStorage
  useEffect(() => {
    if (reflections.length > 0) {
      localStorage.setItem('pomodoro-reflections', JSON.stringify(reflections));
    }
  }, [reflections]);

  // Save unlinked stats to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-unlinked', JSON.stringify(unlinkedStats));
  }, [unlinkedStats]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-theme', currentTheme);
  }, [currentTheme]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            const workMinutes = isCustom ? customWork : presets[selectedPreset].work;
            
            if (selectedGoal) {
              // Update goal stats
              setGoals((prev) =>
                prev.map((g) =>
                  g.id === selectedGoal
                    ? { ...g, pomodoros: g.pomodoros + 1, totalMinutes: g.totalMinutes + workMinutes }
                    : g
                )
              );
              // Show reflection prompt
              setCompletedSessionMinutes(workMinutes);
              setShowReflection(true);
            } else {
              // Update unlinked stats
              setUnlinkedStats(prev => ({
                pomodoros: prev.pomodoros + 1,
                totalMinutes: prev.totalMinutes + workMinutes
              }));
            }
          }
          // Auto-start break
          if (!isBreak) {
            const breakTime = isCustom ? customBreak : presets[selectedPreset].break;
            setTimeLeft(breakTime * 60);
            setIsBreak(true);
            setIsRunning(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, selectedGoal, selectedPreset, isCustom, customWork, customBreak]);

  const addGoal = () => {
    if (!newGoalName.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newGoalName.trim(),
      color: selectedColor,
      pomodoros: 0,
      totalMinutes: 0,
    };
    setGoals([...goals, newGoal]);
    setNewGoalName('');
    setShowGoalForm(false);
    setSelectedColor(goalColors[0]);
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      const minutes = isCustom ? customWork : presets[selectedPreset].work;
      setTimeLeft(minutes * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveReflection = () => {
    if (!selectedGoal) {
      setShowReflection(false);
      return;
    }
    
    const newReflection: Reflection = {
      id: Date.now().toString(),
      goalId: selectedGoal,
      date: new Date().toISOString(),
      workDescription: reflectionWork,
      feeling: reflectionFeeling,
      duration: completedSessionMinutes,
    };
    
    setReflections([...reflections, newReflection]);
    setReflectionWork('');
    setReflectionFeeling('');
    setShowReflection(false);
  };

  const skipReflection = () => {
    setReflectionWork('');
    setReflectionFeeling('');
    setShowReflection(false);
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return goals.map(goal => {
      const weeklyReflections = reflections.filter(
        r => r.goalId === goal.id && new Date(r.date) >= oneWeekAgo
      );
      return {
        ...goal,
        weeklyPomodoros: weeklyReflections.length,
        weeklyMinutes: weeklyReflections.reduce((sum, r) => sum + r.duration, 0),
      };
    });
  };

  const getMonthlyStats = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return goals.map(goal => {
      const monthlyReflections = reflections.filter(
        r => r.goalId === goal.id && new Date(r.date) >= oneMonthAgo
      );
      return {
        ...goal,
        monthlyPomodoros: monthlyReflections.length,
        monthlyMinutes: monthlyReflections.reduce((sum, r) => sum + r.duration, 0),
      };
    });
  };

  const currentGoal = goals.find((g) => g.id === selectedGoal);
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className={`relative min-h-[100dvh] w-full overflow-auto bg-gradient-to-br ${theme.gradient} transition-all duration-700`}>
      {/* Subtle animated background for midnight theme */}
      {currentTheme === 'midnight' && <div className="absolute inset-0 bg-aurora-layer-1 opacity-30" />}
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.text} mb-2`}>Lock It In</h1>
          <p className={theme.textSecondary}>Focus on what matters. Track your progress.</p>
        </header>

        {/* Theme Selector & Stats Toggle */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`px-6 py-3 ${theme.card} backdrop-blur-lg rounded-full border ${theme.cardBorder} ${theme.text} font-medium transition-all ${theme.primaryHover} flex items-center gap-2`}
            >
              <span>🎨</span>
              <span>{theme.name}</span>
              <span className="text-xs">{showThemeSelector ? '▲' : '▼'}</span>
            </button>
            
            {showThemeSelector && (
              <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 ${theme.card} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} p-4 shadow-2xl min-w-[280px] z-50`}>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(themes).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentTheme(key as keyof typeof themes);
                        setShowThemeSelector(false);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        currentTheme === key
                          ? 'border-current scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${t.gradient} mb-2`} />
                      <div className={`text-sm font-medium ${theme.text}`}>{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowWeeklyView(!showWeeklyView)}
            className={`px-6 py-3 ${theme.card} backdrop-blur-lg rounded-full border ${theme.cardBorder} ${theme.text} font-medium transition-all ${theme.primaryHover}`}
          >
            {showWeeklyView ? '📊 Hide Stats' : '📊 Weekly Summary'}
          </button>
        </div>

        {/* Weekly Summary View */}
        {showWeeklyView && (
          <div className={`${theme.card} backdrop-blur-lg rounded-2xl p-6 border ${theme.cardBorder} mb-8 transition-all duration-500`}>
            <h2 className={`text-2xl font-bold ${theme.text} mb-6 text-center`}>📊 Weekly & Monthly Progress</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const weekly = weeklyStats.find(g => g.id === goal.id);
                const monthly = monthlyStats.find(g => g.id === goal.id);
                const weeklyProgress = (weekly?.weeklyPomodoros || 0) / 20;
                const monthlyProgress = (monthly?.monthlyPomodoros || 0) / 80;
                
                return (
                  <div key={goal.id} className={`${theme.accent} rounded-xl p-5`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      <h3 className={`font-semibold ${theme.text}`}>{goal.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative w-16 h-16">
                        <svg className="transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className={currentTheme === 'midnight' ? 'stroke-white/20' : 'stroke-gray-300'}
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke={goal.color}
                            strokeWidth="3"
                            strokeDasharray={`${Math.min(weeklyProgress, 1) * 100} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${theme.text}`}>
                            {weekly?.weeklyPomodoros || 0}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${theme.text}`}>This Week</div>
                        <div className={`text-xs ${theme.textSecondary}`}>
                          {Math.floor((weekly?.weeklyMinutes || 0) / 60)}h {(weekly?.weeklyMinutes || 0) % 60}m
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className={currentTheme === 'midnight' ? 'stroke-white/20' : 'stroke-gray-300'}
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke={goal.color}
                            strokeWidth="3"
                            strokeDasharray={`${Math.min(monthlyProgress, 1) * 100} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${theme.text}`}>
                            {monthly?.monthlyPomodoros || 0}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${theme.text}`}>This Month</div>
                        <div className={`text-xs ${theme.textSecondary}`}>
                          {Math.floor((monthly?.monthlyMinutes || 0) / 60)}h {(monthly?.monthlyMinutes || 0) % 60}m
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflection Modal */}
        {showReflection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${theme.card} backdrop-blur-lg rounded-2xl p-8 border ${theme.cardBorder} max-w-md w-full`}>
              <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>✨ Session Complete!</h2>
              <p className={`${theme.textSecondary} mb-6`}>
                Great work on your {completedSessionMinutes}-minute session! Take a moment to reflect.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className={`block ${theme.text} font-medium mb-2`}>
                    What did you work on? (optional)
                  </label>
                  <textarea
                    value={reflectionWork}
                    onChange={(e) => setReflectionWork(e.target.value)}
                    placeholder="e.g., Studied React hooks, Worked on project proposal..."
                    className={`w-full px-4 py-3 ${theme.accent} border ${theme.cardBorder} rounded-lg ${theme.text} placeholder-opacity-50 resize-none`}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className={`block ${theme.text} font-medium mb-2`}>
                    How did this session feel? (optional)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {['🔥 Focused', '😊 Good', '😐 Okay', '😓 Struggled', '💪 Productive'].map((feeling) => (
                      <button
                        key={feeling}
                        onClick={() => setReflectionFeeling(feeling)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          reflectionFeeling === feeling
                            ? `${theme.primary.replace('hover:', '')} text-white`
                            : `${theme.accent} ${theme.text} ${theme.primaryHover}`
                        }`}
                      >
                        {feeling}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveReflection}
                  className={`flex-1 px-6 py-3 ${theme.primary} text-white rounded-lg font-semibold transition-all`}
                >
                  Save Reflection
                </button>
                <button
                  onClick={skipReflection}
                  className={`px-6 py-3 ${theme.secondary} text-white rounded-lg font-semibold transition-all`}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Timer */}
          <div className="space-y-6">
            {/* Timer Display */}
            <div className={`${theme.card} backdrop-blur-lg rounded-2xl p-8 border ${theme.cardBorder} transition-all duration-500`}>
              <div className="text-center mb-6">
                <div className={`text-7xl font-bold ${theme.text} mb-2`}>
                  {formatTime(timeLeft)}
                </div>
                <div className={`${theme.textSecondary} text-lg`}>
                  {isBreak ? '☕ Break Time' : currentGoal ? `🎯 ${currentGoal.name}` : '🎯 Focus Session'}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-3 justify-center mb-6">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className={`px-8 py-3 ${theme.primary} text-white rounded-lg font-semibold transition-all`}
                  >
                    {timeLeft === 0 ? 'Start' : 'Resume'}
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className={`px-8 py-3 ${theme.secondary} text-white rounded-lg font-semibold transition-all`}
                >
                  Reset
                </button>
              </div>

              {/* Preset Selection */}
              {!isRunning && !isBreak && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {presets.map((preset, idx) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setSelectedPreset(idx);
                          setIsCustom(false);
                          setTimeLeft(0);
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                          !isCustom && selectedPreset === idx
                            ? `${theme.primary.replace('hover:', '')} text-white`
                            : `${theme.accent} ${theme.text} ${theme.primaryHover}`
                        }`}
                      >
                        <div className="text-sm">{preset.name}</div>
                        <div className="text-xs opacity-75">{preset.work}m + {preset.break}m</div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Timer */}
                  <button
                    onClick={() => setIsCustom(!isCustom)}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      isCustom
                        ? `${theme.primary.replace('hover:', '')} text-white`
                        : `${theme.accent} ${theme.text} ${theme.primaryHover}`
                    }`}
                  >
                    Custom Timer
                  </button>
                  
                  {isCustom && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className={`block ${theme.textSecondary} text-sm mb-1`}>Work (min)</label>
                        <input
                          type="number"
                          value={customWork}
                          onChange={(e) => {
                            setCustomWork(Math.max(1, parseInt(e.target.value) || 1));
                            setTimeLeft(0);
                          }}
                          className={`w-full px-3 py-2 ${theme.accent} border ${theme.cardBorder} rounded-lg ${theme.text}`}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className={`block ${theme.textSecondary} text-sm mb-1`}>Break (min)</label>
                        <input
                          type="number"
                          value={customBreak}
                          onChange={(e) => setCustomBreak(Math.max(1, parseInt(e.target.value) || 1))}
                          className={`w-full px-3 py-2 ${theme.accent} border ${theme.cardBorder} rounded-lg ${theme.text}`}
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Goals */}
          <div className="space-y-6">
            {/* Goals List */}
            <div className={`${theme.card} backdrop-blur-lg rounded-2xl p-6 border ${theme.cardBorder} transition-all duration-500`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${theme.text}`}>Your Goals</h2>
                <button
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  className={`px-4 py-2 ${theme.primary} text-white rounded-lg font-semibold transition-all`}
                >
                  + Add Goal
                </button>
              </div>

              {/* Add Goal Form */}
              {showGoalForm && (
                <div className={`mb-4 p-4 ${theme.accent} rounded-lg space-y-3`}>
                  <input
                    type="text"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="Goal name (e.g., Health, Career)"
                    className={`w-full px-4 py-2 ${theme.accent} border ${theme.cardBorder} rounded-lg ${theme.text} placeholder-opacity-50`}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <div className="flex gap-2">
                    {goalColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          selectedColor === color ? `scale-125 ring-2 ${currentTheme === 'midnight' ? 'ring-white' : 'ring-gray-800'}` : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addGoal}
                      className={`flex-1 px-4 py-2 ${theme.primary} text-white rounded-lg font-semibold transition-all`}
                    >
                      Create Goal
                    </button>
                    <button
                      onClick={() => {
                        setShowGoalForm(false);
                        setNewGoalName('');
                      }}
                      className={`px-4 py-2 ${theme.secondary} text-white rounded-lg font-semibold transition-all`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Unlinked Sessions Stats */}
              {unlinkedStats.pomodoros > 0 && (
                <div className={`mb-4 p-4 ${theme.accent} rounded-lg`}>
                  <div className={`font-semibold ${theme.text} mb-1`}>📊 Unlinked Sessions</div>
                  <div className={`text-sm ${theme.textSecondary}`}>
                    🍅 {unlinkedStats.pomodoros} sessions · ⏱️ {Math.floor(unlinkedStats.totalMinutes / 60)}h {unlinkedStats.totalMinutes % 60}m
                  </div>
                </div>
              )}

              {/* Goals */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {goals.length === 0 ? (
                  <div className={`text-center py-8 ${theme.textSecondary}`}>
                    <p className="mb-2">No goals yet!</p>
                    <p className="text-sm opacity-75">You can start a session without a goal, or create one to track progress.</p>
                  </div>
                ) : (
                  goals.map((goal) => {
                    const weeklyGoal = weeklyStats.find(g => g.id === goal.id);
                    const progress = Math.min((weeklyGoal?.weeklyPomodoros || 0) / 20, 1);
                    
                    return (
                      <button
                        key={goal.id}
                        onClick={() => !isRunning && setSelectedGoal(goal.id)}
                        disabled={isRunning}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          selectedGoal === goal.id
                            ? `${theme.accent} ring-2 ${currentTheme === 'midnight' ? 'ring-white' : 'ring-gray-800'}`
                            : `${theme.accent} opacity-60 ${theme.primaryHover}`
                        } ${isRunning ? 'cursor-not-allowed opacity-30' : ''}`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: goal.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold ${theme.text} mb-1`}>{goal.name}</div>
                            <div className={`text-sm ${theme.textSecondary}`}>
                              🍅 {goal.pomodoros} sessions · ⏱️ {Math.floor(goal.totalMinutes / 60)}h {goal.totalMinutes % 60}m
                            </div>
                          </div>
                        </div>
                        
                        {/* Weekly Progress Bar */}
                        <div className="ml-7">
                          <div className={`h-1.5 rounded-full overflow-hidden ${currentTheme === 'midnight' ? 'bg-white/20' : 'bg-gray-300'}`}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress * 100}%`,
                                backgroundColor: goal.color,
                              }}
                            />
                          </div>
                          <div className={`text-xs ${theme.textSecondary} mt-1`}>
                            {weeklyGoal?.weeklyPomodoros || 0}/20 this week
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






















