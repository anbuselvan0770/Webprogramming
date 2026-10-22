-- StudySync Database Schema
CREATE DATABASE IF NOT EXISTS `studysync_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `studysync_db`;

-- Drop existing tables in reverse dependency order if resetting
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `pomodoro_sessions`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `timetable`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `course` VARCHAR(100) DEFAULT 'B.Tech Computer Science & Engineering',
    `year_of_study` VARCHAR(50) DEFAULT '3rd Year (Sem 6)',
    `department` VARCHAR(100) DEFAULT 'School of Computing',
    `avatar_url` VARCHAR(255) DEFAULT '',
    `theme_preference` VARCHAR(30) DEFAULT 'cosmic-amethyst',
    `daily_goal_minutes` INT DEFAULT 120,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Login Sessions
CREATE TABLE `user_sessions` (
   `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
   `user_id` INT NOT NULL,
   `token_hash` CHAR(64) NOT NULL UNIQUE,
   `expires_at` DATETIME NOT NULL,
   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   INDEX `idx_user_sessions_user` (`user_id`),
   CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Subjects Table
CREATE TABLE `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(30) DEFAULT '',
    `color` VARCHAR(30) DEFAULT '#52796F',
    `instructor` VARCHAR(100) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_subjects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tasks Table
CREATE TABLE `tasks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subject_id` INT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `priority` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    `due_date` DATE NOT NULL,
    `due_time` TIME DEFAULT '23:59:00',
    `status` ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    `completed_at` DATETIME NULL,
    `estimated_minutes` INT DEFAULT 30,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tasks_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Timetable Table
CREATE TABLE `timetable` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subject_id` INT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `room` VARCHAR(50) DEFAULT '',
    `type` ENUM('Lecture', 'Lab', 'Tutorial', 'Seminar') DEFAULT 'Lecture',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_timetable_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_timetable_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Pomodoro Sessions Table
CREATE TABLE `pomodoro_sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subject_id` INT NULL,
    `task_id` INT NULL,
    `duration_minutes` INT NOT NULL,
    `session_type` ENUM('Focus', 'Short Break', 'Long Break') DEFAULT 'Focus',
    `notes` VARCHAR(255) NULL,
    `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pomodoro_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pomodoro_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_pomodoro_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Resource Vault Table
CREATE TABLE `resources` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subject_id` INT NULL,
    `title` VARCHAR(200) NOT NULL,
    `category` ENUM('Notes', 'PDF Document', 'YouTube Link', 'Website', 'Reference Book') DEFAULT 'Notes',
    `url` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_resources_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_resources_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Exams & Deadlines Table
CREATE TABLE `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subject_id` INT NULL,
    `title` VARCHAR(200) NOT NULL,
    `exam_date` DATE NOT NULL,
    `start_time` TIME NULL,
    `venue` VARCHAR(100) DEFAULT '',
    `syllabus` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_exams_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_exams_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notifications Table
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('deadline', 'class', 'pomodoro', 'system') DEFAULT 'system',
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Keep a demo profile for local testing, but do not pre-create a student's study plan.
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `course`, `year_of_study`, `department`, `daily_goal_minutes`, `theme_preference`)
VALUES (1, 'Abinash S', 'abinash@student.sync', '$2y$10$jj4WliGX74pPmwvgHBPA3.ZRVuxu8W3Qp3pK.v85XZKD.SeSAplrO', 'B.Tech Computer Science & Engg', '3rd Year (Sem 6)', 'School of Computing', 150, 'cosmic-amethyst');

