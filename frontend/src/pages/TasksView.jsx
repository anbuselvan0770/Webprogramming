import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TasksView({
  tasks = [],
  subjects = [],
  onToggleTask,
  onAddTaskClick,
  onEditTask,
  onDeleteTask
}) {
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Completed'
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date_asc');

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status
      if (statusFilter === 'Pending' && task.status === 'Completed') return false;
      if (statusFilter === 'Completed' && task.status !== 'Completed') return false;

      // Subject
      if (subjectFilter !== 'All' && String(task.subject_id) !== String(subjectFilter)) return false;

      // Priority
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(q);
        const descMatch = task.description?.toLowerCase().includes(q);
        const subMatch = task.subject_name?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !subMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'due_date_asc') {
        return (a.due_date || '').localeCompare(b.due_date || '');
      }
      if (sortBy === 'due_date_desc') {
        return (b.due_date || '').localeCompare(a.due_date || '');
      }
      if (sortBy === 'priority_desc') {
        const pOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return (pOrder[a.priority] || 4) - (pOrder[b.priority] || 4);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [tasks, statusFilter, subjectFilter, priorityFilter, searchQuery, sortBy]);

  const handleToggle = (id) => {
    onToggleTask(id);
    const target = tasks.find(t => t.id === id);
    if (target && target.status !== 'Completed') {
      // If marking as completed, trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4A7C59', '#3B82F6', '#10B981']
      });
    }
  };

  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="tasks-page-container">
      {/* Header Bar */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Academic Task Management</h2>
          <p className="page-subtitle">
            Organize assignments, lab submissions, and study goals by subject and priority.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={onAddTaskClick}
          id="btn-tasks-add"
        >
          <Plus size={16} />
          <span>Create Task</span>
        </button>
      </div>

      {/* Control Bar: Tabs + Filters */}
      <div className="tasks-controls-card card">
        <div className="tasks-status-tabs">
          <button 
            className={`status-tab ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All Tasks ({tasks.length})
          </button>
          <button 
            className={`status-tab ${statusFilter === 'Pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending ({pendingCount})
          </button>
          <button 
            className={`status-tab ${statusFilter === 'Completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="tasks-filter-row">
          {/* Search */}
          <div className="filter-search-box">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search by title or topic..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Subject Filter */}
          <select 
            className="filter-select"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select 
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Sort By */}
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="due_date_asc">Due Date (Earliest)</option>
            <option value="due_date_desc">Due Date (Latest)</option>
            <option value="priority_desc">Priority (High to Low)</option>
            <option value="title_asc">Title (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="tasks-list-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state card">
            <CheckCircle2 size={40} className="empty-icon-large" />
            <h3>No tasks match your criteria</h3>
            <p>You can create a new assignment or clear your active filters.</p>
            <button className="btn btn-outline" onClick={onAddTaskClick}>
              <Plus size={15} />
              <span>Add a Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';

            return (
              <div 
                key={task.id} 
                className={`task-card-full card ${isCompleted ? 'task-completed-card' : ''}`}
              >
                <div className="task-card-left">
                  <button 
                    type="button"
                    className={`task-checkbox-large ${isCompleted ? 'checked' : ''}`}
                    onClick={() => handleToggle(task.id)}
                    title={isCompleted ? "Mark pending" : "Mark completed"}
                  >
                    {isCompleted && <Check size={16} strokeWidth={3} />}
                  </button>

                  <div className="task-card-details">
                    <div className="task-title-and-badges">
                      <h3 className={`task-full-title ${isCompleted ? 'strikethrough' : ''}`}>
                        {task.title}
                      </h3>

                      <span className={`badge badge-${task.priority?.toLowerCase() || 'medium'}`}>
                        {task.priority || 'Medium'}
                      </span>

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
                    </div>

                    {task.description && (
                      <p className="task-card-desc">{task.description}</p>
                    )}

                    <div className="task-card-meta">
                      <span className="task-meta-item">
                        <Calendar size={13} />
                        <span>Due: {task.due_date}</span>
                      </span>

                      {task.due_time && (
                        <span className="task-meta-item">
                          <Clock size={13} />
                          <span>{task.due_time.substring(0, 5)}</span>
                        </span>
                      )}

                      {task.estimated_minutes && (
                        <span className="task-meta-item">
                          <span>~{task.estimated_minutes} min study</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="task-card-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => onEditTask(task)}
                    title="Edit task"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button 
                    className="btn-icon btn-icon-danger" 
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
