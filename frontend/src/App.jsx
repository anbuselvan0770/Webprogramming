import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import AddEditTaskModal from './components/AddEditTaskModal';
import AddEditClassModal from './components/AddEditClassModal';
import AddEditResourceModal from './components/AddEditResourceModal';
import AuthModal from './components/AuthModal';

import DashboardView from './pages/DashboardView';
import TasksView from './pages/TasksView';
import TimetableView from './pages/TimetableView';
import FocusView from './pages/FocusView';
import ResourcesView from './pages/ResourcesView';
import ProgressView from './pages/ProgressView';
import SettingsView from './pages/SettingsView';

import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('cosmic-amethyst');
  const [searchTerm, setSearchTerm] = useState('');

  // Primary data states
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timetable, setTimetable] = useState({ list: [], by_day: {} });
  const [pomodoroData, setPomodoroData] = useState({});
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);
  const [defaultClassDay, setDefaultClassDay] = useState('Monday');

  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);

  const [isAuthOpen, setIsAuthOpen] = useState(true);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [dash, subs, tList, tt, pomo, res] = await Promise.all([
        api.getDashboard(),
        api.getSubjects(),
        api.getTasks(),
        api.getTimetable(),
        api.getPomodoro(),
        api.getResources()
      ]);

      setDashboardData(dash);
      if (dash?.student) {
        setUser(dash.student);
        if (dash.student.theme_preference) {
          setTheme(dash.student.theme_preference);
        }
      }
      setSubjects(subs || []);
      setTasks(tList || []);
      setTimetable(tt || { list: [], by_day: {} });
      setPomodoroData(pomo || {});
      setResources(res || []);
      setNotifications(dash?.notifications || []);
    } catch (err) {
      console.error('Error loading study data:', err);
    }
  }, []);

  useEffect(() => {
    if (!api.hasSession()) return undefined;

    let active = true;
    api.getProfile()
      .then(async (profile) => {
        if (!active) return;
        setUser(profile);
        setTheme(profile.theme_preference || 'cosmic-amethyst');
        setIsAuthOpen(false);
        await loadData();
      })
      .catch((error) => {
        if (!active) return;
        console.warn('Unable to restore the saved StudySync session:', error.message);
        api.logout();
        setUser(null);
        setDashboardData(null);
        setIsAuthOpen(true);
      });

    return () => {
      active = false;
    };
  }, [loadData]);

  // Task actions
  const handleToggleTask = async (taskId) => {
    await api.toggleTask(taskId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    const updatedDash = await api.getDashboard();
    setDashboardData(updatedDash);
  };

  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsAddTaskOpen(true);
  };

  const handleSaveTask = async (taskFormData) => {
    const subjectName = taskFormData.subject_name?.trim() || '';
    let subject = subjects.find(item => item.name.toLowerCase() === subjectName.toLowerCase());

    if (subjectName && !subject) {
      subject = await api.createSubject({ name: subjectName });
      setSubjects(prev => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name)));
    }

    const taskData = {
      ...taskFormData,
      subject_id: subject?.id || null
    };
    delete taskData.subject_name;

    if (taskData.id) {
      await api.updateTask(taskData);
    } else {
      await api.createTask(taskData);
    }
    const [updatedTasks, updatedDash] = await Promise.all([
      api.getTasks(),
      api.getDashboard()
    ]);
    setTasks(updatedTasks);
    setDashboardData(updatedDash);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      const updatedDash = await api.getDashboard();
      setDashboardData(updatedDash);
    }
  };

  // Timetable actions
  const handleOpenAddClass = (day = 'Monday') => {
    setClassToEdit(null);
    setDefaultClassDay(day);
    setIsAddClassOpen(true);
  };

  const handleEditClass = (item) => {
    setClassToEdit(item);
    setIsAddClassOpen(true);
  };

  const handleSaveClass = async (classData) => {
    await api.createTimetableSlot(classData);
    const updatedTT = await api.getTimetable();
    setTimetable(updatedTT);
    const updatedDash = await api.getDashboard();
    setDashboardData(updatedDash);
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Remove this class from schedule?')) {
      await api.deleteTimetableSlot(id);
      const updatedTT = await api.getTimetable();
      setTimetable(updatedTT);
      const updatedDash = await api.getDashboard();
      setDashboardData(updatedDash);
    }
  };

  // Pomodoro actions
  const handleLogPomodoroSession = async (sessionData) => {
    await api.logPomodoroSession(sessionData);
    const [updatedPomo, updatedDash] = await Promise.all([
      api.getPomodoro(),
      api.getDashboard()
    ]);
    setPomodoroData(updatedPomo);
    setDashboardData(updatedDash);
  };

  // Resource actions
  const handleOpenAddResource = () => {
    setResourceToEdit(null);
    setIsAddResourceOpen(true);
  };

  const handleEditResource = (resource) => {
    setResourceToEdit(resource);
    setIsAddResourceOpen(true);
  };

  const handleSaveResource = async (resData) => {
    if (resData.id) {
      await api.createResource(resData);
    } else {
      await api.createResource(resData);
    }
    const updatedRes = await api.getResources();
    setResources(updatedRes);
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Delete this saved resource?')) {
      await api.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  // Profile actions
  const handleUpdateProfile = async (profileData) => {
    const updatedUser = await api.updateProfile(profileData);
    setUser(updatedUser);
    const updatedDash = await api.getDashboard();
    setDashboardData(updatedDash);
  };

  const handleThemeChange = async (nextTheme) => {
    setTheme(nextTheme);
    const updatedUser = await api.updateProfile({
      ...user,
      theme_preference: nextTheme
    });
    setUser(updatedUser);
    setDashboardData(prev => prev ? {
      ...prev,
      student: { ...prev.student, theme_preference: nextTheme }
    } : prev);
  };

  const handleCreateSubject = async (subject) => {
    const createdSubject = await api.createSubject(subject);
    setSubjects(prev => [...prev, createdSubject].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteSubject = async (subjectId) => {
    await api.deleteSubject(subjectId);
    setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
    const [updatedTasks, updatedTimetable, updatedResources, updatedDash] = await Promise.all([
      api.getTasks(),
      api.getTimetable(),
      api.getResources(),
      api.getDashboard()
    ]);
    setTasks(updatedTasks);
    setTimetable(updatedTimetable);
    setResources(updatedResources);
    setDashboardData(updatedDash);
  };

  const handleLogin = async (email, password) => {
    const loggedInUser = await api.login(email, password);
    setUser(loggedInUser);
    setTheme(loggedInUser.theme_preference || 'cosmic-amethyst');
    setIsAuthOpen(false);
    await loadData();
  };

  const handleRegister = async (userData) => {
    const registeredUser = await api.register(userData);
    setUser(registeredUser);
    setTheme(registeredUser.theme_preference || 'cosmic-amethyst');
    setIsAuthOpen(false);
    await loadData();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setDashboardData(null);
    setSubjects([]);
    setTasks([]);
    setTimetable({ list: [], by_day: {} });
    setPomodoroData({});
    setResources([]);
    setNotifications([]);
    setTheme('cosmic-amethyst');
    setActiveTab('dashboard');
    setIsAuthOpen(true);
  };

  if (!user && !dashboardData) {
    return (
      <div className="auth-gate">
        <AuthModal
          isOpen={isAuthOpen}
          canClose={false}
          onClose={() => {}}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    );
  }

  return (
    <div className="studysync-app-shell">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main App Workspace */}
      <div className="studysync-main-area">
        {/* Top Header */}
        <TopHeader 
          greeting={dashboardData?.greeting}
          user={user}
          notifications={notifications}
          onAddTaskClick={handleOpenAddTask}
          onOpenAuth={() => setIsAuthOpen(true)}
          streakDays={dashboardData?.focus?.streak_days || 1}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Viewport for Active Tab */}
        <main className="page-viewport">
          {activeTab === 'dashboard' && dashboardData && (
            <DashboardView 
              dashboardData={dashboardData}
              subjects={subjects}
              onToggleTask={handleToggleTask}
              onAddTaskClick={handleOpenAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onViewAllTasks={() => setActiveTab('tasks')}
              onViewTimetable={() => setActiveTab('timetable')}
              onSessionComplete={handleLogPomodoroSession}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView 
              tasks={tasks}
              subjects={subjects}
              onToggleTask={handleToggleTask}
              onAddTaskClick={handleOpenAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableView 
              timetable={timetable}
              subjects={subjects}
              onAddClassClick={handleOpenAddClass}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeTab === 'focus' && (
            <FocusView 
              pomodoroData={pomodoroData}
              subjects={subjects}
              tasks={tasks}
              onLogSession={handleLogPomodoroSession}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView 
              resources={resources}
              subjects={subjects}
              onAddResourceClick={handleOpenAddResource}
              onEditResource={handleEditResource}
              onDeleteResource={handleDeleteResource}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView 
              dashboardData={dashboardData || {}}
              subjects={subjects}
              tasks={tasks}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              user={user}
              onUpdateProfile={handleUpdateProfile}
              theme={theme}
              onThemeChange={handleThemeChange}
              subjects={subjects}
              onCreateSubject={handleCreateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddEditTaskModal 
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSave={handleSaveTask}
        subjects={subjects}
        taskToEdit={taskToEdit}
      />

      <AddEditClassModal 
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSave={handleSaveClass}
        subjects={subjects}
        classToEdit={classToEdit}
        defaultDay={defaultClassDay}
      />

      <AddEditResourceModal 
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        onSave={handleSaveResource}
        subjects={subjects}
        resourceToEdit={resourceToEdit}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        currentUser={user}
        canClose={Boolean(user)}
      />
    </div>
  );
}