/*
The optional college demo subjects/tasks/timetable/resources/exams are intentionally
not seeded. Students add their own subjects and build a study plan from scratch.
INSERT INTO `subjects` (`id`, `user_id`, `name`, `code`, `color`, `instructor`) VALUES
(1, 1, 'Web Programming', 'CS401', '#52796F', 'Dr. Rajesh Kumar'),
(2, 1, 'Database Management Systems', 'CS402', '#3B82F6', 'Prof. Ananya Sen'),
(3, 1, 'Discrete Mathematics', 'MA301', '#8B5CF6', 'Dr. S. Ramanujam'),
(4, 1, 'Java & Object Oriented Design', 'CS403', '#F59E0B', 'Prof. Karthikeyan'),
(5, 1, 'Computer Networks', 'CS404', '#10B981', 'Dr. Meenakshi S');

INSERT INTO `tasks` (`id`, `user_id`, `subject_id`, `title`, `description`, `priority`, `due_date`, `due_time`, `status`, `completed_at`, `estimated_minutes`) VALUES
(1, 1, 1, 'Complete React Assignment', 'Build responsive components, custom hooks, and route integration.', 'High', CURDATE() + INTERVAL 2 DAY, '23:59:00', 'In Progress', NULL, 60),
(2, 1, 2, 'DBMS Preparation - Relational Calculus & SQL', 'Practice nested queries, joins, and normal form decompositions.', 'High', CURDATE() + INTERVAL 1 DAY, '18:00:00', 'Pending', NULL, 90),
(3, 1, 3, 'Mathematics Assignment - Graph Theory & Trees', 'Solve problem sheet 4 on planar graphs and Dijkstra minimum spanning trees.', 'High', CURDATE() - INTERVAL 1 DAY, '17:00:00', 'Completed', NOW(), 45),
(4, 1, 4, 'Java OOP Lab - Multithreading & Producer Consumer', 'Implement bounded buffer synchronisation with thread pools.', 'Medium', CURDATE() + INTERVAL 3 DAY, '20:00:00', 'Pending', NULL, 60),
(5, 1, 5, 'Network Layer Packet Routing Simulation', 'Simulate distance vector and link-state routing algorithms in Python/Java.', 'Medium', CURDATE() + INTERVAL 5 DAY, '23:59:00', 'Pending', NULL, 75),
(6, 1, 1, 'Review CSS Grid & Flexbox layouts', 'Read modern responsive design best practices for viva exam.', 'Low', CURDATE() + INTERVAL 4 DAY, '15:00:00', 'Pending', NULL, 30);

-- Timetable entries
INSERT INTO `timetable` (`user_id`, `subject_id`, `day_of_week`, `start_time`, `end_time`, `room`, `type`) VALUES
(1, 1, 'Monday', '09:00:00', '10:00:00', 'LH-301', 'Lecture'),
(1, 2, 'Monday', '10:00:00', '11:00:00', 'LH-204', 'Lecture'),
(1, 3, 'Monday', '11:15:00', '12:15:00', 'LH-102', 'Lecture'),
(1, 4, 'Monday', '14:00:00', '16:00:00', 'CS Lab 2', 'Lab'),

(1, 5, 'Tuesday', '09:30:00', '10:30:00', 'LH-301', 'Lecture'),
(1, 1, 'Tuesday', '11:00:00', '12:30:00', 'Web Lab 1', 'Lab'),
(1, 3, 'Tuesday', '14:00:00', '15:00:00', 'LH-102', 'Tutorial'),

(1, 2, 'Wednesday', '09:00:00', '10:00:00', 'LH-204', 'Lecture'),
(1, 4, 'Wednesday', '10:15:00', '11:15:00', 'LH-302', 'Lecture'),
(1, 5, 'Wednesday', '14:00:00', '15:30:00', 'Network Lab', 'Lab'),

(1, 1, 'Thursday', '10:00:00', '11:00:00', 'LH-301', 'Lecture'),
(1, 3, 'Thursday', '11:15:00', '12:15:00', 'LH-102', 'Lecture'),
(1, 2, 'Thursday', '14:00:00', '15:30:00', 'Database Lab', 'Lab'),

(1, 4, 'Friday', '09:00:00', '10:00:00', 'LH-302', 'Lecture'),
(1, 5, 'Friday', '10:15:00', '11:15:00', 'LH-102', 'Lecture'),
(1, 1, 'Friday', '14:00:00', '15:00:00', 'Seminar Hall', 'Seminar');

-- Pomodoro Sessions (today & past days)
INSERT INTO `pomodoro_sessions` (`user_id`, `subject_id`, `task_id`, `duration_minutes`, `session_type`, `notes`, `completed_at`) VALUES
(1, 1, 1, 25, 'Focus', 'Built task filtering and tag components', NOW() - INTERVAL 4 HOUR),
(1, 1, 1, 5, 'Short Break', 'Stretching and hydration', NOW() - INTERVAL 3 HOUR),
(1, 2, 2, 25, 'Focus', 'Solved 3 B+ Tree index problems', NOW() - INTERVAL 2 HOUR),
(1, 3, 3, 25, 'Focus', 'Completed Graph theory assignment sheet', NOW() - INTERVAL 1 HOUR);

-- Resource Vault
INSERT INTO `resources` (`user_id`, `subject_id`, `title`, `category`, `url`, `description`) VALUES
(1, 1, 'React 19 Official Documentation & Guides', 'Website', 'https://react.dev', 'Core documentation covering Hooks, State Management, and Suspense.'),
(1, 1, 'Full Stack Web Architecture Tutorial', 'YouTube Link', 'https://youtube.com', 'Comprehensive walkthrough of REST API design and React component patterns.'),
(1, 2, 'Database System Concepts (Silberschatz) Handouts', 'PDF Document', 'https://www.db-book.com', 'Chapter 7 & 8 reference notes on Relational Normalisation (BCNF & 3NF).'),
(1, 3, 'Discrete Math & Combinatorics Lecture Notes', 'Notes', '', 'Prof. Ramanujams quick summary of Euler graphs, Hamiltonian circuits, and vertex coloring.'),
(1, 4, 'Java Concurrency in Practice & Thread Pools', 'Reference Book', 'https://docs.oracle.com/javase/tutorial/', 'Reference guide on ExecutorService, ReentrantLock, and synchronized collections.');

-- Exams
INSERT INTO `exams` (`user_id`, `subject_id`, `title`, `exam_date`, `start_time`, `venue`, `syllabus`) VALUES
(1, 2, 'DBMS Mid-Term Assessment', CURDATE() + INTERVAL 14 DAY, '10:00:00', 'Exam Hall A', 'Units 1-3: ER Diagrams, Relational Algebra, SQL, Normal Forms 1NF to BCNF'),
(1, 1, 'Web Programming Lab Exam & Viva', CURDATE() + INTERVAL 20 DAY, '14:00:00', 'Software Lab 3', 'HTML5, CSS3 Grid, JavaScript ES6+, React Components & State, PHP REST API integration'),
(1, 3, 'Discrete Mathematics Quiz 2', CURDATE() + INTERVAL 8 DAY, '11:15:00', 'Room 204', 'Graph theory, trees, Eulerian paths, Boolean algebra');

-- Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, '⚠️ Assignment Deadline Approaching', 'DBMS Preparation - Relational Calculus & SQL is due tomorrow at 06:00 PM.', 'deadline', FALSE, NOW() - INTERVAL 20 MINUTE),
(1, '📚 Class in 30 Minutes', 'Web Programming (LH-301) begins shortly.', 'class', FALSE, NOW() - INTERVAL 15 MINUTE),
(1, '🔥 Great Focus Today!', 'You achieved 3 Pomodoro focus sessions (75 minutes) today.', 'pomodoro', TRUE, NOW() - INTERVAL 1 HOUR);
*/
