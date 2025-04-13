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
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
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
                "Select"
              : "Assign"}
          </span>
        </div>

        <DropdownMenu
          isOpen={assigneeMenuOpen}
          onClose={() => setAssigneeMenuOpen(false)}
          title="Select Assignee"
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
          assigneeId: null,
          assigneeName: "",
          startDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
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
        projectsResponse = await fetch(
          "http://localhost:8080/api/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const projectsData = await projectsResponse.json();
      
      // Cập nhật xử lý danh sách projects dựa vào định dạng response
      // Nếu là API phân trang, projectsData sẽ có thuộc tính content
      // Nếu là API không phân trang, projectsData sẽ là một mảng
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.content);
      
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
        throw new Error("Failed to fetch users");
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
          throw new Error("Failed to fetch task");
        }
        const taskData = await taskResponse.json();
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
        });
      }

      // If we have a projectId from props, set it in the task
      if (projectId && isNew) {
        // Cập nhật cách tìm project để phù hợp với cả hai loại response
        const projectsList = Array.isArray(projectsData) ? projectsData : projectsData.content;
        const project = projectsList.find((p) => p.id === projectId);
        if (project) {
          setTask((prev) => ({
            ...prev,
            projectId,
            projectName: project.name,
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

  // Sửa đoạn code từ dòng 422-429
  const handleAssigneeSelect = (user) => {
    setTask({
      ...task,
      assigneeId: user.id,
      assigneeName: user.fullName,
      assigneeRole: user.role,
    });
    setAssigneeMenuOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ theo ngày

    // Validate task name
    if (!task.name.trim()) {
      errors.name = "Task name is required";
    } else if (task.name.length > 100) {
      errors.name = "Task name cannot exceed 100 characters";
    }

    // Validate description (không bắt buộc nhưng giới hạn độ dài)
    if (task.description && task.description.length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }

    // Validate project selection
    if (!task.projectId) {
      errors.projectId = "Project is required";
    }

    // Validate start date
    // Validate start date
    if (!task.startDate) {
      errors.startDate = "Start date is required";
    } else if (isNew && new Date(task.startDate) < today) {
      errors.startDate = "Start date cannot be in the past";
    }

    // Validate due date
    if (!task.dueDate) {
      errors.dueDate = "Due date is required";
    } else if (new Date(task.dueDate) <= new Date(task.startDate)) {
      errors.dueDate = "Due date must be after start date";
    }

    // Tính thời gian giữa startDate và dueDate (giới hạn tối đa là 1 năm)
    const timeDiff = new Date(task.dueDate) - new Date(task.startDate);
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    if (daysDiff > 365) {
      errors.dueDate = "Task duration cannot exceed 1 year";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
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
        createdBy: userId // Thêm createdBy là id của user đang đăng nhập
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
        throw new Error(`Failed to ${isNew ? "create" : "update"} task`);
      }
  
      const result = await response.json();
      console.log(`Task ${isNew ? "created" : "updated"}:`, result);
  
      showSuccessDialog(`Task ${isNew ? "created" : "updated"} successfully!`);
  
      // Tự động quay lại sau khi dialog đóng (sau 1.5 giây)
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
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
        throw new Error("Failed to delete task");
      }

      showSuccessDialog("Task deleted successfully!");

      // Tự động quay lại sau khi dialog đóng (sau 1.5 giây)
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast(`Error: ${error.message}`, "error");
      setSubmitting(false);
    }
  };

  // Thay thế đoạn loading hiện tại trong TaskEdit
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader size={36} className="text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading task data...</p>
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
          <span>Back</span>
        </button>

        <h1 className="text-xl font-bold">
          {isNew ? "CREATE NEW TASK" : "EDIT TASK"}
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
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">
                    Task Name *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 100 characters)
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
                    placeholder="Enter task name"
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
                  <label className="block text-gray-400 mb-1">
                    Description{" "}
                    <span className="text-xs text-gray-500">
                      (Max 200 characters)
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
                    placeholder="Enter task description"
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
                  <label className="block text-gray-400 mb-1">Project *</label>
                  <div className="relative">
                    <div
                      className={`w-full bg-gray-700 border ${
                        formErrors.projectId
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-md py-2 px-3 text-white cursor-pointer flex justify-between items-center`}
                      onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                    >
                      <span>{task.projectName || "Select a project"}</span>
                      <FolderKanban size={18} className="text-gray-400" />
                    </div>
                    <DropdownMenu
                      isOpen={projectMenuOpen}
                      onClose={() => setProjectMenuOpen(false)}
                      title="Select Project"
                    >
                      <div className="space-y-1">
                        {projects.map((project) => (
                          <ProjectOption
                            key={project.id}
                            project={project}
                            isSelected={project.id === task.projectId}
                            onSelect={handleProjectSelect}
                          />
                        ))}
                      </div>
                    </DropdownMenu>
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
                      Start Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={task.startDate}
                        onChange={handleChange}
                        min={
                          isNew
                            ? new Date().toISOString().split("T")[0]
                            : undefined
                        }
                        className={`w-full bg-gray-700 border ${
                          formErrors.startDate
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-2 px-3 text-white`}
                      />
                      <Calendar
                        size={18}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                      Due Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dueDate"
                        value={task.dueDate}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${
                          formErrors.dueDate
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-2 px-3 text-white`}
                      />
                      <Calendar
                        size={18}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                    <label className="block text-gray-400 mb-1">Status</label>
                    <select
                      name="status"
                      value={task.status}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      {/* <option value="COMPLETED">Completed</option> */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={task.priority}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tips and Additional Info */}
          <div className="space-y-6">
            {/* Tips Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Quick Tips</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start">
                  <Check
                    size={16}
                    className="text-green-500 mt-0.5 mr-2 shrink-0"
                  />
                  <p>Set realistic due dates to ensure timely completion.</p>
                </div>
              </div>
            </div>

            {!isNew && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Task Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created by:</span>
                    <span>{task.createdByName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created at:</span>
                    <span>{new Date(task.createdDate).toLocaleString()}</span>
                  </div>
                  {task.completedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed at:</span>
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
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />

      <SuccessDialog
        isOpen={successDialog.show}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ show: false, message: "" })}
      />
    </div>
  );
};

export default TaskEdit;
