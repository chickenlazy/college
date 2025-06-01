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
  department VARCHAR(255), 
  address VARCHAR(255),  
  position VARCHAR(255),   
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD COLUMN reset_code VARCHAR(6),
ADD COLUMN reset_code_expiry DATETIME;

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
  manager_id INT
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
  created_by INT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Xóa và tạo lại bảng `subtasks`
DROP TABLE IF EXISTS subtasks;
CREATE TABLE subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  task_id INT,
  assignee_id INT,
  completed BOOLEAN DEFAULT FALSE,
  start_date DATETIME,
  due_date DATETIME,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Xóa và tạo lại bảng `project_users`
DROP TABLE IF EXISTS project_users;
CREATE TABLE project_users (
  project_id INT,
  user_id INT,
  PRIMARY KEY (project_id, user_id)
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
  PRIMARY KEY (project_id, tag_id)
);

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type ENUM('PROJECT', 'TASK', 'SUBTASK', 'COMMENT', 'SYSTEM', 'OTHER') NOT NULL,
  status ENUM('READ', 'UNREAD') NOT NULL DEFAULT 'UNREAD',
  reference_id INT,
  user_id INT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_date DATETIME
);

-- Tạo bảng comments có hỗ trợ trả lời comment
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  type ENUM('PROJECT', 'TASK', 'SUBTASK') NOT NULL,
  reference_id INT NOT NULL,
  user_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE project_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path VARCHAR(500) NOT NULL,
  description TEXT,
  project_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_project_files_project_id ON project_files(project_id);

CREATE TABLE task_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path VARCHAR(500) NOT NULL,
  description TEXT,
  task_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_task_files_task_id ON task_files(task_id);

-- Tạo bảng daily_goals
DROP TABLE IF EXISTS daily_goals;
CREATE TABLE daily_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('WORK', 'HEALTH', 'LEARNING', 'PERSONAL', 'FINANCE') NOT NULL DEFAULT 'WORK',
  priority ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
  estimated_time INT NOT NULL DEFAULT 30, -- Thời gian ước tính tính bằng phút
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), -- Tiến độ từ 0-100%
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  user_id INT NOT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME NOT NULL, -- Ngày hết hạn
  last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo các chỉ mục để tối ưu hóa truy vấn
CREATE INDEX idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX idx_daily_goals_due_date ON daily_goals(due_date);
CREATE INDEX idx_daily_goals_category ON daily_goals(category);
CREATE INDEX idx_daily_goals_completed ON daily_goals(completed);
CREATE INDEX idx_daily_goals_created_date ON daily_goals(created_date);

