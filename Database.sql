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

-- Cập nhật câu lệnh INSERT vào bảng `users`
INSERT INTO users (full_name, username, password, email, phone_number, role, department, address, position, status)
VALUES
  ('Nguyễn Văn A', 'nguyenvana', 'password123', 'nguyenvana@example.com', '0912345678', 'ROLE_ADMIN', 'IT', '123 Main St', 'Manager', 'ACTIVE'),
  ('Trần Thị B', 'tranthib', 'password123', 'tranthib@example.com', '0912345679', 'ROLE_MANAGER', 'Marketing', '456 Oak St', 'Coordinator', 'ACTIVE'),
  ('Lê Minh C', 'leminhc', 'password123', 'leminhc@example.com', '0912345680', 'ROLE_MANAGER', 'Sales', '789 Pine St', 'Supervisor', 'ACTIVE'),
  ('Phan Thi D', 'phanthid', 'password123', 'phanthid@example.com', '0912345681', 'ROLE_USER', 'HR', '101 Maple St', 'Staff', 'ACTIVE'),
  ('Vũ Văn E', 'vuvan', 'password123', 'vuvan@example.com', '0912345682', 'ROLE_USER', 'Finance', '102 Birch St', 'Accountant', 'ACTIVE'),
  ('Hoàng Thị F', 'hoangthif', 'password123', 'hoangthif@example.com', '0912345683', 'ROLE_USER', 'IT', '103 Cedar St', 'Developer', 'ACTIVE'),
  ('Đoàn Minh G', 'doanming', 'password123', 'doanming@example.com', '0912345684', 'ROLE_USER', 'Marketing', '104 Elm St', 'Designer', 'ACTIVE'),
  ('Nguyễn Thị H', 'nguyenh', 'password123', 'nguyenh@example.com', '0912345685', 'ROLE_USER', 'Operations', '105 Birch St', 'Coordinator', 'ACTIVE'),
  ('Trần Minh I', 'tranminhi', 'password123', 'tranminhi@example.com', '0912345686', 'ROLE_USER', 'Sales', '106 Oak St', 'Representative', 'ACTIVE'),
  ('Phạm Văn J', 'phamvanj', 'password123', 'phamvanj@example.com', '0912345687', 'ROLE_USER', 'IT', '107 Pine St', 'Technician', 'INACTIVE'),
  ('Lý Minh K', 'lyminhk', 'password123', 'lyminhk@example.com', '0912345688', 'ROLE_USER', 'HR', '108 Cedar St', 'Recruiter', 'ACTIVE'),
  ('Hồ Thi L', 'hothil', 'password123', 'hothil@example.com', '0912345689', 'ROLE_USER', 'Finance', '109 Elm St', 'Analyst', 'ACTIVE'),
  ('Tôn Thị M', 'tonthim', 'password123', 'tonthim@example.com', '0912345690', 'ROLE_USER', 'Marketing', '110 Birch St', 'Manager', 'ACTIVE'),
  ('Ngô Minh N', 'ngominhn', 'password123', 'ngominhn@example.com', '0912345691', 'ROLE_USER', 'Operations', '111 Oak St', 'Administrator', 'INACTIVE'),
  ('Vũ Thi O', 'vuthio', 'password123', 'vuthio@example.com', '0912345692', 'ROLE_USER', 'Sales', '112 Pine St', 'Assistant', 'ACTIVE'),
  ('Mai Văn P', 'maivanp', 'password123', 'maivanp@example.com', '0912345693', 'ROLE_USER', 'Finance', '113 Cedar St', 'Controller', 'ACTIVE'),
  ('Phan Minh Q', 'phanminhq', 'password123', 'phanminhq@example.com', '0912345694', 'ROLE_USER', 'HR', '114 Elm St', 'Manager', 'ACTIVE'),
  ('Đặng Thị R', 'dangthir', 'password123', 'dangthir@example.com', '0912345695', 'ROLE_USER', 'Marketing', '115 Birch St', 'Assistant', 'INACTIVE'),
  ('Bùi Minh S', 'buiminhs', 'password123', 'buiminhs@example.com', '0912345696', 'ROLE_USER', 'IT', '116 Oak St', 'Developer', 'ACTIVE');
