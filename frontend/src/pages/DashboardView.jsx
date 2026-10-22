import React from 'react';
import PomodoroWidget from '../components/PomodoroWidget';
import TodayProgressWidget from '../components/TodayProgressWidget';
import PriorityTaskList from '../components/PriorityTaskList';
import UpcomingScheduleWidget from '../components/UpcomingScheduleWidget';

export default function DashboardView({
  dashboardData,
  subjects = [],
  onToggleTask,
  onAddTaskClick,
  onEditTask,
  onDeleteTask,
  onViewAllTasks,
  onViewTimetable,
  onSessionComplete
}) {
  const { progress, focus, priority_tasks = [], today_classes = [], upcoming_schedule = [] } = dashboardData || {};

  return (
    <div className="dashboard-view-container">
      {/* SECTION 1: Top Two Cards (Pomodoro + Today's Progress) */}
      <section className="dashboard-grid-top">
        <PomodoroWidget 
          onSessionComplete={onSessionComplete}
          subjects={subjects}
        />
        <TodayProgressWidget 
          progress={progress}
          focus={focus}
        />
      </section>

      {/* SECTION 2: Priority Tasks (Left) & Upcoming Schedule (Right) */}
      <section className="dashboard-grid-main">
        <PriorityTaskList 
          tasks={priority_tasks}
          onToggleTask={onToggleTask}
          onAddTaskClick={onAddTaskClick}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onViewAllTasks={onViewAllTasks}
        />
        <UpcomingScheduleWidget 
          todayClasses={today_classes}
          upcomingSchedule={upcoming_schedule}
          onViewTimetable={onViewTimetable}
        />
      </section>
    </div>
  );
}
