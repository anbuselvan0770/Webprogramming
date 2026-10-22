// StudySync API Service Layer with MySQL/PHP & LocalStorage Failover Bridge

const API_BASE = '/api';

// Keep the demo profile for local-only use, but start with a clean study plan.
const INITIAL_DEMO_DATA = {
  user: {
    id: 1,
    name: "Abinash S",
    email: "abinash@student.sync",
    course: "B.Tech Computer Science & Engg",
    year_of_study: "3rd Year (Sem 6)",
    department: "School of Computing",
    daily_goal_minutes: 150,
    theme_preference: "cosmic-amethyst"
  },
  subjects: [
    { id: 1, name: "Web Programming", code: "CS401", color: "#52796F", instructor: "Dr. Rajesh Kumar", total_tasks: 2, completed_tasks: 0, progress_pct: 0 },
    { id: 2, name: "Database Management Systems", code: "CS402", color: "#3B82F6", instructor: "Prof. Ananya Sen", total_tasks: 1, completed_tasks: 0, progress_pct: 0 },
    { id: 3, name: "Discrete Mathematics", code: "MA301", color: "#8B5CF6", instructor: "Dr. S. Ramanujam", total_tasks: 1, completed_tasks: 1, progress_pct: 100 },
    { id: 4, name: "Java & Object Oriented Design", code: "CS403", color: "#F59E0B", instructor: "Prof. Karthikeyan", total_tasks: 1, completed_tasks: 0, progress_pct: 0 },
    { id: 5, name: "Computer Networks", code: "CS404", color: "#10B981", instructor: "Dr. Meenakshi S", total_tasks: 1, completed_tasks: 0, progress_pct: 0 }
  ],
  tasks: [
    { id: 1, subject_id: 1, title: "Complete React Assignment", description: "Build responsive components, custom hooks, and route integration.", priority: "High", due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], due_time: "23:59:00", status: "In Progress", estimated_minutes: 60, subject_name: "Web Programming", subject_color: "#52796F" },
    { id: 2, subject_id: 2, title: "DBMS Preparation - Relational Calculus & SQL", description: "Practice nested queries, joins, and normal form decompositions.", priority: "High", due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], due_time: "18:00:00", status: "Pending", estimated_minutes: 90, subject_name: "Database Management Systems", subject_color: "#3B82F6" },
    { id: 3, subject_id: 3, title: "Mathematics Assignment - Graph Theory & Trees", description: "Solve problem sheet 4 on planar graphs and Dijkstra minimum spanning trees.", priority: "High", due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], due_time: "17:00:00", status: "Completed", completed_at: new Date().toISOString(), estimated_minutes: 45, subject_name: "Discrete Mathematics", subject_color: "#8B5CF6" },
    { id: 4, subject_id: 4, title: "Java OOP Lab - Multithreading & Producer Consumer", description: "Implement bounded buffer synchronisation with thread pools.", priority: "Medium", due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], due_time: "20:00:00", status: "Pending", estimated_minutes: 60, subject_name: "Java & Object Oriented Design", subject_color: "#F59E0B" },
    { id: 5, subject_id: 5, title: "Network Layer Packet Routing Simulation", description: "Simulate distance vector and link-state routing algorithms.", priority: "Medium", due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], due_time: "23:59:00", status: "Pending", estimated_minutes: 75, subject_name: "Computer Networks", subject_color: "#10B981" },
    { id: 6, subject_id: 1, title: "Review CSS Grid & Flexbox layouts", description: "Read modern responsive design best practices for viva exam.", priority: "Low", due_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], due_time: "15:00:00", status: "Pending", estimated_minutes: 30, subject_name: "Web Programming", subject_color: "#52796F" }
  ],
  timetable: [
    { id: 1, subject_id: 1, day_of_week: "Monday", start_time: "09:00:00", end_time: "10:00:00", room: "LH-301", type: "Lecture", subject_name: "Web Programming", subject_color: "#52796F", instructor: "Dr. Rajesh Kumar" },
    { id: 2, subject_id: 2, day_of_week: "Monday", start_time: "10:00:00", end_time: "11:00:00", room: "LH-204", type: "Lecture", subject_name: "Database Management Systems", subject_color: "#3B82F6", instructor: "Prof. Ananya Sen" },
    { id: 3, subject_id: 3, day_of_week: "Monday", start_time: "11:15:00", end_time: "12:15:00", room: "LH-102", type: "Lecture", subject_name: "Discrete Mathematics", subject_color: "#8B5CF6", instructor: "Dr. S. Ramanujam" },
    { id: 4, subject_id: 4, day_of_week: "Monday", start_time: "14:00:00", end_time: "16:00:00", room: "CS Lab 2", type: "Lab", subject_name: "Java & Object Oriented Design", subject_color: "#F59E0B", instructor: "Prof. Karthikeyan" },

    { id: 5, subject_id: 5, day_of_week: "Tuesday", start_time: "09:30:00", end_time: "10:30:00", room: "LH-301", type: "Lecture", subject_name: "Computer Networks", subject_color: "#10B981", instructor: "Dr. Meenakshi S" },
    { id: 6, subject_id: 1, day_of_week: "Tuesday", start_time: "11:00:00", end_time: "12:30:00", room: "Web Lab 1", type: "Lab", subject_name: "Web Programming", subject_color: "#52796F", instructor: "Dr. Rajesh Kumar" },
    { id: 7, subject_id: 3, day_of_week: "Tuesday", start_time: "14:00:00", end_time: "15:00:00", room: "LH-102", type: "Tutorial", subject_name: "Discrete Mathematics", subject_color: "#8B5CF6", instructor: "Dr. S. Ramanujam" },

    { id: 8, subject_id: 2, day_of_week: "Wednesday", start_time: "09:00:00", end_time: "10:00:00", room: "LH-204", type: "Lecture", subject_name: "Database Management Systems", subject_color: "#3B82F6", instructor: "Prof. Ananya Sen" },
    { id: 9, subject_id: 4, day_of_week: "Wednesday", start_time: "10:15:00", end_time: "11:15:00", room: "LH-302", type: "Lecture", subject_name: "Java & Object Oriented Design", subject_color: "#F59E0B", instructor: "Prof. Karthikeyan" },
    { id: 10, subject_id: 5, day_of_week: "Wednesday", start_time: "14:00:00", end_time: "15:30:00", room: "Network Lab", type: "Lab", subject_name: "Computer Networks", subject_color: "#10B981", instructor: "Dr. Meenakshi S" },

    { id: 11, subject_id: 1, day_of_week: "Thursday", start_time: "10:00:00", end_time: "11:00:00", room: "LH-301", type: "Lecture", subject_name: "Web Programming", subject_color: "#52796F", instructor: "Dr. Rajesh Kumar" },
    { id: 12, subject_id: 3, day_of_week: "Thursday", start_time: "11:15:00", end_time: "12:15:00", room: "LH-102", type: "Lecture", subject_name: "Discrete Mathematics", subject_color: "#8B5CF6", instructor: "Dr. S. Ramanujam" },
    { id: 13, subject_id: 2, day_of_week: "Thursday", start_time: "14:00:00", end_time: "15:30:00", room: "Database Lab", type: "Lab", subject_name: "Database Management Systems", subject_color: "#3B82F6", instructor: "Prof. Ananya Sen" },

    { id: 14, subject_id: 4, day_of_week: "Friday", start_time: "09:00:00", end_time: "10:00:00", room: "LH-302", type: "Lecture", subject_name: "Java & Object Oriented Design", subject_color: "#F59E0B", instructor: "Prof. Karthikeyan" },
    { id: 15, subject_id: 5, day_of_week: "Friday", start_time: "10:15:00", end_time: "11:15:00", room: "LH-102", type: "Lecture", subject_name: "Computer Networks", subject_color: "#10B981", instructor: "Dr. Meenakshi S" },
    { id: 16, subject_id: 1, day_of_week: "Friday", start_time: "14:00:00", end_time: "15:00:00", room: "Seminar Hall", type: "Seminar", subject_name: "Web Programming", subject_color: "#52796F", instructor: "Dr. Rajesh Kumar" }
  ],
  pomodoro: {
    today_sessions: 3,
    today_minutes: 75,
    streak_days: 4,
    recent_sessions: [
      { id: 1, duration_minutes: 25, session_type: "Focus", notes: "Built task filtering and tag components", subject_name: "Web Programming", subject_color: "#52796F", completed_at: new Date(Date.now() - 4 * 3600000).toISOString() },
      { id: 2, duration_minutes: 5, session_type: "Short Break", notes: "Stretching and hydration", completed_at: new Date(Date.now() - 3 * 3600000).toISOString() },
      { id: 3, duration_minutes: 25, session_type: "Focus", notes: "Solved 3 B+ Tree index problems", subject_name: "Database Management Systems", subject_color: "#3B82F6", completed_at: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: 4, duration_minutes: 25, session_type: "Focus", notes: "Completed Graph theory assignment sheet", subject_name: "Discrete Mathematics", subject_color: "#8B5CF6", completed_at: new Date(Date.now() - 1 * 3600000).toISOString() }
    ]
  },
  resources: [
    { id: 1, subject_id: 1, title: "React 19 Official Documentation & Guides", category: "Website", url: "https://react.dev", description: "Core documentation covering Hooks, State Management, and Suspense.", subject_name: "Web Programming", subject_color: "#52796F" },
    { id: 2, subject_id: 1, title: "Full Stack Web Architecture Tutorial", category: "YouTube Link", url: "https://youtube.com", description: "Comprehensive walkthrough of REST API design and React component patterns.", subject_name: "Web Programming", subject_color: "#52796F" },
    { id: 3, subject_id: 2, title: "Database System Concepts (Silberschatz) Handouts", category: "PDF Document", url: "https://www.db-book.com", description: "Chapter 7 & 8 reference notes on Relational Normalisation (BCNF & 3NF).", subject_name: "Database Management Systems", subject_color: "#3B82F6" },
    { id: 4, subject_id: 3, title: "Discrete Math & Combinatorics Lecture Notes", category: "Notes", url: "", description: "Prof. Ramanujam's quick summary of Euler graphs, Hamiltonian circuits, and vertex coloring.", subject_name: "Discrete Mathematics", subject_color: "#8B5CF6" },
    { id: 5, subject_id: 4, title: "Java Concurrency in Practice & Thread Pools", category: "Reference Book", url: "https://docs.oracle.com/javase/tutorial/", description: "Reference guide on ExecutorService, ReentrantLock, and synchronized collections.", subject_name: "Java & Object Oriented Design", subject_color: "#F59E0B" }
  ],
  exams: [
    { id: 1, subject_id: 2, title: "DBMS Mid-Term Assessment", exam_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], start_time: "10:00:00", venue: "Exam Hall A", syllabus: "Units 1-3: ER Diagrams, Relational Algebra, SQL, Normal Forms 1NF to BCNF", subject_name: "Database Management Systems", subject_color: "#3B82F6" },
    { id: 2, subject_id: 1, title: "Web Programming Lab Exam & Viva", exam_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], start_time: "14:00:00", venue: "Software Lab 3", syllabus: "HTML5, CSS3 Grid, JavaScript ES6+, React Components & State, PHP REST API integration", subject_name: "Web Programming", subject_color: "#52796F" },
    { id: 3, subject_id: 3, title: "Discrete Mathematics Quiz 2", exam_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0], start_time: "11:15:00", venue: "Room 204", syllabus: "Graph theory, trees, Eulerian paths, Boolean algebra", subject_name: "Discrete Mathematics", subject_color: "#8B5CF6" }
  ],
  notifications: [
    { id: 1, title: "⚠️ Assignment Deadline Approaching", message: "DBMS Preparation - Relational Calculus & SQL is due tomorrow at 06:00 PM.", type: "deadline", is_read: 0, created_at: "Just now" },
    { id: 2, title: "📚 Class in 30 Minutes", message: "Web Programming (LH-301) begins shortly.", type: "class", is_read: 0, created_at: "15m ago" },
    { id: 3, title: "🔥 Great Focus Today!", message: "You achieved 3 Pomodoro focus sessions (75 minutes) today.", type: "pomodoro", is_read: 1, created_at: "1h ago" }
  ]
};