-- Cập nhật câu lệnh INSERT vào bảng `users`
INSERT INTO users (full_name, username, password, email, phone_number, role, department, address, position, status)
VALUES
  ('Nguyễn Như Nguyệt', 'admin', '$2a$10$TBPOarwlQr2QGSRIa/tw/OkSi9GR3ZvL0Hz5PtsxJFjGfZMpT43RO', 'admin@example.com', '0912345678', 'ROLE_ADMIN', 'IT', '123 Main St', 'Admin', 'ACTIVE'),
  ('Nguyễn Trường Giang', 'manager', '$2a$10$GzHGD/OYE8W4Matb5zQhdOmPDxXlpKbysPrdPqeM8DVKooU4ZGDUC', 'truonggiang290903@gmail.com', '0912345679', 'ROLE_MANAGER', 'Marketing', '456 Oak St', 'Project Manager', 'ACTIVE'),
  ('Lê Minh C', 'leminhc', 'password123', 'leminhc@example.com', '0912345680', 'ROLE_MANAGER', 'Sales', '789 Pine St', 'Project Manager', 'ACTIVE'),
  ('Nguyễn Văn Hải', 'user', '$2a$10$298AnQHr6/EqdDbFmBrz/eL9NLuPNIcWHtepGR/Ux0uOFDHZl7FAi', 'nguyenvanhai@example.com', '0912345681', 'ROLE_USER', 'HR', '101 Maple St', 'Staff', 'ACTIVE'),
  ('Vũ Văn E', 'vuvan', 'password123', 'vuvan@example.com', '0912345682', 'ROLE_USER', 'Finance', '102 Birch St', 'Accountant', 'ACTIVE'),
  ('Hoàng Thị F', 'hoangthif', 'password123', 'hoangthif@example.com', '0912345683', 'ROLE_USER', 'IT', '103 Cedar St', 'Developer', 'ACTIVE'),
  ('Đoàn Minh G', 'doanming', 'password123', 'doanming@example.com', '0912345684', 'ROLE_USER', 'Marketing', '104 Elm St', 'Designer', 'ACTIVE'),
  ('Nguyễn Thị H', 'nguyenh', 'password123', 'nguyenh@example.com', '0912345685', 'ROLE_USER', 'Operations', '105 Birch St', 'Coordinator', 'ACTIVE'),
  ('Trần Minh I', 'tranminhi', 'password123', 'tranminhi@example.com', '0912345686', 'ROLE_USER', 'Sales', '106 Oak St', 'Representative', 'ACTIVE'),
  ('Phạm Văn J', 'phamvanj', 'password123', 'phamvanj@example.com', '0912345687', 'ROLE_USER', 'IT', '107 Pine St', 'Technician', 'INACTIVE'),
  ('Lý Minh K', 'lyminhk', 'password123', 'lyminhk@example.com', '0912345688', 'ROLE_USER', 'HR', '108 Cedar St', 'Recruiter', 'ACTIVE'),
  ('Hồ Thi L', 'hothil', 'password123', 'hothil@example.com', '0912345689', 'ROLE_USER', 'Finance', '109 Elm St', 'Analyst', 'ACTIVE'),
  ('Tôn Thị M', 'tonthim', 'password123', 'tonthim@example.com', '0912345690', 'ROLE_MANAGER', 'Marketing', '110 Birch St', 'Project Manager', 'ACTIVE'),
  ('Ngô Minh N', 'ngominhn', 'password123', 'ngominhn@example.com', '0912345691', 'ROLE_USER', 'Operations', '111 Oak St', 'Administrator', 'INACTIVE'),
  ('Vũ Thi O', 'vuthio', 'password123', 'vuthio@example.com', '0912345692', 'ROLE_USER', 'Sales', '112 Pine St', 'Assistant', 'ACTIVE'),
  ('Mai Văn P', 'maivanp', 'password123', 'maivanp@example.com', '0912345693', 'ROLE_USER', 'Finance', '113 Cedar St', 'Controller', 'ACTIVE'),
  ('Phan Minh Q', 'phanminhq', 'password123', 'phanminhq@example.com', '0912345694', 'ROLE_MANAGER', 'HR', '114 Elm St', 'Project Manager', 'ACTIVE'),
  ('Đặng Thị R', 'dangthir', 'password123', 'dangthir@example.com', '0912345695', 'ROLE_USER', 'Marketing', '115 Birch St', 'Assistant', 'INACTIVE'),
  ('Bùi Minh S', 'buiminhs', 'password123', 'buiminhs@example.com', '0912345696', 'ROLE_USER', 'IT', '116 Oak St', 'Developer', 'ACTIVE');

-- Chèn dữ liệu vào bảng `projects` (manager_id phải là ROLE_MANAGER: 2, 3, 13, 17)
INSERT INTO projects (name, description, start_date, due_date, status, manager_id)
VALUES
  ('Hệ thống quản lý dự án', 'Phát triển hệ thống quản lý các dự án cho doanh nghiệp', '2025-01-01 09:00:00', '2025-03-01 17:00:00', 'IN_PROGRESS', 2),
  ('Ứng dụng di động', 'Phát triển ứng dụng di động cho khách hàng', '2025-01-15 09:00:00', '2025-04-15 17:00:00', 'NOT_STARTED', 3),
  ('Thiết kế website', 'Thiết kế giao diện cho trang web của công ty', '2025-02-01 09:00:00', '2025-05-01 17:00:00', 'ON_HOLD', 13),
  ('Phát triển phần mềm', 'Phát triển phần mềm quản lý doanh nghiệp', '2025-03-01 09:00:00', '2025-07-01 17:00:00', 'COMPLETED', 17),
  ('Cải tiến hệ thống', 'Cải tiến và nâng cấp hệ thống hiện tại', '2025-04-01 09:00:00', '2025-06-01 17:00:00', 'OVER_DUE', 2),
  ('Marketing trực tuyến', 'Chiến dịch marketing trực tuyến cho sản phẩm mới', '2025-05-01 09:00:00', '2025-07-01 17:00:00', 'IN_PROGRESS', 3),
  ('Nghiên cứu thị trường', 'Nghiên cứu thị trường cho sản phẩm mới', '2025-06-01 09:00:00', '2025-08-01 17:00:00', 'IN_PROGRESS', 13),
  ('Xây dựng chiến lược', 'Xây dựng chiến lược cho công ty trong năm tới', '2025-07-01 09:00:00', '2025-10-01 17:00:00', 'NOT_STARTED', 17),
  ('Chương trình đào tạo', 'Tổ chức chương trình đào tạo cho nhân viên mới', '2025-08-01 09:00:00', '2025-10-01 17:00:00', 'COMPLETED', 2),
  ('Hỗ trợ khách hàng', 'Hỗ trợ khách hàng cho sản phẩm mới ra mắt', '2025-09-01 09:00:00', '2025-11-01 17:00:00', 'ON_HOLD', 3);