-- Chèn dữ liệu vào bảng `projects`
INSERT INTO projects (name, description, start_date, due_date, status, manager_id)
VALUES
  ('Hệ thống quản lý dự án', 'Phát triển hệ thống quản lý các dự án cho doanh nghiệp', '2025-01-01 09:00:00', '2025-02-01 17:00:00', 'IN_PROGRESS', 2),
  ('Ứng dụng di động', 'Phát triển ứng dụng di động cho khách hàng', '2025-01-15 09:00:00', '2025-03-01 17:00:00', 'NOT_STARTED', 3),
  ('Thiết kế website', 'Thiết kế giao diện cho trang web của công ty', '2025-02-01 09:00:00', '2025-04-01 17:00:00', 'ON_HOLD', 2),
  ('Phát triển phần mềm', 'Phát triển phần mềm quản lý doanh nghiệp', '2025-03-01 09:00:00', '2025-06-01 17:00:00', 'COMPLETED', 3),
  ('Cải tiến hệ thống', 'Cải tiến và nâng cấp hệ thống hiện tại', '2025-04-01 09:00:00', '2025-05-01 17:00:00', 'OVER_DUE', 3),
  ('Marketing trực tuyến', 'Chiến dịch marketing trực tuyến cho sản phẩm mới', '2025-05-01 09:00:00', '2025-06-01 17:00:00', 'IN_PROGRESS', 2),
  ('Nghiên cứu thị trường', 'Nghiên cứu thị trường cho sản phẩm mới', '2025-06-01 09:00:00', '2025-07-01 17:00:00', 'IN_PROGRESS', 3),
  ('Xây dựng chiến lược', 'Xây dựng chiến lược cho công ty trong năm tới', '2025-07-01 09:00:00', '2025-09-01 17:00:00', 'NOT_STARTED', 2),
  ('Chương trình đào tạo', 'Tổ chức chương trình đào tạo cho nhân viên mới', '2025-08-01 09:00:00', '2025-09-01 17:00:00', 'COMPLETED', 3),
  ('Hỗ trợ khách hàng', 'Hỗ trợ khách hàng cho sản phẩm mới ra mắt', '2025-09-01 09:00:00', '2025-10-01 17:00:00', 'ON_HOLD', 2),
  ('Bảo trì hệ thống', 'Bảo trì và nâng cấp hệ thống công nghệ', '2025-10-01 09:00:00', '2025-11-01 17:00:00', 'IN_PROGRESS', 3),
  ('Tổ chức sự kiện', 'Tổ chức sự kiện giới thiệu sản phẩm mới', '2025-11-01 09:00:00', '2025-12-01 17:00:00', 'NOT_STARTED', 2),
  ('Đầu tư công nghệ', 'Đầu tư vào các công nghệ mới cho công ty', '2025-12-01 09:00:00', '2026-01-01 17:00:00', 'IN_PROGRESS', 3),
  ('Xây dựng cơ sở dữ liệu', 'Xây dựng cơ sở dữ liệu cho hệ thống quản lý', '2026-01-01 09:00:00', '2026-03-01 17:00:00', 'COMPLETED', 2),
  ('Phát triển giao diện người dùng', 'Phát triển giao diện người dùng cho sản phẩm', '2026-02-01 09:00:00', '2026-04-01 17:00:00', 'ON_HOLD', 3),
  ('Tối ưu hóa hiệu suất', 'Tối ưu hóa hiệu suất hệ thống cho công ty', '2026-03-01 09:00:00', '2026-05-01 17:00:00', 'OVER_DUE', 2),
  ('Phát triển công cụ mới', 'Phát triển công cụ tự động hóa công việc', '2026-04-01 09:00:00', '2026-06-01 17:00:00', 'IN_PROGRESS', 3),
  ('Đào tạo công nghệ', 'Đào tạo nhân viên về công nghệ mới', '2026-05-01 09:00:00', '2026-07-01 17:00:00', 'NOT_STARTED', 2),
  ('Hợp tác quốc tế', 'Thực hiện hợp tác quốc tế với các đối tác', '2026-06-01 09:00:00', '2026-08-01 17:00:00', 'IN_PROGRESS', 3);


