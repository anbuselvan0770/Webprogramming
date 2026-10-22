import React from 'react';
import { Check, Calendar, ArrowRight, Plus, Trash2, Edit2 } from 'lucide-react';

export default function PriorityTaskList({ 
  tasks = [], 
  onToggleTask, 
  onAddTaskClick, 
  onEditTask, 
  onDeleteTask,
  onViewAllTasks 
}) {
  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);

    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card priority-tasks-card">
      <div className="card-header-clean">
        <div className="header-title-group">
          <span className="card-badge-label">PRIORITY TASKS</span>
          <span className="card-item-count">{tasks.length} items</span>
        </div>
        <div className="card-header-actions">
          <button 
            className="btn btn-outline btn-xs"
            onClick={onAddTaskClick}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
          <button 
            className="btn-link-action"
            onClick={onViewAllTasks}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="priority-task-list">
        {tasks.length === 0 ? (
          <div className="empty-state-mini">
            <p>No pending priority tasks. You are all caught up!</p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const dueLabel = formatDueDate(task.due_date);
            const isOverdue = dueLabel.includes('overdue');

            return (
              <div 
                key={task.id} 
                className={`priority-task-item ${isCompleted ? 'task-done' : ''}`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={() => onToggleTask(task.id)}
                  title={isCompleted ? "Mark pending" : "Mark completed"}
                >
                  {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                {/* Content */}
                <div className="task-main-content">
                  <div className="task-title-line">
                    <span className="task-title-text">{task.title}</span>
                  </div>

                  <div className="task-tags-line">
                    {/* Subject Pill */}
                    {task.subject_name && (
                      <span 
                        className="subject-pill"
                        style={{
                          backgroundColor: `${task.subject_color || '#52796F'}18`,
                          color: task.subject_color || '#52796F',
                          borderColor: `${task.subject_color || '#52796F'}40`
                        }}
                      >
                        {task.subject_name}
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span className={`badge badge-${task.priority?.toLowerCase() || 'medium'}`}>
                      {task.priority || 'Medium'}
                    </span>

                    {/* Due Date */}
                    {task.due_date && (
                      <span className={`task-due-chip ${isOverdue ? 'overdue' : ''}`}>
                        <Calendar size={12} />
                        <span>{dueLabel}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="task-item-actions">
                  {onEditTask && (
                    <button 
                      className="task-action-btn"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                  {onDeleteTask && (
                    <button 
                      className="task-action-btn delete"
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