-- Chèn dữ liệu vào bảng `tasks` (created_by phải là ROLE_MANAGER: 2, 3, 13, 17)
INSERT INTO tasks (name, description, start_date, due_date, status, priority, project_id, created_by)
VALUES
  ('Xây dựng hệ thống cơ sở dữ liệu', 'Xây dựng cơ sở dữ liệu cho hệ thống quản lý', '2025-01-01 09:00:00', '2025-01-20 17:00:00', 'IN_PROGRESS', 'HIGH', 1, 2),
  ('Phát triển ứng dụng mobile', 'Phát triển ứng dụng di động cho khách hàng', '2025-01-15 09:00:00', '2025-02-15 17:00:00', 'NOT_STARTED', 'MEDIUM', 2, 3),
  ('Thiết kế giao diện website', 'Thiết kế giao diện trang web cho công ty', '2025-02-01 09:00:00', '2025-02-28 17:00:00', 'ON_HOLD', 'LOW', 3, 13),
  ('Kiểm thử phần mềm', 'Kiểm thử phần mềm quản lý doanh nghiệp', '2025-03-01 09:00:00', '2025-03-25 17:00:00', 'COMPLETED', 'HIGH', 4, 17),
  ('Cải tiến giao diện người dùng', 'Cải tiến giao diện người dùng cho hệ thống', '2025-04-01 09:00:00', '2025-04-20 17:00:00', 'OVER_DUE', 'MEDIUM', 5, 2),
  ('Nghiên cứu và phát triển', 'Nghiên cứu và phát triển các tính năng mới cho ứng dụng', '2025-05-01 09:00:00', '2025-05-25 17:00:00', 'IN_PROGRESS', 'HIGH', 6, 3),
  ('Marketing sản phẩm', 'Chiến dịch marketing sản phẩm mới', '2025-06-01 09:00:00', '2025-06-20 17:00:00', 'IN_PROGRESS', 'MEDIUM', 7, 13),
  ('Đào tạo nhân viên', 'Tổ chức khóa đào tạo cho nhân viên mới', '2025-07-01 09:00:00', '2025-07-15 17:00:00', 'NOT_STARTED', 'LOW', 8, 17),
  ('Nâng cấp hệ thống', 'Nâng cấp hệ thống phần mềm hiện tại', '2025-08-01 09:00:00', '2025-08-20 17:00:00', 'COMPLETED', 'HIGH', 9, 2),
  ('Hỗ trợ khách hàng', 'Hỗ trợ khách hàng sử dụng sản phẩm', '2025-09-01 09:00:00', '2025-09-15 17:00:00', 'ON_HOLD', 'LOW', 10, 3),
  ('Phân tích dữ liệu', 'Phân tích dữ liệu thị trường và xu hướng', '2025-01-10 09:00:00', '2025-02-10 17:00:00', 'IN_PROGRESS', 'MEDIUM', 1, 2),
  ('Tạo báo cáo tiến độ', 'Tạo báo cáo tiến độ và kết quả công việc', '2025-02-15 09:00:00', '2025-03-15 17:00:00', 'NOT_STARTED', 'LOW', 2, 3),
  ('Xây dựng công cụ quản lý', 'Phát triển công cụ quản lý công việc cho đội ngũ', '2025-03-15 09:00:00', '2025-04-15 17:00:00', 'COMPLETED', 'HIGH', 3, 13),
  ('Phát triển API', 'Phát triển API cho hệ thống tích hợp', '2025-04-15 09:00:00', '2025-05-15 17:00:00', 'IN_PROGRESS', 'HIGH', 4, 17),
  ('Kiểm thử bảo mật', 'Kiểm thử và đánh giá tính bảo mật của hệ thống', '2025-05-15 09:00:00', '2025-06-15 17:00:00', 'NOT_STARTED', 'HIGH', 5, 2);

