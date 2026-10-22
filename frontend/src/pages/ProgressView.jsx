import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Flame, 
  BookOpen, 
  Target,
  Award,
  Calendar
} from 'lucide-react';

export default function ProgressView({
  dashboardData = {},
  subjects = [],
  tasks = []
}) {
  const { progress, focus } = dashboardData;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const totalCount = tasks.length;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalFocusMinutes = focus?.today_minutes || 75;
  const studyHours = (totalFocusMinutes / 60).toFixed(1);
  const streakDays = focus?.streak_days || 3;

  // Compute subject breakdowns
  const subjectProgress = subjects.map((sub) => {
    const subTasks = tasks.filter(t => String(t.subject_id) === String(sub.id));
    const subCompleted = subTasks.filter(t => t.status === 'Completed').length;
    const subTotal = subTasks.length;
    const pct = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
    return {
      ...sub,
      total_tasks: subTotal,
      completed_tasks: subCompleted,
      progress_pct: pct
    };
  });

  // Mock past 7 days for the study hours bar visual
  const pastDays = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 2.8 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 1.0 },
    { day: 'Sun', hours: 2.0 },
  ];
  const maxHours = Math.max(...pastDays.map(d => d.hours), 4);

  return (
    <div className="progress-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Academic Progress & Analytics</h2>
          <p className="page-subtitle">
            Visual metrics tracking task completions, weekly study hours, and subject performance.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="progress-kpi-grid">
        <div className="kpi-card card">
          <div className="kpi-icon-box bg-sage">
            <CheckCircle2 size={20} color="var(--primary)" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Overall Completion</span>
            <strong className="kpi-value">{overallPct}%</strong>
            <span className="kpi-subtext">{completedCount} of {totalCount} tasks done</span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-box bg-blue">
            <Clock size={20} color="#2563EB" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Study Time Today</span>
            <strong className="kpi-value">{studyHours} hrs</strong>
            <span className="kpi-subtext">{totalFocusMinutes} focus minutes</span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-box bg-amber">
            <Flame size={20} color="#D97706" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Current Streak</span>
            <strong className="kpi-value">{streakDays} Days</strong>
            <span className="kpi-subtext">Consecutive study sessions</span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-box bg-purple">
            <Target size={20} color="#8B5CF6" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Focus Sessions</span>
            <strong className="kpi-value">{focus?.today_sessions || 0}</strong>
            <span className="kpi-subtext">Completed Pomodoros</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="analytics-main-grid">
        {/* Left: Subject-wise Progress */}
        <div className="card subject-analytics-card">
          <div className="card-header-clean">
            <div className="header-title-group">
              <span className="card-badge-label">SUBJECT PERFORMANCE</span>
              <h4>Course Syllabus Completion</h4>
            </div>
            <span className="badge badge-primary">{subjectProgress.length} Courses</span>
          </div>

          <div className="subject-bars-list">
            {subjectProgress.map((sub) => (
              <div key={sub.id} className="subject-progress-row">
                <div className="sub-row-header">
                  <div className="sub-info">
                    <span 
                      className="sub-dot" 
                      style={{ backgroundColor: sub.color || '#52796F' }}
                    />
                    <strong>{sub.name}</strong>
                    <span className="sub-code">{sub.code}</span>
                  </div>
                  <div className="sub-stats">
                    <span className="sub-task-count">{sub.completed_tasks}/{sub.total_tasks} tasks</span>
                    <strong className="sub-pct">{sub.progress_pct}%</strong>
                  </div>
                </div>

                <div className="sub-bar-track">
                  <div 
                    className="sub-bar-fill" 
                    style={{ 
                      width: `${sub.progress_pct}%`,
                      backgroundColor: sub.color || '#52796F'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Weekly Study Hours Chart */}
        <div className="card weekly-chart-card">
          <div className="card-header-clean">
            <div className="header-title-group">
              <span className="card-badge-label">WEEKLY OVERVIEW</span>
              <h4>Study Hours Distribution</h4>
            </div>
            <span className="badge badge-low">Past 7 Days</span>
          </div>

          <div className="chart-bars-wrapper">
            {pastDays.map((d) => {
              const heightPct = Math.round((d.hours / maxHours) * 100);
              return (
                <div key={d.day} className="chart-bar-col">
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day}: ${d.hours} hours`}
                    />
                  </div>
                  <span className="bar-val-text">{d.hours}h</span>
                  <span className="bar-day-label">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-footer-note">
            <Award size={14} color="var(--primary)" />
            <span>Optimal study consistency maintained across weekday slots!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
