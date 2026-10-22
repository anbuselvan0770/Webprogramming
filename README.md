# 🎓 StudySync – Personalized Student Study Planner

A modern, responsive, and full-stack web application designed for high school and university students to organize academic tasks, maintain class timetables, track study progress, focus with a built-in Pomodoro timer, and save academic resources.

Built with **React 19**, **PHP 8.3 REST API**, and **MySQL 8.0 Database**.

---

## 📌 1. Problem Statement & Proposed Solution

### The Problem:
Students juggle multiple subjects, assignments, exams, and class schedules across separate tools (notebooks, calendars, reminder apps, and timers). This causes:
- Missed assignment deadlines
- Poorly organized daily study schedules
- Difficulty prioritizing urgent vs low-importance coursework
- Lack of clarity on completion rates
- Focus loss during self-study sessions
- Fragmented lecture notes, YouTube tutorials, and reference links

### The StudySync Solution:
StudySync provides a calm, centralized dashboard that answers three critical questions for students at a glance:
1. **What do I need to do today?**
2. **How much have I completed?**
3. **What should I focus on right now?**

---

## 🏗️ 2. System Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │             StudySync React Frontend (Vite)             │
   │  (Port 5173 - Plus Jakarta Sans, Dark Plum / Violet)    │
   └────────────────────────────┬────────────────────────────┘
                                │
                      REST API  │  JSON Requests
                      (Proxy)   │
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                  PHP 8.3 REST API Engine                │
   │           (Port 8001 - PDO MySQL, CORS, Router)         │
   └────────────────────────────┬────────────────────────────┘
                                │
                      InnoDB    │  Relational Queries
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    MySQL 8.0 Database                   │
   │           Database: studysync_db (8 Tables)             │
   └─────────────────────────────────────────────────────────┘
