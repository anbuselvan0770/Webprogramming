import React, { useState } from 'react';
import { Clock, MapPin, Calendar, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export default function UpcomingScheduleWidget({ 
  todayClasses = [], 
  upcomingSchedule = [], 
  onViewTimetable 
}) {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' or 'deadlines'

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

  return (
    <div className="card upcoming-schedule-card">
      <div className="card-header-clean">
        <div className="schedule-header-tabs">
          <button 
            className={`schedule-tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            Today's Classes ({todayClasses.length})
          </button>
          <button 
            className={`schedule-tab-btn ${activeTab === 'deadlines' ? 'active' : ''}`}
            onClick={() => setActiveTab('deadlines')}
          >
            Upcoming Deadlines
          </button>
        </div>

        <button 
          className="btn-link-action"
          onClick={onViewTimetable}
        >
          <span>Timetable</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="schedule-body">
        {activeTab === 'classes' ? (
          todayClasses.length === 0 ? (
            <div className="empty-schedule">
              <Calendar size={24} className="empty-icon" />
              <p>No classes scheduled for today. Enjoy your study time!</p>
            </div>
          ) : (
            <div className="class-timeline">
              {todayClasses.map((item, idx) => (
                <div key={item.id || idx} className="class-timeline-item">
                  <div className="time-badge">
                    <Clock size={12} />
                    <span>{formatTime(item.start_time)}</span>
                  </div>

                  <div 
                    className="class-card-inner"
                    style={{ borderLeftColor: item.subject_color || '#52796F' }}
                  >
                    <div className="class-title-row">
                      <h4>{item.subject_name || 'Class'}</h4>
                      <span className="class-type-badge">{item.type || 'Lecture'}</span>
                    </div>

                    <div className="class-details-row">
                      {item.room && (
                        <span className="class-detail-pill">
                          <MapPin size={11} />
                          <span>{item.room}</span>
                        </span>
                      )}
                      {item.instructor && (
                        <span className="class-detail-pill">
                          <BookOpen size={11} />
                          <span>{item.instructor}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          upcomingSchedule.length === 0 ? (
            <div className="empty-schedule">
              <p>No upcoming exams or deadlines within 14 days.</p>
            </div>
          ) : (
            <div className="deadline-list">
              {upcomingSchedule.map((item, idx) => (
                <div key={item.id || idx} className="deadline-item">
                  <div className="deadline-left">
                    <span className={`deadline-type-tag ${item.item_type}`}>
                      {item.item_type === 'exam' ? 'EXAM' : 'DUE'}
                    </span>
                    <div className="deadline-info">
                      <h4>{item.title}</h4>
                      <span className="deadline-sub">{item.subject_name}</span>
                    </div>
                  </div>
                  <div className="deadline-date-badge">
                    <Calendar size={12} />
                    <span>{item.due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
