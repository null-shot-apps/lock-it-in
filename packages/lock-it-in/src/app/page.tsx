'use client';

import { useEffect, useState } from 'react';

type Goal = {
  id: string;
  name: string;
  color: string;
  pomodoros: number;
  totalMinutes: number;
};

type TimerPreset = {
  name: string;
  work: number;
  break: number;
  description: string;
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

  // Load goals from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro-goals');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('pomodoro-goals', JSON.stringify(goals));
    }
  }, [goals]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak && selectedGoal) {
            // Update goal stats
            const workMinutes = isCustom ? customWork : presets[selectedPreset].work;
            setGoals((prev) =>
              prev.map((g) =>
                g.id === selectedGoal
                  ? { ...g, pomodoros: g.pomodoros + 1, totalMinutes: g.totalMinutes + workMinutes }
                  : g
              )
            );
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
    if (!selectedGoal && !isBreak) return;
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

  const currentGoal = goals.find((g) => g.id === selectedGoal);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-aurora-layer-1 opacity-30" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Lock It In</h1>
          <p className="text-purple-200">Focus on what matters. Track your progress.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Timer */}
          <div className="space-y-6">
            {/* Timer Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-7xl font-bold text-white mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-purple-200 text-lg">
                  {isBreak ? '☕ Break Time' : currentGoal ? `🎯 ${currentGoal.name}` : 'Select a goal to start'}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-3 justify-center mb-6">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    disabled={!selectedGoal && !isBreak}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    {timeLeft === 0 ? 'Start' : 'Resume'}
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
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
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                          !isCustom && selectedPreset === idx
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
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
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      isCustom
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                    }`}
                  >
                    Custom Timer
                  </button>
                  
                  {isCustom && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-purple-200 text-sm mb-1">Work (min)</label>
                        <input
                          type="number"
                          value={customWork}
                          onChange={(e) => {
                            setCustomWork(Math.max(1, parseInt(e.target.value) || 1));
                            setTimeLeft(0);
                          }}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 text-sm mb-1">Break (min)</label>
                        <input
                          type="number"
                          value={customBreak}
                          onChange={(e) => setCustomBreak(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
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
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Your Goals</h2>
                <button
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  + Add Goal
                </button>
              </div>

              {/* Add Goal Form */}
              {showGoalForm && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg space-y-3">
                  <input
                    type="text"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="Goal name (e.g., Health, Career)"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <div className="flex gap-2">
                    {goalColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          selectedColor === color ? 'scale-125 ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addGoal}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Create Goal
                    </button>
                    <button
                      onClick={() => {
                        setShowGoalForm(false);
                        setNewGoalName('');
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Goals */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {goals.length === 0 ? (
                  <div className="text-center py-8 text-purple-200">
                    <p className="mb-2">No goals yet!</p>
                    <p className="text-sm opacity-75">Create your first New Year goal to get started.</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => !isRunning && setSelectedGoal(goal.id)}
                      disabled={isRunning}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedGoal === goal.id
                          ? 'bg-white/20 ring-2 ring-white'
                          : 'bg-white/5 hover:bg-white/10'
                      } ${isRunning ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: goal.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white mb-1">{goal.name}</div>
                          <div className="text-sm text-purple-200">
                            🍅 {goal.pomodoros} sessions · ⏱️ {Math.floor(goal.totalMinutes / 60)}h {goal.totalMinutes % 60}m
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