const INITIAL_EMPTY_DATA = {
  ...INITIAL_DEMO_DATA,
  user: {
    ...INITIAL_DEMO_DATA.user,
    theme_preference: 'cosmic-amethyst'
  },
  subjects: [],
  tasks: [],
  timetable: [],
  pomodoro: { today_sessions: 0, today_minutes: 0, streak_days: 0, recent_sessions: [] },
  resources: [],
  exams: [],
  notifications: []
};

// Local storage helper
function getLocalStore() {
  const stored = localStorage.getItem('studysync_data');
  if (!stored) {
    localStorage.setItem('studysync_data', JSON.stringify(INITIAL_EMPTY_DATA));
    return JSON.parse(JSON.stringify(INITIAL_EMPTY_DATA));
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return JSON.parse(JSON.stringify(INITIAL_EMPTY_DATA));
  }
}

function saveLocalStore(data) {
  localStorage.setItem('studysync_data', JSON.stringify(data));
}

// Request helper with automatic fallback
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('studysync_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Server returned HTTP ${res.status}`);
    }
    return { data: data.data, isBackend: true };
  } catch (err) {
    console.warn(`[StudySync API Notice] Backend unavailable on ${endpoint}. Using local resilience engine.`, err.message);
    return { data: null, isBackend: false, error: err.message };
  }
}