-- Chèn dữ liệu vào bảng `subtasks` (assignee_id có thể là bất kỳ user nào ROLE_USER: 4,5,6,7,8,9,10,11,12,14,15,16,19)
INSERT INTO subtasks (name, task_id, completed, assignee_id, start_date, due_date)
VALUES
  ('Thiết kế ERD cơ sở dữ liệu', 1, TRUE, 6, '2025-01-01 09:00:00', '2025-01-08 17:00:00'),
  ('Tạo script tạo bảng', 1, TRUE, 6, '2025-01-08 09:00:00', '2025-01-15 17:00:00'),
  ('Cài đặt môi trường phát triển', 2, FALSE, 7, '2025-01-15 09:00:00', '2025-01-25 17:00:00'),
  ('Thiết kế màn hình đăng nhập', 2, FALSE, 19, '2025-01-25 09:00:00', '2025-02-05 17:00:00'),
  ('Tạo wireframe trang chủ', 3, TRUE, 7, '2025-02-01 09:00:00', '2025-02-10 17:00:00'),
  ('Thiết kế responsive layout', 3, FALSE, 7, '2025-02-10 09:00:00', '2025-02-20 17:00:00'),
  ('Viết test case tính năng đăng nhập', 4, TRUE, 5, '2025-03-01 09:00:00', '2025-03-08 17:00:00'),
  ('Kiểm thử tính năng quản lý user', 4, TRUE, 5, '2025-03-08 09:00:00', '2025-03-15 17:00:00'),
  ('Phân tích UX hiện tại', 5, FALSE, 8, '2025-04-01 09:00:00', '2025-04-08 17:00:00'),
  ('Thiết kế giao diện mới', 5, FALSE, 8, '2025-04-08 09:00:00', '2025-04-15 17:00:00'),
  ('Nghiên cứu công nghệ AI', 6, TRUE, 4, '2025-05-01 09:00:00', '2025-05-10 17:00:00'),
  ('Phát triển prototype chatbot', 6, FALSE, 4, '2025-05-10 09:00:00', '2025-05-20 17:00:00'),
  ('Tạo nội dung marketing', 7, TRUE, 9, '2025-06-01 09:00:00', '2025-06-08 17:00:00'),
  ('Thiết kế banner quảng cáo', 7, FALSE, 9, '2025-06-08 09:00:00', '2025-06-15 17:00:00'),
  ('Chuẩn bị tài liệu đào tạo', 8, FALSE, 11, '2025-07-01 09:00:00', '2025-07-08 17:00:00'),
  ('Lên lịch khóa học', 8, FALSE, 11, '2025-07-08 09:00:00', '2025-07-12 17:00:00'),
  ('Backup dữ liệu hệ thống', 9, TRUE, 6, '2025-08-01 09:00:00', '2025-08-05 17:00:00'),
  ('Cập nhật phiên bản mới', 9, TRUE, 6, '2025-08-05 09:00:00', '2025-08-15 17:00:00'),
  ('Tạo FAQ cho khách hàng', 10, FALSE, 12, '2025-09-01 09:00:00', '2025-09-08 17:00:00'),
  ('Thiết lập chat support', 10, FALSE, 12, '2025-09-08 09:00:00', '2025-09-12 17:00:00'),
  ('Thu thập dữ liệu thị trường', 11, TRUE, 15, '2025-01-10 09:00:00', '2025-01-20 17:00:00'),
  ('Phân tích đối thủ cạnh tranh', 11, FALSE, 15, '2025-01-20 09:00:00', '2025-02-05 17:00:00'),
  ('Tạo template báo cáo', 12, FALSE, 16, '2025-02-15 09:00:00', '2025-02-25 17:00:00'),
  ('Thu thập dữ liệu từ các team', 12, FALSE, 16, '2025-02-25 09:00:00', '2025-03-10 17:00:00'),
  ('Thiết kế workflow quản lý', 13, TRUE, 19, '2025-03-15 09:00:00', '2025-03-25 17:00:00'),
  ('Phát triển dashboard', 13, TRUE, 19, '2025-03-25 09:00:00', '2025-04-10 17:00:00'),
  ('Thiết kế API endpoints', 14, TRUE, 6, '2025-04-15 09:00:00', '2025-04-25 17:00:00'),
  ('Viết documentation API', 14, FALSE, 6, '2025-04-25 09:00:00', '2025-05-10 17:00:00'),
  ('Thiết kế test cases bảo mật', 15, FALSE, 5, '2025-05-15 09:00:00', '2025-05-25 17:00:00'),
  ('Thực hiện penetration testing', 15, FALSE, 5, '2025-05-25 09:00:00', '2025-06-10 17:00:00');

