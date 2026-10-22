import React from 'react';
import { CheckCircle2, Clock, Target, Award } from 'lucide-react';

export default function TodayProgressWidget({ progress, focus }) {
  const pct = progress?.completion_percentage || 0;
  const completed = progress?.completed_tasks || 0;
  const pending = progress?.pending_tasks || 0;
  const total = progress?.total_tasks || 0;

  const todayMinutes = focus?.today_minutes || 0;
  const goalMinutes = focus?.daily_goal_minutes || 120;
  const timePct = Math.min(100, Math.round((todayMinutes / (goalMinutes || 1)) * 100));

  // Circular gauge calculations (circumference = 2 * PI * 42 ≈ 264)
  const circumference = 264;
  const strokeDashoffset = circumference - (circumference * pct) / 100;

  return (
    <div className="card today-progress-card">
      <div className="card-header-clean">
        <span className="card-badge-label">TODAY'S PROGRESS</span>
        <span className="badge badge-primary">
          <Award size={12} />
          {pct === 100 && total > 0 ? 'Goal Reached!' : `${completed}/${total} Tasks`}
        </span>
      </div>

      <div className="progress-body">
        {/* Left: SVG Gauge */}
        <div className="progress-gauge-container" style={{ width: 140, height: 140, position: 'relative' }}>
          <svg className="progress-gauge-svg" viewBox="0 0 100 100" width="140" height="140" style={{ width: 140, height: 140, transform: 'rotate(-90deg)' }}>
            <circle
              className="progress-gauge-bg"
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="8"
            />
            <circle
              className="progress-gauge-val"
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#4A7C59"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="progress-gauge-text">
            <span className="gauge-number">{pct}%</span>
            <span className="gauge-label">Completed</span>
          </div>
        </div>

        {/* Right: Metrics Breakdown */}
        <div className="progress-breakdown">
          <div className="metric-row">
            <div className="metric-icon-box completed-box">
              <CheckCircle2 size={16} />
            </div>
            <div className="metric-info">
              <span className="metric-title">Completed Tasks</span>
              <strong className="metric-val">{completed} done</strong>
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-icon-box pending-box">
              <Target size={16} />
            </div>
            <div className="metric-info">
              <span className="metric-title">Remaining Tasks</span>
              <strong className="metric-val">{pending} pending</strong>
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-icon-box focus-box">
              <Clock size={16} />
            </div>
            <div className="metric-info">
              <span className="metric-title">Focus Time</span>
              <strong className="metric-val">{todayMinutes} / {goalMinutes} min</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Goal Bar */}
      <div className="progress-footer-goal">
        <div className="goal-label-row">
          <span>Daily Focus Target</span>
          <span>{timePct}%</span>
        </div>
        <div className="goal-track">
          <div className="goal-fill" style={{ width: `${timePct}%` }} />
        </div>
      </div>
    </div>
  );
}