-- Chèn dữ liệu vào bảng `tasks`
INSERT INTO tasks (name, description, start_date, due_date, status, priority, project_id, created_by)
VALUES
  ('Xây dựng hệ thống cơ sở dữ liệu', 'Xây dựng cơ sở dữ liệu cho hệ thống quản lý', '2025-01-01 09:00:00', '2025-01-15 17:00:00', 'IN_PROGRESS', 'HIGH', 1, 1),
  ('Phát triển ứng dụng mobile', 'Phát triển ứng dụng di động cho khách hàng', '2025-01-15 09:00:00', '2025-02-01 17:00:00', 'NOT_STARTED', 'MEDIUM', 2, 2),
  ('Thiết kế giao diện website', 'Thiết kế giao diện trang web cho công ty', '2025-02-01 09:00:00', '2025-02-15 17:00:00', 'ON_HOLD', 'LOW', 3, 3),
  ('Kiểm thử phần mềm', 'Kiểm thử phần mềm quản lý doanh nghiệp', '2025-03-01 09:00:00', '2025-03-15 17:00:00', 'COMPLETED', 'HIGH', 4, 4),
  ('Cải tiến giao diện người dùng', 'Cải tiến giao diện người dùng cho hệ thống', '2025-04-01 09:00:00', '2025-04-15 17:00:00', 'OVER_DUE', 'MEDIUM', 5, 5),
  ('Nghiên cứu và phát triển', 'Nghiên cứu và phát triển các tính năng mới cho ứng dụng', '2025-05-01 09:00:00', '2025-05-15 17:00:00', 'IN_PROGRESS', 'HIGH', 6, 6),
  ('Marketing sản phẩm', 'Chiến dịch marketing sản phẩm mới', '2025-06-01 09:00:00', '2025-06-15 17:00:00', 'IN_PROGRESS', 'MEDIUM', 7, 7),
  ('Đào tạo nhân viên', 'Tổ chức khóa đào tạo cho nhân viên mới', '2025-07-01 09:00:00', '2025-07-15 17:00:00', 'NOT_STARTED', 'LOW', 8, 8),
  ('Nâng cấp hệ thống', 'Nâng cấp hệ thống phần mềm hiện tại', '2025-08-01 09:00:00', '2025-08-15 17:00:00', 'COMPLETED', 'HIGH', 9, 9),
  ('Hỗ trợ khách hàng', 'Hỗ trợ khách hàng sử dụng sản phẩm', '2025-09-01 09:00:00', '2025-09-15 17:00:00', 'ON_HOLD', 'LOW', 10, 10),
  ('Tổ chức sự kiện ra mắt sản phẩm', 'Tổ chức sự kiện ra mắt sản phẩm công nghệ mới', '2025-10-01 09:00:00', '2025-10-15 17:00:00', 'IN_PROGRESS', 'MEDIUM', 1, 1),
  ('Phân tích dữ liệu thị trường', 'Phân tích dữ liệu thị trường và xu hướng tiêu dùng', '2025-11-01 09:00:00', '2025-11-15 17:00:00', 'NOT_STARTED', 'HIGH', 2, 2),
  ('Tạo báo cáo tiến độ dự án', 'Tạo báo cáo tiến độ và kết quả công việc dự án', '2025-12-01 09:00:00', '2025-12-15 17:00:00', 'COMPLETED', 'LOW', 3, 3),
  ('Xây dựng công cụ quản lý', 'Phát triển công cụ quản lý công việc cho đội ngũ nhân viên', '2026-01-01 09:00:00', '2026-01-15 17:00:00', 'IN_PROGRESS', 'HIGH', 4, 4),
  ('Phát triển website e-commerce', 'Phát triển website thương mại điện tử cho công ty', '2026-02-01 09:00:00', '2026-02-15 17:00:00', 'IN_PROGRESS', 'MEDIUM', 5, 5),
  ('Chạy chiến dịch quảng cáo', 'Chạy chiến dịch quảng cáo trên mạng xã hội', '2026-03-01 09:00:00', '2026-03-15 17:00:00', 'NOT_STARTED', 'LOW', 6, 6),
  ('Tối ưu hóa SEO', 'Tối ưu hóa công cụ tìm kiếm cho website', '2026-04-01 09:00:00', '2026-04-15 17:00:00', 'COMPLETED', 'HIGH', 7, 7),
  ('Hỗ trợ khách hàng trực tuyến', 'Cung cấp dịch vụ hỗ trợ khách hàng qua chat trực tuyến', '2026-05-01 09:00:00', '2026-05-15 17:00:00', 'ON_HOLD', 'LOW', 8, 8),
  ('Kiểm thử sản phẩm', 'Kiểm thử và đánh giá chất lượng sản phẩm trước khi phát hành', '2026-06-01 09:00:00', '2026-06-15 17:00:00', 'IN_PROGRESS', 'HIGH', 9, 9),
  ('Tổ chức sự kiện ra mắt sản phẩm', 'Lên kế hoạch và tổ chức sự kiện ra mắt sản phẩm mới', '2026-07-01 09:00:00', '2026-07-15 17:00:00', 'NOT_STARTED', 'MEDIUM', 10, 10);

