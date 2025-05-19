import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Loader,
  ListChecks,
  Trash2,
  Plus,
  ChevronLeft,
  FolderKanban,
  LinkIcon,
  Check,
} from "lucide-react";

// Project Modal Popup Component
const ProjectModal = ({ isOpen, onClose, projects, onSelect }) => {
  // Di chuyển các useState ra ngoài điều kiện if
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  // Return sớm nếu modal không mở
  if (!isOpen) return null;

  // Lấy danh sách các status duy nhất
  const uniqueStatuses = [
    "All",
    ...new Set(projects.map((project) => project.status).filter(Boolean)),
  ];

  // Lọc projects dựa trên tìm kiếm và status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === "All" || project.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-750">
          <h3 className="text-lg font-medium text-white">Chọn dự án</h3>
          <button
            className="p-2 hover:bg-gray-700 hover:text-white text-gray-400 rounded-full transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and filter section */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dự án theo tên..."
              className="w-full bg-gray-700 rounded-md px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* Projects list */}
        <div className="overflow-y-auto flex-grow custom-scrollbar p-1">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3 opacity-50"
              >
                <path d="M17.5 8c.7 0 1.4.3 1.9.8.6.6.8 1.3.8 2 0 .7-.3 1.4-.8 2-.3.2-.5.5-.8.7"></path>
                <path d="M3 3l18 18"></path>
                <path d="M16.5 16.5 21 21"></path>
                <path d="M10 5.5a7 7 0 0 1 10.5 6c0 1.5-.5 2.8-1.3 4"></path>
                <path d="M7.7 7.8a7 7 0 0 0-1.2 3.8c0 .7.1 1.4.3 2"></path>
                <path d="M12 12a7 7 0 0 0 1.3 4"></path>
              </svg>
              <p className="text-base mb-2">Không tìm thấy dự án phù hợp</p>
              {searchTerm && (
                <button
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300 py-1 px-3 rounded-md hover:bg-gray-700"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatusFilter("All");
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center p-3 hover:bg-gray-750 bg-gray-800 rounded-lg cursor-pointer transition-colors group border border-gray-700 hover:border-purple-500"
                  onClick={() => onSelect(project)}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                    <FolderKanban size={20} />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium text-white">{project.name}</h4>
                    <div className="flex items-center flex-wrap mt-1">
                      <span
                        className={`text-xs bg-opacity-20 px-2 py-0.5 rounded-full bg-blue-600 text-blue-300`}
                      >
                        {project.managerName}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-750 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Hiển thị {filteredProjects.length} trong số {projects.length} dự án
          </span>
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let bgColor;

  switch (status) {
    case "NOT_STARTED":
      color = "text-gray-600";
      bgColor = "bg-gray-200";
      break;
    case "IN_PROGRESS":
      color = "text-blue-600";
      bgColor = "bg-blue-100";
      break;
    case "COMPLETED":
      color = "text-green-600";
      bgColor = "bg-green-100";
      break;
    case "ON_HOLD":
      color = "text-yellow-600";
      bgColor = "bg-yellow-100";
      break;
    default:
      color = "text-gray-600";
      bgColor = "bg-gray-200";
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

// Tag Component
const TagBadge = ({ tag, onRemove, isSelectable = false, onSelect }) => {
  const tagStyle = {
    backgroundColor: tag.color + "20", // Adding transparency
    color: tag.color,
    borderColor: tag.color,
  };

  return (
    <div
      className={`flex items-center px-3 py-1 rounded-full border text-sm ${
        isSelectable ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={tagStyle}
      onClick={isSelectable ? () => onSelect(tag) : undefined}
    >
      <span>{tag.name}</span>
      {!isSelectable && (
        <button
          className="ml-2 hover:bg-gray-700 rounded-full p-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">{title}</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-72 overflow-y-auto">{children}</div>
    </div>
  );
};

// Project Option Component
const ProjectOption = ({ project, isSelected, onSelect }) => (
  <div
    className={`flex items-center p-2 rounded-md ${
      isSelected ? "bg-purple-700" : "hover:bg-gray-700 cursor-pointer"
    }`}
    onClick={() => onSelect(project)}
  >
    <div className="mr-3">
      <FolderKanban size={18} className="text-gray-400" />
    </div>
    <div className="flex-1">
      <div className="font-medium">{project.name}</div>
      <div className="flex items-center text-xs text-gray-400">
        <StatusBadge status={project.status} />
      </div>
    </div>
  </div>
);

// User Option Component
// Sửa đoạn code từ dòng 285-304
const UserOption = ({ user, isSelected, onSelect }) => (
  <div
    className={`flex items-center p-2 rounded-md ${
      isSelected ? "bg-purple-700" : "hover:bg-gray-700 cursor-pointer"
    }`}
    onClick={() => onSelect(user)}
  >
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3">
      {user.fullName ? user.fullName.charAt(0) : "?"}
    </div>
    <div className="flex-1">
      <div className="font-medium">{user.fullName}</div>
      <div className="text-xs text-gray-400">{user.role}</div>
    </div>
  </div>
);

// Task Dependency Component
const TaskDependency = ({ task, onRemove }) => (
  <div className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
    <div className="flex items-center">
      <ListChecks size={16} className="mr-2 text-gray-400" />
      <span>{task.name}</span>
    </div>
    <div className="flex items-center">
      <StatusBadge status={task.status} />
      <button
        className="ml-2 p-1 hover:bg-gray-600 rounded-full"
        onClick={() => onRemove(task.id)}
      >
        <X size={14} />
      </button>
    </div>
  </div>
);

// Task Option Component
const TaskOption = ({ task, onSelect }) => (
  <div
    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-md cursor-pointer"
    onClick={() => onSelect(task)}
  >
    <div className="flex items-center">
      <ListChecks size={16} className="mr-2 text-gray-400" />
      <span>{task.name}</span>
    </div>
    <StatusBadge status={task.status} />
  </div>
);

// Thay thế Subtask component từ dòng 360-375 bằng phiên bản mới
const Subtask = ({ subtask, onChange, onRemove, users }) => {
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);

  const handleAssigneeSelect = (user) => {
    subtask.assigneeId = user.id;
    setAssigneeMenuOpen(false);
  };

  return (
    <div className="flex items-center mb-3 gap-2">
      <div className="flex-1 flex items-center">
        <input
          type="checkbox"
          checked={subtask.completed}
          onChange={() => onChange(subtask.id, !subtask.completed)}
          className="mr-3 h-4 w-4"
        />
        <span className={subtask.completed ? "line-through text-gray-400" : ""}>
          {subtask.name}
        </span>
      </div>

      <div className="relative">
        <div
          className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white cursor-pointer flex items-center"
          onClick={() => setAssigneeMenuOpen(!assigneeMenuOpen)}
        >
          <User size={14} className="mr-1 text-gray-400" />
          <span className="text-xs">
            {subtask.assigneeId
              ? users.find((u) => u.id === subtask.assigneeId)?.fullName ||
                "Chọn"
              : "Phân công"}
          </span>
        </div>

        <DropdownMenu
          isOpen={assigneeMenuOpen}
          onClose={() => setAssigneeMenuOpen(false)}
          title="Chọn người phụ trách"
        >
          <div className="space-y-1">
            {users.map((user) => (
              <UserOption
                key={user.id}
                user={user}
                isSelected={user.id === subtask.assigneeId}
                onSelect={handleAssigneeSelect}
              />
            ))}
          </div>
        </DropdownMenu>
      </div>

      <button
        className="p-1 hover:bg-gray-700 rounded-full"
        onClick={() => onRemove(subtask.id)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const SuccessDialog = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Tự động đóng dialog sau 1.5 giây
      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      // Cleanup timer khi component unmount hoặc isOpen thay đổi
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in flex flex-col items-center">
        <CheckCircle size={50} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center">{message}</h2>
      </div>
    </div>
  );
};

const TaskEdit = ({
  task: initialTask = null, // Sử dụng initialTask với giá trị mặc định là null
  isNew = false,
  projectId = null,
  projectName = "",
  projectStartDate = null,
  projectDueDate = null,
  taskId = null,
  onBack,
}) => {
  const [task, setTask] = useState(
    isNew
      ? {
          name: "",
          description: "",
          projectId: projectId || null,
          projectName: projectName || "",
          projectStartDate: projectStartDate || null,
          projectDueDate: projectDueDate || null,
          assigneeId: null,
          assigneeName: "",
          startDate: null, //new Date().toISOString().split("T")[0]
          dueDate: null, //new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0]
          status: "NOT_STARTED",
          priority: "MEDIUM",
          progress: 0,
        }
      : {
          ...initialTask,
        }
  );

  const [loading, setLoading] = useState(!isNew && !initialTask);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });

  const showSuccessDialog = (message) => {
    setSuccessDialog({
      show: true,
      message: message,
    });
  };

  // Load task data when editing existing task
  // Load task data when editing existing task
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        let userId = null;
        let userRole = null;

        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
          userId = user.id;
          userRole = user.role;
        }

        // Fetch projects - thay đổi API dựa vào role
        let projectsResponse;

        if (userRole === "ROLE_ADMIN") {
          projectsResponse = await fetch(
            "http://localhost:8080/api/projects/all",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else if (userRole === "ROLE_MANAGER") {
          projectsResponse = await fetch(
            `http://localhost:8080/api/projects/manager/${userId}/all`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          projectsResponse = await fetch("http://localhost:8080/api/projects", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        if (!projectsResponse.ok) {
          throw new Error("Lấy dữ liệu dự án thất bại");
        }

        const projectsData = await projectsResponse.json();

        // Cập nhật xử lý danh sách projects dựa vào định dạng response
        // Nếu là API phân trang, projectsData sẽ có thuộc tính content
        // Nếu là API không phân trang, projectsData sẽ là một mảng
        setProjects(
          Array.isArray(projectsData) ? projectsData : projectsData.content
        );

        // Tiếp tục xử lý như phần còn lại của code

        // Fetch users
        const usersResponse = await fetch(
          "http://localhost:8080/api/users/active",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!usersResponse.ok) {
          throw new Error("Lấy dữ liệu người dùng thất bại");
        }

        const usersData = await usersResponse.json();
        setUsers(usersData);

        // If editing existing task, fetch task data
        if (!isNew && taskId) {
          const taskResponse = await fetch(
            `http://localhost:8080/api/tasks/${taskId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!taskResponse.ok) {
            throw new Error("Lấy dữ liệu công việc thất bại");
          }
          const taskData = await taskResponse.json();

          const projectsList = Array.isArray(projectsData)
            ? projectsData
            : projectsData.content;
          const relatedProject = projectsList.find(
            (p) => p.id === taskData.projectId
          );

          setTask({
            ...taskData,
            // Chuyển đổi startDate và dueDate sang định dạng yyyy-MM-dd
            startDate: taskData.startDate
              ? new Date(taskData.startDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            dueDate: taskData.dueDate
              ? new Date(taskData.dueDate).toISOString().split("T")[0]
              : new Date(new Date().setMonth(new Date().getMonth() + 1))
                  .toISOString()
                  .split("T")[0],
            projectStartDate: relatedProject ? relatedProject.startDate : null,
            projectDueDate: relatedProject ? relatedProject.dueDate : null,
          });
        }

        // If we have a projectId from props, set it in the task
        if (projectId && isNew) {
          // Cập nhật cách tìm project để phù hợp với cả hai loại response
          const projectsList = Array.isArray(projectsData)
            ? projectsData
            : projectsData.content;
          const project = projectsList.find((p) => p.id === projectId);
          if (project) {
            setTask((prev) => ({
              ...prev,
              projectId,
              projectName: project.name,
              projectStartDate: project.startDate,
              projectDueDate: project.dueDate,
            }));
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isNew, projectId, taskId]);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const Toast = ({ message, type }) => {
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    const icon =
      type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />;

    return (
      <div
        className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out opacity-0 translate-y-6 animate-toast`}
      >
        {icon}
        <span>{message}</span>
      </div>
    );
  };

  // Đặt đoạn code này vào bên trong hàm component TaskEdit,
  // ngang hàng với các lệnh useState và các useEffect khác.

  useEffect(() => {
    // Nếu có toast đang hiển thị
    if (toast) {
      // Thiết lập một timer để ẩn toast sau 3 giây (có thể điều chỉnh thời gian này)
      const timer = setTimeout(() => {
        setToast(null); // Gọi setToast(null) để ẩn toast
      }, 3000); // Thời gian hiển thị toast: 3000ms = 3 giây

      // Hàm cleanup: xóa timer nếu component bị unmount
      // hoặc nếu trạng thái toast thay đổi trước khi timer kết thúc
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]); // Dependency: chạy lại effect khi toast hoặc setToast thay đổi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({
      ...task,
      [name]: value,
    });

    // Clear error message when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleProjectSelect = (project) => {
    setTask({
      ...task,
      projectId: project.id,
      projectName: project.name,
      projectStartDate: project.startDate,
      projectDueDate: project.dueDate,
    });
    setProjectMenuOpen(false);

    // Clear error message
    if (formErrors.projectId) {
      setFormErrors({
        ...formErrors,
        projectId: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {}; // Tính toán ngày hôm nay một lần duy nhất và chuẩn hóa về đầu ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0); // --- Kiểm tra các trường bắt buộc khác (giữ nguyên) --- // Validate task name

    if (!task.name?.trim()) {
      errors.name = "Tên công việc không được để trống";
    } else if (task.name.length > 100) {
      errors.name = "Tên công việc không được vượt quá 100 ký tự";
    }

    if (!task.description?.trim()) {
      errors.description = "Mô tả không được để trống";
    } else if (task.description.length > 200) {
      errors.description = "Mô tả không được vượt quá 200 ký tự";
    }

    if (!task.projectId) {
      errors.projectId = "Dự án không được để trống";
    } // Validate status

    if (!task.status) {
      errors.status = "Trạng thái không được để trống";
    } // Validate priority

    if (!task.priority) {
      errors.priority = "Độ ưu tiên không được để trống";
    }

    const startDateProvided = !!task.startDate; // True nếu task.startDate không rỗng, null, undefined
    const dueDateProvided = !!task.dueDate; // True nếu task.dueDate không rỗng, null, undefined // Bước 2: Thiết lập lỗi "bắt buộc" nếu thiếu

    if (!startDateProvided) {
      errors.startDate = "Ngày bắt đầu không được để trống";
    }

    if (!dueDateProvided) {
      errors.dueDate = "Ngày kết thúc không được để trống";
    } // Bước 3: Chỉ thực hiện tạo đối tượng Date và các so sánh NẾU cả hai ngày đều đã được cung cấp dưới dạng chuỗi

    if (startDateProvided && dueDateProvided) {
      const taskStartDate = new Date(task.startDate);
      const taskDueDate = new Date(task.dueDate); // Bước 4: Kiểm tra xem đối tượng Date tạo ra có hợp lệ không (phòng trường hợp chuỗi không đúng định dạng) // type="date" trên input thường ngăn điều này, nhưng kiểm tra thêm sẽ an toàn hơn

      if (isNaN(taskStartDate.getTime())) {
        errors.startDate = "Định dạng ngày bắt đầu không hợp lệ";
        startDateProvided = false;
      }
      if (isNaN(taskDueDate.getTime())) {
        errors.dueDate = "Định dạng ngày kết thúc không hợp lệ";
        dueDateProvided = false;
      } // Bước 5: Tiếp tục thực hiện các so sánh ngày NẾU cả hai ngày vẫn được coi là hợp lệ sau khi parse

      if (startDateProvided && dueDateProvided) {
        // Chuẩn hóa ngày về đầu ngày để so sánh chính xác hơn
        taskStartDate.setHours(0, 0, 0, 0);
        taskDueDate.setHours(0, 0, 0, 0); // Kiểm tra 5a: Ngày bắt đầu không được ở trong quá khứ (chỉ cho task mới)

        if (isNew && taskStartDate < today) {
          errors.startDate = "Ngày bắt đầu không thể là ngày trong quá khứ";
        } // Kiểm tra 5b: Ngày kết thúc phải sau ngày bắt đầu // Lỗi này có thể ghi đè lỗi "Start date cannot be in the past" nếu cả hai đều đúng

        if (taskDueDate <= taskStartDate) {
          errors.dueDate = "Ngày kết thúc phải sau ngày bắt đầu";
        } // Kiểm tra 5c & 5d: So sánh với ngày của project (chỉ khi project và ngày tháng project tồn tại)

        if (task.projectId && task.projectStartDate && task.projectDueDate) {
          const projectStartDate = new Date(task.projectStartDate);
          const projectDueDate = new Date(task.projectDueDate);
          projectStartDate.setHours(0, 0, 0, 0); // Normalize
          projectDueDate.setHours(0, 0, 0, 0); // Normalize // Kiểm tra ngày bắt đầu task so với ngày bắt đầu project // Lỗi này có thể ghi đè các lỗi startDate trước đó (như lỗi quá khứ)

          if (taskStartDate < projectStartDate) {
            errors.startDate =
              "Ngày bắt đầu công việc không thể sớm hơn ngày bắt đầu dự án";
          } // Kiểm tra ngày kết thúc task so với ngày kết thúc project // Lỗi này có thể ghi đè các lỗi dueDate trước đó (như lỗi dueDate <= startDate)

          if (taskDueDate > projectDueDate) {
            errors.dueDate =
              "Ngày kết thúc công việc không thể muộn hơn ngày kết thúc dự án";
          }
        } else if (
          task.projectId &&
          (!task.projectStartDate || !task.projectDueDate)
        ) {
          // Trường hợp đặc biệt: Đã chọn project nhưng thông tin ngày tháng project bị thiếu (lỗi dữ liệu)
          // Giữ lại logic báo lỗi projectId như ban đầu, tránh ghi đè lỗi 'Project is required' nếu đó là lỗi ban đầu
          if (!errors.projectId) {
            errors.projectId = "Dự án được chọn thiếu thông tin ngày tháng";
          }
        } // Kiểm tra 5e: Thời gian task không quá 1 năm // Tính khoảng thời gian bằng miliseconds, sau đó đổi ra ngày

        const timeDiff = taskDueDate.getTime() - taskStartDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        if (daysDiff > 365) {
          // Lỗi này có thể ghi đè lỗi dueDate trước đó
          errors.dueDate = "Thời gian công việc không được vượt quá 1 năm";
        }
      } // Kết thúc khối if kiểm tra tính hợp lệ sau parse
    } // Kết thúc khối if kiểm tra chuỗi ngày có tồn tại // --- Kết thúc LOGIC KIỂM TRA NGÀY THÁNG --- // Log đối tượng lỗi trước khi cập nhật state (có thể bỏ dòng này khi deploy) // console.log("Validation errors:", errors); // Cập nhật state formErrors

    setFormErrors(errors); // Trả về true nếu không có lỗi, false nếu có lỗi

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Vui lòng sửa các lỗi trong biểu mẫu", "error");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      let userId = null; // Thêm biến để lưu userId

      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
        userId = user.id; // Lấy id của user đang đăng nhập
      }

      setSubmitting(true);

      // Prepare request payload
      const payload = {
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        assigneeId: task.assigneeId || null,
        createdBy: userId, // Thêm createdBy là id của user đang đăng nhập
      };

      const url = isNew
        ? "http://localhost:8080/api/tasks"
        : `http://localhost:8080/api/tasks/${task.id}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`${isNew ? "Tạo" : "Cập nhật"} công việc thất bại`);
      }

      const result = await response.json();
      console.log(`Công việc đã được ${isNew ? "tạo" : "cập nhật"}:`, result);

      showSuccessDialog(
        `Công việc đã được ${isNew ? "tạo" : "cập nhật"} thành công!`
      );

      // Tự động quay lại sau khi dialog đóng (sau 1.5 giây)
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } catch (error) {
      showToast(`Lỗi: ${error.message}`, "error");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Lấy token từ localStorage
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      setSubmitting(true);
      const response = await fetch(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Xóa công việc thất bại");
      }

      showSuccessDialog("Công việc đã được xóa thành công!");

      // Tự động quay lại sau khi dialog đóng (sau 1.5 giây)
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
      showToast(`Lỗi: ${error.message}`, "error");
      setSubmitting(false);
    }
  };

  // Thay thế đoạn loading hiện tại trong TaskEdit
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader size={36} className="text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Đang tải dữ liệu công việc...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center text-gray-400 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Quay lại</span>
        </button>

        <h1 className="text-xl font-bold">
          {isNew ? "TẠO CÔNG VIỆC MỚI" : "CHỈNH SỬA CÔNG VIỆC"}
        </h1>

        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={18} className="mr-2" />
            {submitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Đang lưu...
              </>
            ) : (
              "Lưu"
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">
                    Tên{" "}
                    <span className="text-xs text-gray-500">
                      (Tối đa 100 ký tự)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={task.name}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 border ${
                      formErrors.name ? "border-red-500" : "border-gray-600"
                    } rounded-md py-2 px-3 text-white`}
                    placeholder="Nhập tên công việc"
                    maxLength={100}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {task.name ? task.name.length : 0}/100
                  </div>
                </div>

                <div>
                  {/* Description với dấu * */}
                  <label className="block text-gray-400 mb-1">
                    Mô tả{" "}
                    <span className="text-xs text-gray-500">
                      (Tối đa 200 ký tự)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={task.description || ""}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 border ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md py-2 px-3 text-white h-32 resize-none`}
                    placeholder="Nhập mô tả công việc"
                    maxLength={200}
                  ></textarea>
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {task.description ? task.description.length : 0}/200
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Dự án</label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full bg-gray-700 border ${
                        formErrors.projectId
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-md py-2 px-3 text-white text-left flex justify-between items-center`}
                      onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                    >
                      <span>{task.projectName || "Chọn một dự án"}</span>
                      <FolderKanban size={18} className="text-gray-400" />
                    </button>

                    <ProjectModal
                      isOpen={projectMenuOpen}
                      onClose={() => setProjectMenuOpen(false)}
                      projects={projects}
                      onSelect={handleProjectSelect}
                    />
                  </div>
                  {formErrors.projectId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.projectId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">
                      Ngày bắt đầu{" "}
                      <span className="text-xs text-gray-500">
                        (Format: MM/DD/YYYY)
                        {task.projectStartDate &&
                          ` - Dự án bắt đầu vào ${new Date(
                            task.projectStartDate
                          ).toLocaleDateString()}`}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={task.startDate}
                        onChange={handleChange}
                        min={
                          task.projectStartDate ||
                          (isNew
                            ? new Date().toISOString().split("T")[0]
                            : undefined)
                        }
                        max={task.projectDueDate}
                        className={`w-full bg-gray-700 border ${
                          formErrors.startDate
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-2 px-3 text-white`}
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                    {formErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">
                      Ngày kết thúc{" "}
                      <span className="text-xs text-gray-500">
                        (Format: MM/DD/YYYY)
                        {task.projectDueDate &&
                          ` - Dự án kết thúc vào ${new Date(
                            task.projectDueDate
                          ).toLocaleDateString()}`}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dueDate"
                        value={task.dueDate}
                        onChange={handleChange}
                        min={task.startDate}
                        max={task.projectDueDate}
                        className={`w-full bg-gray-700 border ${
                          formErrors.dueDate
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-2 px-3 text-white`}
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                    {formErrors.dueDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={task.status}
                      onChange={handleChange}
                      className={`w-full bg-gray-700 border ${
                        formErrors.status ? "border-red-500" : "border-gray-600"
                      } rounded-md py-2 px-3 text-white`}
                    >
                      <option value="NOT_STARTED">Chưa bắt đầu</option>
                      <option value="IN_PROGRESS">Đang tiến hành</option>
                      <option value="ON_HOLD">Tạm dừng</option>
                    </select>
                    {formErrors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.status}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      name="priority"
                      value={task.priority}
                      onChange={handleChange}
                      className={`w-full bg-gray-700 border ${
                        formErrors.priority
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-md py-2 px-3 text-white`}
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                    </select>
                    {formErrors.priority && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.priority}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tips and Additional Info */}
          <div className="space-y-6">
            {/* Tips Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Mẹo nhanh</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start">
                  <Check
                    size={16}
                    className="text-green-500 mt-0.5 mr-2 shrink-0"
                  />
                  <p>Đặt ngày hạn thực tế để đảm bảo hoàn thành đúng hạn.</p>
                </div>
              </div>
            </div>

            {!isNew && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">
                  Thông tin công việc
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tạo bởi:</span>
                    <span>{task.createdByName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tạo lúc:</span>
                    <span>{new Date(task.createdDate).toLocaleString()}</span>
                  </div>
                  {task.completedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hoàn thành lúc:</span>
                      <span>
                        {new Date(task.completedDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Xóa công việc"
        message="Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác."
      />

      <SuccessDialog
        isOpen={successDialog.show}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ show: false, message: "" })}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default TaskEdit;
