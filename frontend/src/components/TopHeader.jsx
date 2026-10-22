import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, AlertTriangle, BookOpen, Clock, Flame } from 'lucide-react';

export default function TopHeader({ 
  greeting, 
  user, 
  notifications = [], 
  onAddTaskClick, 
  onOpenAuth,
  streakDays = 1,
  searchTerm,
  setSearchTerm
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="studysync-header">
      {/* Left: Greeting & Date */}
      <div className="header-greeting-area">
        <h1 className="header-title">{greeting || `Good morning, ${user?.name || 'Abinash S'}! Let's focus.`}</h1>
        <div className="header-meta">
          <span className="meta-streak">
            <Flame size={14} className="streak-flame" />
            <strong>{streakDays} Day</strong> Streak
          </span>
          <span className="meta-separator">•</span>
          <span className="meta-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="header-actions">
        {/* Search */}
        <div className="header-search">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks, classes, notes..." 
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Quick Add Button */}
        <button 
          onClick={onAddTaskClick} 
          className="btn btn-primary header-add-btn"
          id="btn-header-add-task"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>

        {/* Notification Bell */}
        <div className="notification-wrapper" ref={notifRef}>
          <button 
            className="btn-icon header-notif-btn" 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifDropdown && (
            <div className="notif-dropdown card">
              <div className="notif-header">
                <h3>Notifications</h3>
                <span className="badge badge-primary">{unreadCount} new</span>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.is_read ? 'read' : 'unread'}`}>
                      <div className="notif-item-icon">
                        {n.type === 'deadline' ? <AlertTriangle size={15} color="#E11D48" /> : 
                         n.type === 'class' ? <BookOpen size={15} color="#3B82F6" /> : 
                         <Clock size={15} color="#4A7C59" />}
                      </div>
                      <div className="notif-content">
                        <h4>{n.title}</h4>
                        <p>{n.message}</p>
                        <span className="notif-time">{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button 
          className="header-avatar-btn" 
          onClick={onOpenAuth}
          title="Account profile & options"
        >
          <div className="header-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </button>
      </div>
    </header>
  );
}