```

- **Frontend**:
  - React 19 + Vite (Fast compilation, modular components)
  - Vanilla CSS design tokens (dark plum surfaces with violet accents)
  - Lucide React (Crisp iconography)
  - Canvas Confetti (Celebratory visual upon completing all tasks)
  - Web Audio API Synthesizer (Pleasant study bell chime without external audio files)
  - Resilient Data Bridge (Seamless automatic sync with PHP/MySQL backend + offline fallback)

- **Backend**:
  - PHP 8.3 REST API
  - Clean modular endpoints (`/api/dashboard`, `/api/tasks`, `/api/subjects`, `/api/timetable`, `/api/pomodoro`, `/api/resources`, `/api/auth`)
  - PDO Prepared Statements (SQL Injection safe)
  - Automated schema and seed-data runner (`init_db.php`)

- **Database**:
  - MySQL 8.0 InnoDB engine (`studysync_db`)
  - Foreign keys with `ON DELETE CASCADE` and `ON DELETE SET NULL`
  - Normalized relational structure

---

## 🗄️ 3. Relational Database Schema (`studysync_db`)

The database consists of **9 normalized relational tables**:

1. **`users`**: Student credentials, course, department, year, daily study goal, theme.
2. **`user_sessions`**: Hashed, expiring login tokens that can be revoked on logout.
3. **`subjects`**: Subject name, code, custom color tag, and instructor.
4. **`tasks`**: Title, description, subject FK, priority, due date/time, status, estimated minutes.
5. **`timetable`**: Day of week, start/end time, subject FK, room/location, and session type.
6. **`pomodoro_sessions`**: User/subject/task FKs, duration, session type, notes, completed timestamp.
7. **`resources`**: Title, category, URL, subject FK, and description.
8. **`exams`**: Title, exam date/time, subject FK, venue, and syllabus.
9. **`notifications`**: Title, message, type, and read status.

---

## 🌟 4. Core Modules & Features

### 🏠 1. Dashboard (The Command Center)
- **Top Section (Side-by-side)**:
  - **Pomodoro Focus Timer Widget**: Large 25:00 countdown, Start/Pause/Reset, mode switcher (Focus 25m, Short Break 5m, Long Break 15m), subject tag selector.
  - **Today's Progress Widget**: SVG animated circular gauge showing task completion percentage (e.g. 72%), completed vs pending counts, and daily study goal bar.
- **Second Section (Side-by-side)**:
  - **Priority Tasks List**: Filtered high-priority tasks with interactive checkboxes, subject color tags, due date indicators, and edit/delete actions.
  - **Upcoming Schedule**: Shows today's classes with room numbers and instructors, plus upcoming deadlines and exam reminders.

### ✅ 2. Task Management
- Full CRUD operations (Create, Read, Update, Delete)
- Filter by Status (**All**, **Pending**, **Completed**)
- Filter by **Subject** and **Priority** (High, Medium, Low)
- Search filter & sorting (by earliest due date, priority, or title)
- Confetti celebration burst upon task completion!

### 📅 3. Timetable & Class Schedule
- Daily tabs (**Mon**, **Tue**, **Wed**, **Thu**, **Fri**, **Sat**, **Sun**)
- Weekly Overview Grid matrix
- Real-time indicator for **TODAY**
- Displays Session Type pills (*Lecture*, *Lab*, *Tutorial*, *Seminar*), room location, and faculty name
- Add/Edit class schedule modal

### ⏱️ 4. Focus Room (Dedicated Pomodoro)
- Distraction-free full-screen study experience
- Large digital countdown (`MM:SS`)
- Customizable timer intervals (Focus, Short Break, Long Break)
- Web Audio synthesizer bell
- Automatic session logger that saves completed study time to MySQL
- Focus streak counter & daily study minutes tracker

### 📚 5. Resource Vault
- Organized categories: **Lecture Notes**, **PDF Documents**, **YouTube Tutorials**, **Websites**, **Reference Books**
- Filter by Subject and search by keyword
- Direct clickable external links (`Open Link`)
- Notes and description storage

### 📊 6. Progress & Academic Analytics
- High-level KPIs: Overall Completion Rate %, Today's Study Hours, Active Study Streak, Total Focus Sessions
- Subject-wise syllabus completion progress bars
- 7-Day study hours distribution chart
- Academic consistency insights

### ⚙️ 7. Profile & Settings
- Student identity editor (Name, Course, Department, Year, Daily Target)
- Visual Theme Accent switcher:
  - **Dark Plum / Violet** (dashboard-inspired default)
  - **Calm Ocean Blue** (Academic focus)
  - **Slate Minimal** (Monochrome clean)
- Live backend connection status checker
- One-click JSON data export backup

---

## 🚀 5. How to Run the Project

### Start everything with one command (Windows)
Open PowerShell in the project folder and run:
``` 
.\start-studysync.bat
```
The launcher starts the PHP API and React frontend, waits for both to be ready, and opens the application in your browser. Use **http://127.0.0.1:5173** as the single link for the entire app; frontend API requests are proxied to PHP automatically. MySQL must be running.

To try the preloaded local account, sign in with `abinash@student.sync` and password `student123`, or create a new student account from the sign-in screen.

---

## 🎓 6. College Viva Q&A Guide

When presenting this project during a lab viva or project review, here are common questions and ideal answers:

### Q1: Why did you choose React for the frontend and PHP for the backend?
> **Answer**: React enables a modern, responsive Single Page Application (SPA) architecture with fast reactive state updates (e.g. clicking a task checkbox instantly updates the circular progress gauge without page reloads). PHP with PDO provides a lightweight, standard RESTful JSON API layer that communicates directly with MySQL without heavy server requirements.

### Q2: How is data synchronized between React and the backend?
> **Answer**: The frontend uses an asynchronous API service layer (`frontend/src/services/api.js`). It makes `fetch` requests with JSON payloads to PHP endpoints. Additionally, StudySync incorporates a dual resilience engine: if the backend server is temporarily unreachable, it seamlessly falls back to a local storage store so the student's workflow is never interrupted.

### Q3: How do you prevent SQL Injection in your PHP code?
> **Answer**: All database interactions use PHP Data Objects (PDO) with prepared statements and parameter binding (`$stmt->prepare(...)` and `$stmt->execute([...])`). User input is never concatenated directly into raw SQL strings.

### Q4: How is the progress percentage calculated?
> **Answer**: In both `dashboard.php` and the frontend state:
> `Progress % = (Completed Tasks / Total Tasks) * 100` rounded to the nearest whole integer. When tasks are added or toggled, this is recalculated reactively.

### Q5: How does the Pomodoro timer function without external sound dependencies?
> **Answer**: The timer utilizes the browser's native **Web Audio API** (`AudioContext`). It synthesizes a pure sine-wave two-tone chime (587.33 Hz to 880 Hz) using an oscillator node and exponential gain decay. This eliminates reliance on external audio files that could fail to load.

---

## 📁 7. Project Folder Structure

```
Student Sync/
├── backend/
│   ├── config/
│   │   ├── cors.php          # CORS headers and API response helpers
│   │   └── db.php            # MySQL PDO connection & authentication helpers
│   ├── api/
│   │   ├── auth.php          # User registration, login, and profile update
│   │   ├── dashboard.php     # Consolidated dashboard metrics endpoint
│   │   ├── exams.php         # Exam scheduling & deadlines
│   │   ├── notifications.php # Reminder notifications
│   │   ├── pomodoro.php      # Pomodoro logging and session history
│   │   ├── resources.php     # Resource Vault CRUD
│   │   ├── subjects.php      # Subjects CRUD with progress counts
│   │   ├── tasks.php         # Task CRUD and toggle endpoint
│   │   └── timetable.php     # Class schedule endpoints
│   ├── schema.sql            # MySQL schema with a clean starter study plan
│   ├── init_db.php           # Automated database initialization runner
│   └── router.php            # PHP built-in web server router
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddEditClassModal.jsx
│   │   │   ├── AddEditResourceModal.jsx
│   │   │   ├── AddEditTaskModal.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── PomodoroWidget.jsx
│   │   │   ├── PriorityTaskList.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TodayProgressWidget.jsx
│   │   │   ├── TopHeader.jsx
│   │   │   └── UpcomingScheduleWidget.jsx
│   │   ├── pages/
│   │   │   ├── DashboardView.jsx
│   │   │   ├── FocusView.jsx
│   │   │   ├── ProgressView.jsx
│   │   │   ├── ResourcesView.jsx
│   │   │   ├── SettingsView.jsx
│   │   │   ├── TasksView.jsx
│   │   │   └── TimetableView.jsx
│   │   ├── services/
│   │   │   └── api.js        # Universal API client with failover
│   │   ├── App.css           # Custom design system & responsive CSS
│   │   ├── App.jsx           # Master application component
│   │   ├── index.css         # Design tokens & CSS variables
│   │   └── main.jsx
│   ├── index.html            # HTML shell with Google Fonts
│   ├── package.json
│   └── vite.config.js        # Vite config with API proxy
│
├── start-studysync.bat       # 1-click launcher for Windows
└── README.md                 # Complete documentation & viva guide
```

---
Developed for **Web Programming Coursework & Project Presentation**.