-- Chèn dữ liệu vào bảng `project_users`
INSERT INTO project_users (project_id, user_id)
VALUES
  (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),        -- Project 1: 5 users
  (2, 6), (2, 7), (2, 9), (2, 19),               -- Project 2: 4 users  
  (3, 7), (3, 8), (3, 9),                        -- Project 3: 3 users
  (4, 4), (4, 5), (4, 6), (4, 15), (4, 16),      -- Project 4: 5 users
  (5, 5), (5, 6), (5, 8),                        -- Project 5: 3 users
  (6, 4), (6, 9), (6, 12), (6, 15),              -- Project 6: 4 users
  (7, 9), (7, 11), (7, 12),                      -- Project 7: 3 users
  (8, 11), (8, 12), (8, 15), (8, 16),            -- Project 8: 4 users
  (9, 6), (9, 11), (9, 12),                      -- Project 9: 3 users
  (10, 12), (10, 15), (10, 16), (10, 19);        -- Project 10: 4 users

-- Chèn dữ liệu vào bảng `tags`
INSERT INTO tags (name, color) VALUES
  ('Development', '#3B82F6'),
  ('Research', '#8B5CF6'),
  ('Design', '#EC4899'),
  ('Marketing', '#F59E0B'),
  ('Testing', '#10B981'),
  ('Documentation', '#6B7280'),
  ('Security', '#EF4444'),
  ('Performance', '#06B6D4'),
  ('Mobile', '#8B5CF6'),
  ('Web', '#10B981');

-- Chèn dữ liệu vào bảng `project_tags`
INSERT INTO project_tags (project_id, tag_id)
VALUES
  (1, 1), (1, 2), (1, 5),                        -- Project 1: Development, Research, Testing
  (2, 1), (2, 3), (2, 9),                        -- Project 2: Development, Design, Mobile
  (3, 3), (3, 6), (3, 10),                       -- Project 3: Design, Documentation, Web
  (4, 1), (4, 5), (4, 7),                        -- Project 4: Development, Testing, Security
  (5, 1), (5, 8), (5, 5),                        -- Project 5: Development, Performance, Testing
  (6, 4), (6, 2), (6, 6),                        -- Project 6: Marketing, Research, Documentation
  (7, 2), (7, 4), (7, 6),                        -- Project 7: Research, Marketing, Documentation
  (8, 6), (8, 4), (8, 2),                        -- Project 8: Documentation, Marketing, Research
  (9, 1), (9, 5), (9, 8),                        -- Project 9: Development, Testing, Performance
  (10, 4), (10, 6), (10, 2);                     -- Project 10: Marketing, Documentation, Research