-- Chèn dữ liệu vào bảng `subtasks` với các cột mới
INSERT INTO subtasks (name, task_id, completed, assignee_id, start_date, due_date)
VALUES
  ('Thiết kế cơ sở dữ liệu', 1, TRUE, 2, '2025-01-01 09:00:00', '2025-01-10 17:00:00'),
  ('Phát triển ứng dụng di động', 2, FALSE, 3, '2025-01-15 09:00:00', '2025-01-25 17:00:00'),
  ('Thiết kế giao diện website', 3, TRUE, 4, '2025-02-01 09:00:00', '2025-02-10 17:00:00'),
  ('Kiểm thử phần mềm', 4, FALSE, 5, '2025-03-01 09:00:00', '2025-03-10 17:00:00'),
  ('Cải tiến giao diện người dùng', 5, TRUE, 6, '2025-04-01 09:00:00', '2025-04-10 17:00:00'),
  ('Nghiên cứu và phát triển tính năng mới', 6, TRUE, 7, '2025-05-01 09:00:00', '2025-05-10 17:00:00'),
  ('Chiến dịch marketing sản phẩm', 7, FALSE, 8, '2025-06-01 09:00:00', '2025-06-10 17:00:00'),
  ('Đào tạo nhân viên mới', 8, TRUE, 9, '2025-07-01 09:00:00', '2025-07-10 17:00:00'),
  ('Nâng cấp hệ thống phần mềm', 9, FALSE, 10, '2025-08-01 09:00:00', '2025-08-10 17:00:00'),
  ('Hỗ trợ khách hàng sử dụng sản phẩm', 10, TRUE, 2, '2025-09-01 09:00:00', '2025-09-10 17:00:00'),
  ('Phân tích thị trường', 11, TRUE, 3, '2025-10-01 09:00:00', '2025-10-10 17:00:00'),
  ('Tạo báo cáo tiến độ dự án', 12, TRUE, 4, '2025-11-01 09:00:00', '2025-11-10 17:00:00'),
  ('Phát triển công cụ quản lý công việc', 13, FALSE, 5, '2025-12-01 09:00:00', '2025-12-10 17:00:00'),
  ('Phát triển website thương mại điện tử', 14, TRUE, 6, '2026-01-01 09:00:00', '2026-01-10 17:00:00'),
  ('Chạy chiến dịch quảng cáo', 15, FALSE, 7, '2026-02-01 09:00:00', '2026-02-10 17:00:00'),
  ('Tối ưu hóa SEO cho website', 16, TRUE, 8, '2026-03-01 09:00:00', '2026-03-10 17:00:00'),
  ('Hỗ trợ khách hàng qua chat trực tuyến', 17, FALSE, 9, '2026-04-01 09:00:00', '2026-04-10 17:00:00'),
  ('Lập kế hoạch sản phẩm', 18, TRUE, 10, '2026-05-01 09:00:00', '2026-05-10 17:00:00');

