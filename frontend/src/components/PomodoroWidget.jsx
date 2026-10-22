import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroWidget({ onSessionComplete, subjects = [] }) {
  const [mode, setMode] = useState('Focus'); // 'Focus', 'Short Break', 'Long Break'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionCount, setSessionCount] = useState(0);

  const timerRef = useRef(null);

  const durations = {
    'Focus': 25 * 60,
    'Short Break': 5 * 60,
    'Long Break': 15 * 60
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio chime error', e);
    }
  };

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();

            const completedMinutes = Math.round(durations[mode] / 60);
            if (mode === 'Focus') {
              setSessionCount(c => c + 1);
            }
            if (onSessionComplete) {
              onSessionComplete({
                duration_minutes: completedMinutes,
                session_type: mode,
                subject_id: selectedSubjectId || null,
                notes: `Completed ${mode} session.`
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
  }, [isRunning, mode, selectedSubjectId]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = durations[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="card pomodoro-card">
      <div className="card-header-clean">
        <span className="card-badge-label">TODAY'S FOCUS</span>
        <div className="pomo-mode-selector">
          <button 
            className={`pomo-tab-btn ${mode === 'Focus' ? 'active' : ''}`}
            onClick={() => handleModeChange('Focus')}
          >
            Focus
          </button>
          <button 
            className={`pomo-tab-btn ${mode === 'Short Break' ? 'active' : ''}`}
            onClick={() => handleModeChange('Short Break')}
          >
            Short Break
          </button>
          <button 
            className={`pomo-tab-btn ${mode === 'Long Break' ? 'active' : ''}`}
            onClick={() => handleModeChange('Long Break')}
          >
            Long Break
          </button>
        </div>
      </div>

      <div className="pomodoro-body">
        <div className="timer-ring-container" style={{ width: 160, height: 160, position: 'relative', margin: '8px auto 16px' }}>
          <svg className="timer-ring-svg" viewBox="0 0 100 100" width="160" height="160" style={{ width: 160, height: 160, transform: 'rotate(-90deg)' }}>
            <circle
              className="timer-ring-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#EDF2F7"
              strokeWidth="6"
            />
            <circle
              className="timer-ring-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              stroke={mode === 'Focus' ? '#4A7C59' : '#3B82F6'}
            />
          </svg>
          <div className="timer-display-inner">
            <h2 className="timer-digits">{formattedTime}</h2>
            <span className="timer-label">{mode === 'Focus' ? 'DEEP WORK' : 'BREAK TIME'}</span>
          </div>
        </div>

        <div className="pomo-controls">
          <button 
            className={`btn btn-primary pomo-play-btn ${isRunning ? 'running' : ''}`}
            onClick={toggleTimer}
            id="btn-pomo-toggle"
          >
            {isRunning ? (
              <>
                <Pause size={18} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button 
            className="btn btn-outline pomo-reset-btn"
            onClick={resetTimer}
            title="Reset Session"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="pomo-subject-selector">
          <label htmlFor="pomo-subject-select">Focusing on:</label>
          <select 
            id="pomo-subject-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="pomo-select input-field"
          >
            <option value="">General Study Session</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code || 'Sub'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
