import React, { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, BookOpen, Trash2, Edit2, Layers } from 'lucide-react';

export default function TimetableView({
  timetable = { list: [], by_day: {} },
  subjects = [],
  onAddClassClick,
  onDeleteClass,
  onEditClass
}) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Current day name in real-time
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(todayName || 'Monday');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const dayList = timetable.by_day?.[selectedDay] || timetable.list?.filter(t => t.day_of_week === selectedDay) || [];

  return (
    <div className="timetable-page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Weekly Class Schedule</h2>
          <p className="page-subtitle">
            Manage your daily lectures, laboratory sessions, and tutorial hours in one place.
          </p>
        </div>

        <div className="timetable-header-actions">
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              Day View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              Week Grid
            </button>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => onAddClassClick(selectedDay)}
            id="btn-add-class"
          >
            <Plus size={16} />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Day Selector Navigation */}
      {viewMode === 'daily' && (
        <div className="day-selector-card card">
          <div className="day-tabs-row">
            {daysOfWeek.map((day) => {
              const isToday = day === todayName;
              const isSelected = day === selectedDay;
              const count = (timetable.by_day?.[day] || []).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`day-tab-btn ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                >
                  <span className="day-name-short">{day.substring(0, 3)}</span>
                  <span className="day-name-full">{day}</span>
                  <span className="day-class-count">{count} classes</span>
                  {isToday && <span className="today-badge">TODAY</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Content View */}
      {viewMode === 'daily' && (
        <div className="day-schedule-content">
          <div className="day-schedule-header">
            <h3>{selectedDay} Schedule</h3>
            <span className="badge badge-primary">{dayList.length} Sessions</span>
          </div>

          {dayList.length === 0 ? (
            <div className="empty-state card">
              <Calendar size={36} className="empty-icon-large" />
              <h3>No classes scheduled for {selectedDay}</h3>
              <p>Take this time to work on assignments or relax.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => onAddClassClick(selectedDay)}
              >
                <Plus size={14} />
                <span>Add Class for {selectedDay}</span>
              </button>
            </div>
          ) : (
            <div className="day-class-cards-grid">
              {dayList.map((item) => (
                <div 
                  key={item.id} 
                  className="class-slot-card card"
                  style={{ borderTop: `4px solid ${item.subject_color || '#52796F'}` }}
                >
                  <div className="slot-card-header">
                    <div className="slot-time-pill">
                      <Clock size={13} />
                      <span>{formatTime(item.start_time)} – {formatTime(item.end_time)}</span>
                    </div>

                    <span className="slot-type-pill">{item.type || 'Lecture'}</span>
                  </div>

                  <div className="slot-body">
                    <h3 className="slot-subject-title">{item.subject_name || 'Class Session'}</h3>
                    {item.subject_code && (
                      <span className="slot-subject-code">{item.subject_code}</span>
                    )}

                    <div className="slot-details-list">
                      <div className="slot-detail-item">
                        <MapPin size={13} />
                        <span>Room: <strong>{item.room || 'TBA'}</strong></span>
                      </div>
                      {item.instructor && (
                        <div className="slot-detail-item">
                          <BookOpen size={13} />
                          <span>{item.instructor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="slot-card-footer">
                    <button 
                      className="btn-icon" 
                      onClick={() => onEditClass(item)}
                      title="Edit class"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      className="btn-icon btn-icon-danger" 
                      onClick={() => onDeleteClass(item.id)}
                      title="Remove class"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Week Grid View */}
      {viewMode === 'weekly' && (
        <div className="weekly-grid-container card">
          <div className="weekly-columns-wrapper">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
              const classes = timetable.by_day?.[day] || [];
              const isToday = day === todayName;

              return (
                <div key={day} className={`week-col ${isToday ? 'week-col-today' : ''}`}>
                  <div className="week-col-header">
                    <h4>{day}</h4>
                    <span className="week-col-badge">{classes.length}</span>
                  </div>

                  <div className="week-col-items">
                    {classes.length === 0 ? (
                      <div className="week-col-empty">Free day</div>
                    ) : (
                      classes.map((cls) => (
                        <div 
                          key={cls.id} 
                          className="week-class-chip"
                          style={{ borderLeftColor: cls.subject_color || '#52796F' }}
                        >
                          <span className="week-chip-time">{formatTime(cls.start_time)}</span>
                          <strong className="week-chip-title">{cls.subject_name}</strong>
                          <span className="week-chip-room">{cls.room}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
