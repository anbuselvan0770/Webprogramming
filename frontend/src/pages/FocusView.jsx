import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusView({
  pomodoroData = {},
  subjects = [],
  tasks = [],
  onLogSession
}) {
  const [mode, setMode] = useState('Focus'); // 'Focus', 'Short Break', 'Long Break'
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef(null);

  const getDuration = (m) => {
    if (m === 'Focus') return focusDuration * 60;
    if (m === 'Short Break') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.log('Audio not allowed', e);
    }
  };

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  useEffect(() => {
    setTimeLeft(getDuration(mode));
  }, [focusDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();

            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 }
            });

            // Log session
            const mins = Math.round(getDuration(mode) / 60);
            if (onLogSession) {
              onLogSession({
                duration_minutes: mins,
                session_type: mode,
                subject_id: selectedSubjectId || null,
                task_id: selectedTaskId || null,
                notes: sessionNotes || `Completed ${mins}m ${mode}`
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedSubjectId, selectedTaskId, sessionNotes, focusDuration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotal = getDuration(mode);
  const progressPercent = ((currentTotal - timeLeft) / currentTotal) * 100;

  const recentSessions = pomodoroData.recent_sessions || [];

  return (
    <div className="focus-page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Pomodoro Focus Room</h2>
          <p className="page-subtitle">
            Eliminate distractions with timed deep-work sessions and structured breaks.
          </p>
        </div>

        <button 
          className="btn btn-outline"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Sliders size={16} />
          <span>Timer Settings</span>
        </button>
      </div>

      {showSettings && (
        <div className="card focus-settings-panel">
          <h4>Custom Session Durations (minutes)</h4>
          <div className="settings-durations-row">
            <div className="form-group">
              <label>Focus Time</label>
              <input 
                type="number" 
                min="5" 
                max="90" 
                className="input-field"
                value={focusDuration}
                onChange={(e) => setFocusDuration(parseInt(e.target.value, 10) || 25)}
              />
            </div>
            <div className="form-group">
              <label>Short Break</label>
              <input 
                type="number" 
                min="1" 
                max="30" 
                className="input-field"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(parseInt(e.target.value, 10) || 5)}
              />
            </div>
            <div className="form-group">
              <label>Long Break</label>
              <input 
                type="number" 
                min="5" 
                max="60" 
                className="input-field"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(parseInt(e.target.value, 10) || 15)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Centerpiece */}
      <div className="focus-center-wrapper">
        <div className="card focus-hero-card">
          {/* Mode Switcher */}
          <div className="focus-mode-pills">
            <button 
              className={`focus-pill ${mode === 'Focus' ? 'active' : ''}`}
              onClick={() => handleModeChange('Focus')}
            >
              Focus ({focusDuration}m)
            </button>
            <button 
              className={`focus-pill ${mode === 'Short Break' ? 'active' : ''}`}
              onClick={() => handleModeChange('Short Break')}
            >
              Short Break ({shortBreakDuration}m)
            </button>
            <button 
              className={`focus-pill ${mode === 'Long Break' ? 'active' : ''}`}
              onClick={() => handleModeChange('Long Break')}
            >
              Long Break ({longBreakDuration}m)
            </button>
          </div>

          {/* Large Countdown */}
          <div className="focus-timer-large">
            <span className="big-digits">{formattedTime}</span>
            <span className="big-status-label">
              {isRunning ? 'Session in progress...' : 'Ready to start'}
            </span>
          </div>

          {/* Controls */}
          <div className="focus-actions-row">
            <button 
              className={`btn btn-primary btn-large ${isRunning ? 'running' : ''}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              <span>{isRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>

            <button 
              className="btn btn-outline"
              onClick={() => { setIsRunning(false); setTimeLeft(getDuration(mode)); }}
              title="Reset"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>

          {/* Target Subject & Task Linking */}
          <div className="focus-context-bar">
            <div className="context-item">
              <label>Subject</label>
              <select 
                value={selectedSubjectId} 
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="context-select"
              >
                <option value="">General Focus</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="context-item">
              <label>Associated Task</label>
              <select 
                value={selectedTaskId} 
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="context-select"
              >
                <option value="">None (Free study)</option>
                {tasks.filter(t => t.status !== 'Completed').map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="context-item flex-grow">
              <label>Notes / Goal for this session</label>
              <input 
                type="text" 
                placeholder="e.g. Solve 5 problems on Dijkstra algorithm..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="context-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Stats & History Log */}
      <div className="focus-bottom-grid">
        {/* Today's Stats Cards */}
        <div className="card focus-stats-mini-card">
          <h4>Today's Accomplishment</h4>
          <div className="mini-stat-items">
            <div className="mini-stat">
              <span className="mini-stat-label">Focus Sessions</span>
              <strong className="mini-stat-val">{pomodoroData.today_sessions || 0}</strong>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">Total Focus Time</span>
              <strong className="mini-stat-val">{pomodoroData.today_minutes || 0} min</strong>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">Study Streak</span>
              <strong className="mini-stat-val">{pomodoroData.streak_days || 1} Days 🔥</strong>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card focus-history-card">
          <h4>Recent Focus Logs</h4>
          <div className="focus-history-list">
            {recentSessions.length === 0 ? (
              <p className="empty-history">No sessions logged today yet. Start your first session above!</p>
            ) : (
              recentSessions.slice(0, 5).map((item, idx) => (
                <div key={item.id || idx} className="focus-history-row">
                  <div className="history-left">
                    <span className="history-type-chip">{item.session_type}</span>
                    <div className="history-text">
                      <strong>{item.subject_name || 'General Study'}</strong>
                      {item.notes && <p>{item.notes}</p>}
                    </div>
                  </div>
                  <div className="history-right">
                    <span className="history-duration">{item.duration_minutes} min</span>
                    <span className="history-date">
                      {item.completed_at ? new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
