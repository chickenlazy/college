import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Calendar,
  Clock,
  User,
  Flag,
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
          subtasks: [], // Khởi tạo mảng rỗng
          dependencies: [], // Khởi tạo mảng rỗng
          tags: [], // Khởi tạo mảng rỗng
        }
      : {
          ...initialTask,
          subtasks: initialTask.subtasks || [], // Đảm bảo subtasks luôn là mảng
          dependencies: initialTask.dependencies || [], // Đảm bảo dependencies luôn là mảng
          tags: initialTask.tags || [], // Đảm bảo tags luôn là mảng
        }
  );

  const [loading, setLoading] = useState(!isNew && !initialTask);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [dependenciesMenuOpen, setDependenciesMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newSubtask, setNewSubtask] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Load task data when editing existing task
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        // Fetch projects
        const projectsResponse = await fetch(
          "http://localhost:8080/api/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.content);

        // Fetch users
        const usersResponse = await fetch("http://localhost:8080/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData.content);

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
            startDate: taskData.startDate ? new Date(taskData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            subtasks: taskData.subtasks || [],
            dependencies: taskData.dependencies || [],
            tags: taskData.tags || []
          });
        }

        // If we have a projectId from props, set it in the task
        if (projectId && isNew) {
          const project = projectsData.content.find((p) => p.id === projectId);
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

  const handleAddTag = (tag) => {
    // Check if tag is already in the task
    if (!task.tags.find((t) => t.id === tag.id)) {
      setTask({
        ...task,
        tags: [...task.tags, tag],
      });
    }
    setTagsMenuOpen(false);
  };

  const handleRemoveTag = (tagId) => {
    setTask({
      ...task,
      tags: task.tags.filter((tag) => tag.id !== tagId),
    });
  };

  const handleAddDependency = (dependency) => {
    // Check if dependency is already in the task
    if (!task.dependencies.find((d) => d.id === dependency.id)) {
      setTask({
        ...task,
        dependencies: [...task.dependencies, dependency],
      });
    }
    setDependenciesMenuOpen(false);
  };

  const handleRemoveDependency = (dependencyId) => {
    setTask({
      ...task,
      dependencies: task.dependencies.filter((dep) => dep.id !== dependencyId),
    });
  };

  const handleAddSubtask = async () => {
    if (newSubtask.trim() !== "") {
      const newSubtaskObj = {
        name: newSubtask.trim(),
        completed: false,
        taskId: task.id, // Gửi taskId từ task hiện tại
        assigneeId: null, // Giả sử assigneeId là null cho subtask mới
      };
  
      try {
        // Nếu là task mới, không gửi Subtask ngay mà chỉ thêm tạm thời vào state
        if (isNew) {
          setTask({
            ...task,
            subtasks: [...task.subtasks, newSubtaskObj], // Thêm tạm thời vào state
          });
          setNewSubtask(""); // Xóa nội dung ô input
          return; // Không cần gửi yêu cầu POST ngay khi task mới
        }
  
        // Gửi yêu cầu POST để thêm subtask mới
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }
  
        const response = await fetch("http://localhost:8080/api/subtasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSubtaskObj),
        });
  
        if (!response.ok) {
          throw new Error("Failed to add subtask");
        }
  
        const subtaskData = await response.json();
  
        // Cập nhật task với subtask mới
        setTask({
          ...task,
          subtasks: [...task.subtasks, subtaskData], // Thêm subtask mới vào task
        });
  
        setNewSubtask(""); // Xóa nội dung ô input
      } catch (error) {
        console.error("Error adding subtask:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };
  
  
  

  const handleSubtaskChange = async (subtaskId, completed) => {
    try {
      // Gửi yêu cầu PUT để toggle trạng thái subtask
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }
  
      const response = await fetch(`http://localhost:8080/api/subtasks/${subtaskId}/toggle`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to toggle subtask completion");
      }
  
      // Cập nhật trạng thái subtask trong state
      setTask({
        ...task,
        subtasks: task.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, completed } : subtask
        ),
      });
    } catch (error) {
      console.error("Error toggling subtask completion:", error);
      alert(`Error: ${error.message}`);
    }
  };
  

  const handleRemoveSubtask = async (subtaskId) => {
    try {
      // Gửi yêu cầu DELETE tới API
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }
  
      const response = await fetch(`http://localhost:8080/api/subtasks/${subtaskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete subtask");
      }
  
      // Cập nhật state sau khi xóa thành công
      setTask({
        ...task,
        subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
      });
    } catch (error) {
      console.error("Error deleting subtask:", error);
      alert(`Error: ${error.message}`);
    }
  };
  

  const calculateProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.progress || 0;
    }

    const completedCount = task.subtasks.filter(
      (subtask) => subtask.completed
    ).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  const validateForm = () => {
    const errors = {};

    if (!task.name.trim()) {
      errors.name = "Task name is required";
    }

    if (!task.projectId) {
      errors.projectId = "Project is required";
    }

    if (!task.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!task.dueDate) {
      errors.dueDate = "Due date is required";
    } else if (new Date(task.dueDate) <= new Date(task.startDate)) {
      errors.dueDate = "Due date must be after start date";
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
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }
  
      setSubmitting(true);
  
      // Prepare subtask requests
      const subtaskRequests = task.subtasks.map((subtask) => ({
        name: subtask.name,
        completed: subtask.completed,
        assigneeId: subtask.assigneeId || null,
      }));
  
      // Prepare request payload
      const payload = {
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        subtaskRequests,
      };
  
      // If task has an assignee, add it to the payload
      if (task.assigneeId) {
        payload.assigneeId = task.assigneeId;
      }
  
      const url = isNew
        ? "http://localhost:8080/api/tasks"
        : `http://localhost:8080/api/tasks/${task.id}`;
  
      const method = isNew ? "POST" : "PUT";
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token to headers
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to ${isNew ? "create" : "update"} task`);
      }
  
      const result = await response.json();
      console.log(`Task ${isNew ? "created" : "updated"}:`, result);
  
      alert(`Task ${isNew ? "created" : "updated"} successfully!`);
      onBack();
    } catch (error) {
      console.error(`Error ${isNew ? "creating" : "updating"} task:`, error);
      alert(`Error: ${error.message}`);
    } finally {
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
            Authorization: `Bearer ${token}`, // Thêm token vào headers
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      alert("Task deleted successfully!");
      onBack();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
          <span>Back to Project Detail</span>
        </button>

        <h1 className="text-xl font-bold">
          {isNew ? "CREATE NEW TASK" : "EDIT TASK"}
        </h1>

        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center"
            onClick={handleSubmit}
          >
            <Save size={18} className="mr-2" />
            Save
          </button>
          {!isNew && (
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md flex items-center"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} className="mr-2" />
              Delete
            </button>
          )}
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
                    Task Name *
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
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-32 resize-none"
                    placeholder="Enter task description"
                  ></textarea>
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
                      <option value="COMPLETED">Completed</option>
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

                <div>
                  <label className="block text-gray-400 mb-1">Assignee</label>
                  <div className="relative">
                    <div
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white cursor-pointer flex justify-between items-center"
                      onClick={() => setAssigneeMenuOpen(!assigneeMenuOpen)}
                    >
                      {task.assigneeId ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs mr-2">
                            {task.assigneeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span>{task.assigneeName}</span>
                        </div>
                      ) : (
                        <span>Unassigned</span>
                      )}
                      <User size={18} className="text-gray-400" />
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
                            isSelected={user.id === task.assigneeId}
                            onSelect={handleAssigneeSelect}
                          />
                        ))}
                      </div>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Subtasks</h2>

              <div className="mb-4 flex">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 text-white"
                  placeholder="Add a subtask"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-md"
                  onClick={handleAddSubtask}
                >
                  <Plus size={18} />
                </button>
              </div>

              <div>
                {task.subtasks.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No subtasks added yet.
                  </p>
                ) : (
                  task.subtasks.map((subtask) => (
                    <Subtask
                      key={subtask.id}
                      subtask={subtask}
                      onChange={handleSubtaskChange}
                      onRemove={handleRemoveSubtask}
                      users={users}
                    />
                  ))
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      calculateProgress() >= 100
                        ? "bg-green-500"
                        : calculateProgress() > 0
                        ? "bg-blue-500"
                        : "bg-gray-600"
                    }`}
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tags and Additional Info */}
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
                  <p>
                    Break down complex tasks into smaller subtasks for better
                    tracking.
                  </p>
                </div>
                <div className="flex items-start">
                  <Check
                    size={16}
                    className="text-green-500 mt-0.5 mr-2 shrink-0"
                  />
                  <p>Set realistic due dates to ensure timely completion.</p>
                </div>
                <div className="flex items-start">
                  <Check
                    size={16}
                    className="text-green-500 mt-0.5 mr-2 shrink-0"
                  />
                  <p>
                    Add dependencies to maintain the correct workflow sequence.
                  </p>
                </div>
                <div className="flex items-start">
                  <Check
                    size={16}
                    className="text-green-500 mt-0.5 mr-2 shrink-0"
                  />
                  <p>Use tags to categorize and easily filter tasks later.</p>
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
    </div>
  );
};

export default TaskEdit;
