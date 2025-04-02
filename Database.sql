-- Xóa và tạo lại cơ sở dữ liệu
DROP DATABASE IF EXISTS project_management;
CREATE DATABASE project_management;
USE project_management;

-- Start creating Admin user
DROP USER IF EXISTS 'admin'@'localhost';
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON project_management.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'admin'@'localhost';
-- End creating Admin user

-- Xóa và tạo lại bảng `users`
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20),
  role ENUM('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'),
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Xóa và tạo lại bảng `projects`
DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  start_date DATETIME,
  due_date DATETIME,
  status ENUM('IN_PROGRESS', 'NOT_STARTED', 'ON_HOLD', 'COMPLETED', 'OVER_DUE'),
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  manager_id INT,
  FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Xóa và tạo lại bảng `tasks`
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  start_date DATETIME,
  due_date DATETIME,
  status ENUM('COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'OVER_DUE', 'ON_HOLD'),
  priority ENUM('HIGH', 'MEDIUM', 'LOW'),
  project_id INT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Xóa và tạo lại bảng `subtasks`
DROP TABLE IF EXISTS subtasks;
CREATE TABLE subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  task_id INT,
  assignee_id INT,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Xóa và tạo lại bảng `comments`
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT,
  author_id INT,
  task_id INT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Xóa và tạo lại bảng `project_users`
DROP TABLE IF EXISTS project_users;
CREATE TABLE project_users (
  project_id INT,
  user_id INT,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tạo bảng `tags`
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(20)
);

-- Tạo bảng `project_tags`
CREATE TABLE project_tags (
  project_id INT,
  tag_id INT,
  PRIMARY KEY (project_id, tag_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Chèn dữ liệu vào bảng `users`
INSERT INTO users (full_name, email, phone_number, role)
VALUES
  ('Admin User', 'admin@example.com', '1234567890', 'ROLE_ADMIN'),
  ('Manager 1', 'manager1@example.com', '1234567891', 'ROLE_MANAGER'),
  ('Manager 2', 'manager2@example.com', '1234567892', 'ROLE_MANAGER'),
  ('User 1', 'user1@example.com', '1234567893', 'ROLE_USER'),
  ('User 2', 'user2@example.com', '1234567894', 'ROLE_USER'),
  ('User 3', 'user3@example.com', '1234567895', 'ROLE_USER'),
  ('User 4', 'user4@example.com', '1234567896', 'ROLE_USER'),
  ('User 5', 'user5@example.com', '1234567897', 'ROLE_USER'),
  ('User 6', 'user6@example.com', '1234567898', 'ROLE_USER'),
  ('User 7', 'user7@example.com', '1234567899', 'ROLE_USER');

-- Chèn dữ liệu vào bảng `projects`
INSERT INTO projects (name, description, start_date, due_date, status, manager_id)
VALUES
  ('Project 1', 'Description of Project 1', '2025-01-01 10:00:00', '2025-01-10 10:00:00', 'IN_PROGRESS', 2),
  ('Project 2', 'Description of Project 2', '2025-02-01 10:00:00', '2025-02-10 10:00:00', 'NOT_STARTED', 3),
  ('Project 3', 'Description of Project 3', '2025-03-01 10:00:00', '2025-03-10 10:00:00', 'ON_HOLD', 2),
  ('Project 4', 'Description of Project 4', '2025-04-01 10:00:00', '2025-04-10 10:00:00', 'COMPLETED', 3),
  ('Project 5', 'Description of Project 5', '2025-05-01 10:00:00', '2025-05-10 10:00:00', 'OVER_DUE', 3),
  ('Project 6', 'Description of Project 6', '2025-06-01 10:00:00', '2025-06-10 10:00:00', 'IN_PROGRESS', 2),
  ('Project 7', 'Description of Project 7', '2025-07-01 10:00:00', '2025-07-10 10:00:00', 'IN_PROGRESS', 3),
  ('Project 8', 'Description of Project 8', '2025-08-01 10:00:00', '2025-08-10 10:00:00', 'NOT_STARTED', 2),
  ('Project 9', 'Description of Project 9', '2025-09-01 10:00:00', '2025-09-10 10:00:00', 'COMPLETED', 3),
  ('Project 10', 'Description of Project 10', '2025-10-01 10:00:00', '2025-10-10 10:00:00', 'ON_HOLD', 2);

-- Chèn dữ liệu vào bảng `tasks`
INSERT INTO tasks (name, description, start_date, due_date, status, priority, project_id)
VALUES
  ('Task 1', 'Task description 1', '2025-01-01 10:00:00', '2025-01-02 10:00:00', 'IN_PROGRESS', 'HIGH', 2),
  ('Task 2', 'Task description 2', '2025-02-01 10:00:00', '2025-02-02 10:00:00', 'NOT_STARTED', 'MEDIUM', 2),
  ('Task 3', 'Task description 3', '2025-03-01 10:00:00', '2025-03-02 10:00:00', 'COMPLETED', 'LOW', 3),
  ('Task 4', 'Task description 4', '2025-04-01 10:00:00', '2025-04-02 10:00:00', 'OVER_DUE', 'HIGH', 4),
  ('Task 5', 'Task description 5', '2025-05-01 10:00:00', '2025-05-02 10:00:00', 'IN_PROGRESS', 'MEDIUM', 5),
  ('Task 6', 'Task description 6', '2025-06-01 10:00:00', '2025-06-02 10:00:00', 'IN_PROGRESS', 'LOW', 6),
  ('Task 7', 'Task description 7', '2025-07-01 10:00:00', '2025-07-02 10:00:00', 'NOT_STARTED', 'HIGH', 7),
  ('Task 8', 'Task description 8', '2025-08-01 10:00:00', '2025-08-02 10:00:00', 'COMPLETED', 'MEDIUM', 8),
  ('Task 9', 'Task description 9', '2025-09-01 10:00:00', '2025-09-02 10:00:00', 'IN_PROGRESS', 'HIGH', 9),
  ('Task 10', 'Task description 10', '2025-10-01 10:00:00', '2025-10-02 10:00:00', 'ON_HOLD', 'LOW', 10);

-- Chèn dữ liệu vào bảng `subtasks`
INSERT INTO subtasks (name, task_id, completed, assignee_id)
VALUES
  ('Subtask 1', 1, TRUE, 4),
  ('Subtask 2', 2, FALSE, 5),
  ('Subtask 3', 3, TRUE, 6),
  ('Subtask 4', 4, FALSE, 7),
  ('Subtask 5', 5, TRUE, 8),
  ('Subtask 6', 6, TRUE, 9),
  ('Subtask 7', 7, FALSE, 10),
  ('Subtask 8', 8, TRUE, 4),
  ('Subtask 9', 9, FALSE, 5),
  ('Subtask 10', 10, TRUE, 6);

-- Chèn dữ liệu vào bảng `comments`
INSERT INTO comments (text, author_id, task_id)
VALUES
  ('Comment for Task 1', 1, 1),
  ('Comment for Task 2', 2, 2),
  ('Comment for Task 3', 3, 3),
  ('Comment for Task 4', 4, 4),
  ('Comment for Task 5', 5, 5),
  ('Comment for Task 6', 6, 6),
  ('Comment for Task 7', 7, 7),
  ('Comment for Task 8', 8, 8),
  ('Comment for Task 9', 9, 9),
  ('Comment for Task 10', 10, 10);

-- Chèn dữ liệu vào bảng `project_users`
INSERT INTO project_users (project_id, user_id)
VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (2, 4),
  (3, 5),
  (3, 6),
  (4, 7),
  (4, 8),
  (5, 9),
  (5, 10);

-- Chèn dữ liệu vào bảng `tags`
INSERT INTO tags (name, color) VALUES
  ('Development', '#3B82F6'),
  ('Research', '#8B5CF6'),
  ('Design', '#EC4899'),
  ('Marketing', '#F59E0B'),
  ('Testing', '#10B981'),
  ('Documentation', '#6B7280');

-- Chèn dữ liệu vào bảng `project_tags`
INSERT INTO project_tags (project_id, tag_id) VALUES
  (1, 1),  -- Project 1 với Tag 1 (Development)
  (1, 2),  -- Project 1 với Tag 2 (Research)
  (2, 3),  -- Project 2 với Tag 3 (Design)
  (2, 4),  -- Project 2 với Tag 4 (Marketing)
  (3, 5),  -- Project 3 với Tag 5 (Testing)
  (4, 6);  -- Project 4 với Tag 6 (Documentation)