-- Thêm dữ liệu mẫu cho bảng comments
INSERT INTO comments (content, type, reference_id, user_id, parent_id)
VALUES
  ('Dự án này cần đẩy nhanh tiến độ để kịp deadline', 'PROJECT', 1, 2, NULL),
  ('Đã hoàn thành phần thiết kế cơ sở dữ liệu như yêu cầu', 'TASK', 1, 6, NULL),
  ('Cần hỗ trợ thêm về phần giao diện người dùng', 'SUBTASK', 1, 6, NULL),
  ('Tiến độ dự án mobile app đang theo đúng kế hoạch', 'PROJECT', 2, 3, NULL),
  ('Cần review lại requirement trước khi bắt đầu code', 'TASK', 2, 7, NULL),
  ('Gặp khó khăn trong việc tối ưu performance', 'SUBTASK', 3, 7, NULL),
  ('Design đã được approve, có thể bắt đầu development', 'PROJECT', 3, 13, NULL),
  ('Test cases đã được viết xong và review', 'TASK', 4, 5, NULL);

-- Thêm các reply comments
INSERT INTO comments (content, type, reference_id, user_id, parent_id)
VALUES
  ('Tôi sẽ tổ chức meeting để thảo luận chi tiết', 'PROJECT', 1, 3, 1),
  ('Cảm ơn, tôi đã check và thấy rất tốt', 'TASK', 1, 2, 2),
  ('Tôi có thể hỗ trợ bạn phần này từ tuần sau', 'SUBTASK', 1, 8, 3),
  ('Tuyệt vời, chúng ta đang đi đúng hướng', 'PROJECT', 2, 17, 4),
  ('Đồng ý, tôi sẽ schedule review session vào thứ 3', 'TASK', 2, 3, 5),
  ('Hãy thử approach khác, tôi có thể tư vấn', 'SUBTASK', 3, 19, 6),
  ('Tốt, team development đã sẵn sàng', 'PROJECT', 3, 6, 7),
  ('Excellent work! Ready for next phase', 'TASK', 4, 17, 8);