-- Chèn dữ liệu vào bảng `project_users`
INSERT INTO project_users (project_id, user_id)
VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (2, 2),
  (2, 3),
  (2, 4),
  (2, 5),
  (2, 6),
  (2, 7),
  (3, 3),
  (3, 4),
  (3, 5),
  (3, 6),
  (3, 7),
  (4, 8),
  (4, 9),
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
INSERT INTO project_tags (project_id, tag_id)
VALUES
  (1, 1),  -- Project 1 với Tag 1 (Development)
  (1, 2),  -- Project 1 với Tag 2 (Research)
  (1, 3),  -- Project 1 với Tag 3 (Design)
  (2, 1),  -- Project 2 với Tag 1 (Development)
  (2, 4),  -- Project 2 với Tag 4 (Marketing)
  (2, 5),  -- Project 2 với Tag 5 (Testing)
  (3, 3),  -- Project 3 với Tag 3 (Design)
  (3, 6),  -- Project 3 với Tag 6 (Documentation)
  (4, 2),  -- Project 4 với Tag 2 (Research)
  (4, 4),  -- Project 4 với Tag 4 (Marketing)
  (5, 5),  -- Project 5 với Tag 5 (Testing)
  (6, 1),  -- Project 6 với Tag 1 (Development)
  (6, 2),  -- Project 6 với Tag 2 (Research)
  (7, 3),  -- Project 7 với Tag 3 (Design)
  (7, 6),  -- Project 7 với Tag 6 (Documentation)
  (8, 4),  -- Project 8 với Tag 4 (Marketing)
  (8, 5),  -- Project 8 với Tag 5 (Testing)
  (9, 2),  -- Project 9 với Tag 2 (Research)
  (9, 6),  -- Project 9 với Tag 6 (Documentation)
  (10, 1);  -- Project 10 với Tag 1 (Development)


-- Thêm dữ liệu mẫu cho bảng comments (comment gốc)
INSERT INTO comments (content, type, reference_id, user_id, parent_id)
VALUES
  ('Chúng ta cần đẩy nhanh tiến độ dự án này', 'PROJECT', 1, 1, NULL),
  ('Tôi đã hoàn thành phần thiết kế cơ sở dữ liệu', 'TASK', 1, 2, NULL),
  ('Cần thêm người hỗ trợ cho công việc này', 'SUBTASK', 1, 3, NULL),
  ('Đã tiến hành phỏng vấn người dùng để lấy yêu cầu', 'PROJECT', 2, 2, NULL),
  ('Cần cập nhật tài liệu kỹ thuật', 'TASK', 2, 4, NULL),
  ('Đã gặp vấn đề với phần authentication', 'SUBTASK', 2, 5, NULL);

-- Thêm các reply comments
INSERT INTO comments (content, type, reference_id, user_id, parent_id)
VALUES
  ('Tôi đồng ý, chúng ta nên tổ chức thêm buổi họp hàng tuần', 'PROJECT', 1, 2, 1),
  ('Tôi đã xem qua và thấy còn thiếu một số quan hệ', 'TASK', 1, 3, 2),
  ('Tôi có thể hỗ trợ bạn từ tuần sau', 'SUBTASK', 1, 4, 3),
  ('Đã lên lịch phỏng vấn thêm 5 người dùng vào tuần tới', 'PROJECT', 2, 3, 4),
  ('Tôi sẽ cập nhật trong ngày mai', 'TASK', 2, 5, 5),
  ('Đã kiểm tra và fix lỗi, cần review lại', 'SUBTASK', 2, 6, 6);
  
INSERT INTO project_files (name, original_name, content_type, size, path, description, project_id, uploaded_by)
VALUES
  ('f123e456.pdf', 'Project_Requirements.pdf', 'application/pdf', 2456789, '/storage/projects/1/f123e456.pdf', 'Project requirements document', 1, 2),
  ('f789a012.zip', 'Design_Mockups.zip', 'application/zip', 15678900, '/storage/projects/1/f789a012.zip', 'UI design mockups', 1, 3),
  ('f345b678.docx', 'Meeting_Notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 345670, '/storage/projects/1/f345b678.docx', 'Meeting notes from kickoff', 1, 4),
  ('f901c234.xlsx', 'Budget_Plan.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 789456, '/storage/projects/1/f901c234.xlsx', 'Project budget planning', 1, 2),
  ('f567d890.png', 'Logo_Design.png', 'image/png', 456789, '/storage/projects/2/f567d890.png', 'Logo design for mobile app', 2, 3);