// Public API
export const api = {
  // Auth & Profile
  async login(email, password) {
    const res = await request('/auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (!res.isBackend || !res.data) {
      throw new Error(res.error || 'Sign in failed. Please check your details.');
    }
    localStorage.setItem('studysync_token', res.data.token);
    localStorage.setItem('studysync_user', JSON.stringify(res.data.user));
    return res.data.user;
  },

  async register(userData) {
    const res = await request('/auth?action=register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (!res.isBackend || !res.data) {
      throw new Error(res.error || 'Registration failed. Please try again.');
    }
    localStorage.setItem('studysync_token', res.data.token);
    localStorage.setItem('studysync_user', JSON.stringify(res.data.user));
    return res.data.user;
  },

  async getProfile() {
    const res = await request('/auth?action=me');
    if (res.isBackend && res.data?.user) return res.data.user;
    throw new Error(res.error || 'Your session has expired. Please sign in again.');
  },

  hasSession() {
    return Boolean(localStorage.getItem('studysync_token'));
  },

  async logout() {
    const token = localStorage.getItem('studysync_token');
    try {
      if (token) {
        const response = await fetch(`${API_BASE}/auth?action=logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: '{}',
          keepalive: true
        });
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.warn('Unable to revoke the StudySync server session:', error.message);
    } finally {
      localStorage.removeItem('studysync_token');
      localStorage.removeItem('studysync_user');
    }
  },

  async updateProfile(profileData) {
    const res = await request('/auth?action=profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
    if (res.isBackend && res.data?.user) return res.data.user;
    const local = getLocalStore();
    local.user = { ...local.user, ...profileData };
    saveLocalStore(local);
    return local.user;
  },

  // Dashboard consolidated data
  async getDashboard() {
    const res = await request('/dashboard');
    if (res.isBackend && res.data) return { ...res.data, isBackend: true };

    // Construct local consolidated dashboard
    const local = getLocalStore();
    const tasks = local.tasks;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    let todayClasses = local.timetable.filter(tt => tt.day_of_week === currentDay);
    if (todayClasses.length === 0) {
      todayClasses = local.timetable.filter(tt => tt.day_of_week === 'Monday');
    }

    return {
      greeting: `Good day, ${local.user.name}! Let's focus.`,
      student: local.user,
      date: {
        formatted: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        day_name: currentDay,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      progress: {
        total_tasks: total,
        completed_tasks: completed,
        pending_tasks: total - completed,
        completion_percentage: pct
      },
      focus: {
        today_minutes: local.pomodoro.today_minutes,
        today_sessions: local.pomodoro.today_sessions,
        daily_goal_minutes: local.user.daily_goal_minutes || 120,
        streak_days: local.pomodoro.streak_days || 3
      },
      priority_tasks: tasks.slice(0, 6),
      today_classes: todayClasses,
      upcoming_schedule: [
        ...local.exams.map(e => ({ id: e.id, title: e.title, due_date: e.exam_date, due_time: e.start_time, item_type: 'exam', subject_name: e.subject_name, subject_color: e.subject_color, location: e.venue })),
        ...tasks.filter(t => t.status !== 'Completed').map(t => ({ id: t.id, title: t.title, due_date: t.due_date, due_time: t.due_time, item_type: 'task', subject_name: t.subject_name, subject_color: t.subject_color, location: t.priority }))
      ],
      notifications: local.notifications,
      isBackend: false
    };
  },

  // Subjects
  async getSubjects() {
    const res = await request('/subjects');
    if (res.isBackend && res.data) return res.data;
    return getLocalStore().subjects;
  },

  async createSubject(subject) {
    const res = await request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject)
    });
    if (res.error?.includes('HTTP 409')) {
      throw new Error('You already added this subject.');
    }
    if (res.isBackend && res.data) return res.data;
    const local = getLocalStore();
    const newSub = { ...subject, id: Date.now(), total_tasks: 0, completed_tasks: 0, progress_pct: 0 };
    local.subjects.push(newSub);
    saveLocalStore(local);
    return newSub;
  },

  async updateSubject(subject) {
    const res = await request('/subjects', {
      method: 'PUT',
      body: JSON.stringify(subject)
    });
    if (res.error?.includes('HTTP 409')) {
      throw new Error('You already added this subject.');
    }
    if (res.isBackend && res.data) return res.data;
    const local = getLocalStore();
    const index = local.subjects.findIndex(item => String(item.id) === String(subject.id));
    if (index === -1) return subject;
    local.subjects[index] = { ...local.subjects[index], ...subject };
    saveLocalStore(local);
    return local.subjects[index];
  },

  async deleteSubject(id) {
    const res = await request(`/subjects?id=${id}`, { method: 'DELETE' });
    if (res.isBackend) return res.data;
    const local = getLocalStore();
    local.subjects = local.subjects.filter(s => s.id !== id);
    saveLocalStore(local);
    return { deleted_id: id };
  },

  // Tasks
  async getTasks(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await request(`/tasks${query ? '?' + query : ''}`);
    if (res.isBackend && res.data) return res.data;

    let tasks = getLocalStore().tasks;
    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter(t => t.priority === filters.priority);
    if (filters.subject_id) tasks = tasks.filter(t => String(t.subject_id) === String(filters.subject_id));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }
    return tasks;
  },

  async createTask(task) {
    const res = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const subject = local.subjects.find(s => String(s.id) === String(task.subject_id));
    const newTask = {
      ...task,
      id: Date.now(),
      status: task.status || 'Pending',
      subject_name: subject ? subject.name : 'General',
      subject_color: subject ? subject.color : '#52796F'
    };
    local.tasks.unshift(newTask);
    saveLocalStore(local);
    return newTask;
  },

  async updateTask(task) {
    const res = await request('/tasks', {
      method: 'PUT',
      body: JSON.stringify(task)
    });
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const subject = local.subjects.find(s => String(s.id) === String(task.subject_id));
    const idx = local.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      local.tasks[idx] = {
        ...local.tasks[idx],
        ...task,
        subject_name: subject ? subject.name : local.tasks[idx].subject_name,
        subject_color: subject ? subject.color : local.tasks[idx].subject_color
      };
      saveLocalStore(local);
      return local.tasks[idx];
    }
    return task;
  },

  async toggleTask(id) {
    const res = await request(`/tasks?action=toggle&id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const idx = local.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const current = local.tasks[idx];
      const isCompleted = current.status === 'Completed';
      current.status = isCompleted ? 'Pending' : 'Completed';
      current.completed_at = isCompleted ? null : new Date().toISOString();
      saveLocalStore(local);
      return current;
    }
    return null;
  },

  async deleteTask(id) {
    const res = await request(`/tasks?id=${id}`, { method: 'DELETE' });
    if (res.isBackend) return res.data;

    const local = getLocalStore();
    local.tasks = local.tasks.filter(t => t.id !== id);
    saveLocalStore(local);
    return { deleted_id: id };
  },

  // Timetable
  async getTimetable(day = '') {
    const res = await request(`/timetable${day ? '?day=' + day : ''}`);
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const list = day ? local.timetable.filter(tt => tt.day_of_week === day) : local.timetable;
    const grouped = {};
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(d => {
      grouped[d] = local.timetable.filter(tt => tt.day_of_week === d);
    });
    return { list, by_day: grouped, current_day: 'Monday' };
  },

  async createTimetableSlot(slot) {
    const res = await request('/timetable', {
      method: 'POST',
      body: JSON.stringify(slot)
    });
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const subject = local.subjects.find(s => String(s.id) === String(slot.subject_id));
    const newSlot = {
      ...slot,
      id: Date.now(),
      subject_name: subject ? subject.name : '',
      subject_color: subject ? subject.color : '#52796F',
      instructor: subject ? subject.instructor : ''
    };
    local.timetable.push(newSlot);
    saveLocalStore(local);
    return newSlot;
  },

  async deleteTimetableSlot(id) {
    const res = await request(`/timetable?id=${id}`, { method: 'DELETE' });
    if (res.isBackend) return res.data;

    const local = getLocalStore();
    local.timetable = local.timetable.filter(tt => tt.id !== id);
    saveLocalStore(local);
    return { deleted_id: id };
  },

  // Pomodoro
  async getPomodoro() {
    const res = await request('/pomodoro');
    if (res.isBackend && res.data) return res.data;
    return getLocalStore().pomodoro;
  },

  async logPomodoroSession(session) {
    const res = await request('/pomodoro', {
      method: 'POST',
      body: JSON.stringify(session)
    });
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const subject = local.subjects.find(s => String(s.id) === String(session.subject_id));
    const newSession = {
      ...session,
      id: Date.now(),
      subject_name: subject ? subject.name : 'Study Session',
      subject_color: subject ? subject.color : '#52796F',
      completed_at: new Date().toISOString()
    };
    if (!local.pomodoro.recent_sessions) local.pomodoro.recent_sessions = [];
    local.pomodoro.recent_sessions.unshift(newSession);
    if (session.session_type === 'Focus') {
      local.pomodoro.today_sessions = (local.pomodoro.today_sessions || 0) + 1;
      local.pomodoro.today_minutes = (local.pomodoro.today_minutes || 0) + session.duration_minutes;
    }
    saveLocalStore(local);
    return newSession;
  },

  // Resources
  async getResources(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/resources${query ? '?' + query : ''}`);
    if (res.isBackend && res.data) return res.data;

    let list = getLocalStore().resources;
    if (params.category && params.category !== 'All') {
      list = list.filter(r => r.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
    }
    return list;
  },

  async createResource(resource) {
    const res = await request('/resources', {
      method: 'POST',
      body: JSON.stringify(resource)
    });
    if (res.isBackend && res.data) return res.data;

    const local = getLocalStore();
    const subject = local.subjects.find(s => String(s.id) === String(resource.subject_id));
    const newRes = {
      ...resource,
      id: Date.now(),
      subject_name: subject ? subject.name : '',
      subject_color: subject ? subject.color : '#52796F'
    };
    local.resources.unshift(newRes);
    saveLocalStore(local);
    return newRes;
  },

  async deleteResource(id) {
    const res = await request(`/resources?id=${id}`, { method: 'DELETE' });
    if (res.isBackend) return res.data;

    const local = getLocalStore();
    local.resources = local.resources.filter(r => r.id !== id);
    saveLocalStore(local);
    return { deleted_id: id };
  },

};