-- Chèn dữ liệu vào bảng project_files
INSERT INTO project_files (name, original_name, content_type, size, path, description, project_id, uploaded_by)
VALUES
  ('f123e456.pdf', 'Project_Requirements.pdf', 'application/pdf', 2456789, '/storage/projects/1/f123e456.pdf', 'Tài liệu yêu cầu dự án chi tiết', 1, 2),
  ('f789a012.zip', 'Design_Mockups.zip', 'application/zip', 15678900, '/storage/projects/1/f789a012.zip', 'File mockup thiết kế giao diện', 1, 7),
  ('f345b678.docx', 'Meeting_Notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 345670, '/storage/projects/1/f345b678.docx', 'Biên bản họp kickoff dự án', 1, 6),
  ('f901c234.xlsx', 'Budget_Plan.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 789456, '/storage/projects/1/f901c234.xlsx', 'Kế hoạch ngân sách dự án', 1, 5),
  ('f567d890.png', 'App_Logo.png', 'image/png', 456789, '/storage/projects/2/f567d890.png', 'Logo thiết kế cho ứng dụng mobile', 2, 7),
  ('f234b567.pdf', 'Technical_Specs.pdf', 'application/pdf', 1234567, '/storage/projects/2/f234b567.pdf', 'Tài liệu đặc tả kỹ thuật', 2, 6),
  ('f890c123.docx', 'User_Stories.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 567890, '/storage/projects/3/f890c123.docx', 'Danh sách user stories', 3, 8),
  ('f456d789.xlsx', 'Test_Cases.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 345678, '/storage/projects/4/f456d789.xlsx', 'Bảng test cases chi tiết', 4, 5);

-- Chèn dữ liệu vào bảng task_files
INSERT INTO task_files (name, original_name, content_type, size, path, description, task_id, uploaded_by)
VALUES
  ('t123e456.sql', 'Database_Schema.sql', 'text/plain', 123456, '/storage/tasks/1/t123e456.sql', 'Script tạo schema cơ sở dữ liệu', 1, 6),
  ('t789a012.pdf', 'DB_Design_Document.pdf', 'application/pdf', 987654, '/storage/tasks/1/t789a012.pdf', 'Tài liệu thiết kế cơ sở dữ liệu', 1, 6),
  ('t345b678.zip', 'Mobile_Wireframes.zip', 'application/zip', 2345678, '/storage/tasks/2/t345b678.zip', 'Wireframes cho ứng dụng mobile', 2, 7),
  ('t901c234.png', 'UI_Mockup.png', 'image/png', 1345678, '/storage/tasks/3/t901c234.png', 'Mockup giao diện website', 3, 7),
  ('t567d890.xlsx', 'Test_Results.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 234567, '/storage/tasks/4/t567d890.xlsx', 'Kết quả kiểm thử phần mềm', 4, 5),
  ('t234e567.docx', 'UI_Guidelines.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 456789, '/storage/tasks/5/t234e567.docx', 'Hướng dẫn thiết kế giao diện', 5, 8),
  ('t890f123.pdf', 'Research_Report.pdf', 'application/pdf', 1567890, '/storage/tasks/6/t890f123.pdf', 'Báo cáo nghiên cứu tính năng mới', 6, 4),
  ('t456g789.pptx', 'Marketing_Strategy.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 3456789, '/storage/tasks/7/t456g789.pptx', 'Chiến lược marketing sản phẩm', 7, 9);

-- Chèn dữ liệu vào bảng daily_goals (chỉ cho ROLE_USER)
INSERT INTO daily_goals (title, description, category, priority, estimated_time, progress, completed, user_id, due_date)
VALUES
 ('Tập thể dục buổi sáng', 'Chạy bộ 30 phút trong công viên', 'HEALTH', 'MEDIUM', 30, 100, TRUE, 6, '2025-05-28 08:00:00'),
 ('Đọc sách về React Native', 'Đọc 30 trang sách về phát triển mobile app', 'LEARNING', 'MEDIUM', 60, 60, FALSE, 7, '2025-05-28 22:00:00'),
 ('Gọi điện cho gia đình', 'Gọi điện hỏi thăm sức khỏe bố mẹ', 'PERSONAL', 'LOW', 15, 100, TRUE, 7, '2025-05-28 20:00:00'),
 ('Xem lại ngân sách cá nhân', 'Kiểm tra chi tiêu và lập kế hoạch tài chính tháng', 'FINANCE', 'HIGH', 60, 30, FALSE, 8, '2025-05-29 19:00:00'),
 ('Học từ vựng tiếng Anh', 'Học 25 từ vựng chuyên ngành IT', 'LEARNING', 'MEDIUM', 30, 100, TRUE, 8, '2025-05-28 21:00:00'),
 ('Hoàn thành wireframe trang chủ', 'Thiết kế wireframe cho trang chủ website', 'WORK', 'HIGH', 180, 80, FALSE, 9, '2025-05-29 16:00:00'),
 ('Uống đủ nước trong ngày', 'Uống ít nhất 8 ly nước trong ngày', 'HEALTH', 'LOW', 5, 70, FALSE, 9, '2025-05-28 23:59:00'),
 ('Viết test case cho login', 'Viết test cases chi tiết cho tính năng đăng nhập', 'WORK', 'HIGH', 120, 90, FALSE, 5, '2025-05-29 15:00:00'),
 ('Thiền 15 phút', 'Thực hành thiền để giảm stress và tập trung', 'HEALTH', 'MEDIUM', 15, 100, TRUE, 5, '2025-05-28 07:00:00'),
 ('Lên kế hoạch tuần tới', 'Lập danh sách công việc và mục tiêu tuần sau', 'PERSONAL', 'MEDIUM', 45, 20, FALSE, 4, '2025-05-29 20:00:00'),
 ('Nghiên cứu AI framework', 'Tìm hiểu về TensorFlow và các ứng dụng', 'LEARNING', 'HIGH', 90, 40, FALSE, 4, '2025-05-29 18:00:00'),
 ('Cập nhật CV cá nhân', 'Cập nhật thông tin và dự án mới vào CV', 'PERSONAL', 'MEDIUM', 60, 0, FALSE, 11, '2025-05-29 17:30:00'),
 ('Tập yoga buổi tối', 'Tập yoga 45 phút để thư giãn cơ thể', 'HEALTH', 'LOW', 45, 100, TRUE, 11, '2025-05-28 19:00:00'),
 ('Đọc báo công nghệ', 'Đọc tin tức về xu hướng công nghệ mới', 'LEARNING', 'LOW', 30, 60, FALSE, 12, '2025-05-28 21:30:00'),
 ('Chuẩn bị tài liệu đào tạo', 'Soạn slides cho buổi training nhân viên mới', 'WORK', 'HIGH', 150, 70, FALSE, 12, '2025-05-29 14:00:00'),
 ('Thanh toán hóa đơn', 'Thanh toán các hóa đơn điện, nước, internet', 'FINANCE', 'HIGH', 20, 100, TRUE, 15, '2025-05-28 16:00:00'),
 ('Dọn dẹp bàn làm việc', 'Sắp xếp lại không gian làm việc tại nhà', 'PERSONAL', 'LOW', 30, 100, TRUE, 15, '2025-05-28 18:00:00'),
 ('Phân tích dữ liệu thị trường', 'Phân tích báo cáo dữ liệu khách hàng tháng trước', 'WORK', 'HIGH', 180, 50, FALSE, 16, '2025-05-29 16:30:00'),
 ('Học Excel nâng cao', 'Học các hàm Excel phức tạp cho công việc', 'LEARNING', 'MEDIUM', 75, 30, FALSE, 16, '2025-05-29 19:30:00'),
 ('Tập gym buổi chiều', 'Tập luyện cơ bản tại phòng gym 1 tiếng', 'HEALTH', 'MEDIUM', 60, 100, TRUE, 19, '2025-05-28 17:00:00'),
 ('Code review cho team', 'Review code của đồng nghiệp và đưa feedback', 'WORK', 'MEDIUM', 90, 85, FALSE, 19, '2025-05-29 11:00:00'),
 ('Lập kế hoạch chi tiêu', 'Lập budget chi tiêu cho tháng tiếp theo', 'FINANCE', 'MEDIUM', 40, 0, FALSE, 19, '2025-05-29 20:30:00');

-- Chèn dữ liệu vào bảng notifications
INSERT INTO notifications (title, content, type, status, reference_id, user_id)
VALUES
 ('Dự án mới được giao', 'Bạn đã được thêm vào dự án "Hệ thống quản lý dự án"', 'PROJECT', 'UNREAD', 1, 6),
 ('Task mới cần hoàn thành', 'Task "Xây dựng hệ thống cơ sở dữ liệu" đã được giao cho bạn', 'TASK', 'READ', 1, 6),
 ('Subtask sắp hết hạn', 'Subtask "Thiết kế ERD cơ sở dữ liệu" sẽ hết hạn trong 1 ngày', 'SUBTASK', 'UNREAD', 1, 6),
 ('Có bình luận mới', 'Có bình luận mới trong dự án "Ứng dụng di động"', 'COMMENT', 'UNREAD', 2, 7),
 ('Thông báo hệ thống', 'Hệ thống sẽ bảo trì vào 2h sáng ngày mai', 'SYSTEM', 'read', NULL, 4),
 ('Dự án được cập nhật', 'Dự án "Thiết kế website" đã thay đổi trạng thái', 'PROJECT', 'UNREAD', 3, 8),
 ('Task hoàn thành', 'Task "Kiểm thử phần mềm" đã được đánh dấu hoàn thành', 'TASK', 'read', 4, 5),
 ('Subtask mới được giao', 'Subtask "Phân tích UX hiện tại" đã được giao cho bạn', 'SUBTASK', 'UNREAD', 9, 8),
 ('Có bình luận mới', 'Có phản hồi mới cho bình luận của bạn', 'COMMENT', 'read', 3, 6),
 ('Deadline sắp tới', 'Task "Marketing sản phẩm" sẽ hết hạn trong 3 ngày', 'TASK', 'UNREAD', 7, 9),
 ('Dự án mới được tạo', 'Dự án "Chương trình đào tạo" đã được tạo thành công', 'PROJECT', 'read', 9, 11),
 ('Subtask hoàn thành', 'Subtask "Tạo nội dung marketing" đã hoàn thành', 'SUBTASK', 'UNREAD', 13, 9),
 ('Thông báo quan trọng', 'Cuộc họp team sẽ diễn ra vào 9h sáng mai', 'SYSTEM', 'UNREAD', NULL, 12),
 ('Task cần review', 'Task "Phát triển API" cần được review trước khi deploy', 'TASK', 'UNREAD', 14, 17),
 ('Dự án sắp hết hạn', 'Dự án "Cải tiến hệ thống" sẽ hết hạn trong 1 tuần', 'PROJECT', 'read', 5, 2);