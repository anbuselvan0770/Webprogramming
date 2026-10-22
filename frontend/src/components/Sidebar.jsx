import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Timer, 
  FolderGit2, 
  BarChart3, 
  Settings, 
  GraduationCap,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
    { id: 'resources', label: 'Resource Vault', icon: FolderGit2 },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="studysync-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <GraduationCap size={22} className="brand-icon" />
        </div>
        <div className="brand-text">
          <h2>StudySync</h2>
          <span className="brand-subtitle">Student Planner</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-group-title">MAIN MENU</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* User Quick Profile */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name || 'Abinash S'}</p>
          <p className="user-dept">{user?.course ? user.course.split(' ')[0] : 'B.Tech'}</p>
        </div>
      </div>
      <button type="button" className="sidebar-logout" onClick={onLogout}>
        <LogOut size={17} />
        <span>Log out</span>
      </button>
    </aside>
  );
}
