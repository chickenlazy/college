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

// Mock task data for editing example
const mockTask = {
  id: 2,
  name: "UI/UX Design",
  description:
    "Create wireframes, mockups, and design system for the application. This includes creating a consistent design language, color palette, typography scale, and component library that can be used across the entire application. The design should be modern, accessible, and responsive for all device sizes.",
  assigneeId: 2,
  assigneeName: "Jane Smith",
  assigneeEmail: "jane.smith@example.com",
  assigneeAvatar: null,
  assigneeRole: "UI/UX Designer",
  projectId: 31,
  projectName: "Đồ án tốt nghiệp updated",
  createdBy: "John Doe",
  createdAt: "2025-03-25T10:00:00",
  startDate: "2025-03-25T10:00:00",
  dueDate: "2025-04-05T17:00:00",
  completedDate: null,
  status: "IN_PROGRESS",
  priority: "HIGH",
  progress: 40,
  subtasks: [
    {
      id: 21,
      name: "Create wireframes",
      completed: true,
    },
    {
      id: 22,
      name: "Design mockups",
      completed: true,
    },
    {
      id: 23,
      name: "Create design system",
      completed: false,
    },
    {
      id: 24,
      name: "Export assets for developers",
      completed: false,
    },
  ],
  dependencies: [
    {
      id: 1,
      name: "Project Planning and Requirements Gathering",
      status: "COMPLETED",
    },
  ],
  tags: [
    { id: 1, name: "Design", color: "#EC4899" },
    { id: 3, name: "Frontend", color: "#3B82F6" },
  ],
};

// Mock projects data for project selection
const mockProjects = [
  {
    id: 31,
    name: "Đồ án tốt nghiệp updated",
    status: "IN_PROGRESS",
  },
  {
    id: 2,
    name: "Project B",
    status: "IN_PROGRESS",
  },
  {
    id: 3,
    name: "Project C",
    status: "COMPLETED",
  },
  {
    id: 4,
    name: "Project D",
    status: "ON_HOLD",
  },
];

// Mock user data for assignee selection
const mockUsers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    avatar: null,
    role: "Project Manager",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    avatar: null,
    role: "UI/UX Designer",
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    avatar: null,
    role: "Frontend Developer",
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    avatar: null,
    role: "Backend Developer",
  },
];

// Mock tags data for tag selection
const mockAllTags = [
  { id: 1, name: "Design", color: "#EC4899" },
  { id: 2, name: "Research", color: "#8B5CF6" },
  { id: 3, name: "Frontend", color: "#3B82F6" },
  { id: 4, name: "Backend", color: "#10B981" },
  { id: 5, name: "Testing", color: "#F59E0B" },
  { id: 6, name: "Documentation", color: "#6B7280" },
];

// Mock tasks for dependencies
const mockAllTasks = [
  {
    id: 1,
    name: "Project Planning and Requirements Gathering",
    status: "COMPLETED",
  },
  {
    id: 3,
    name: "Database Design",
    status: "IN_PROGRESS",
  },
  {
    id: 5,
    name: "Backend Development",
    status: "NOT_STARTED",
  },
  {
    id: 6,
    name: "Integration and Testing",
    status: "NOT_STARTED",
  },
];

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
              ? users.find(u => u.id === subtask.assigneeId)?.fullName || 'Select'
              : 'Assign'}
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
  // task
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
          projectId: null,
          projectName: "",
          assigneeId: null,
          assigneeName: "",
          startDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
            .toISOString()
            .split("T")[0],
          status: "NOT_STARTED",
          priority: "MEDIUM",
          progress: 0,
          subtasks: [],
          dependencies: [],
          tags: [],
        }
      : null
  );

  const [loading, setLoading] = useState(!isNew);
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
        // Fetch projects
        const projectsResponse = await fetch(
          "http://localhost:8080/api/projects"
        );
        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.content);

        // Fetch users
        const usersResponse = await fetch("http://localhost:8080/api/users");
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData.content);

        // If editing existing task, fetch task data
        if (!isNew && taskId) {
          const taskResponse = await fetch(
            `http://localhost:8080/api/tasks/${taskId}`
          );
          if (!taskResponse.ok) {
            throw new Error("Failed to fetch task");
          }
          const taskData = await taskResponse.json();
          setTask(taskData);
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

// Sửa đoạn code từ dòng 470-482
const handleAddSubtask = () => {
  if (newSubtask.trim() !== "") {
    const newSubtaskObj = {
      id: Date.now(), // Temporary ID
      name: newSubtask.trim(),
      completed: false,
      assigneeId: null
    };

    setTask({
      ...task,
      subtasks: [...task.subtasks, newSubtaskObj],
    });
    setNewSubtask("");
  }
};

  const handleSubtaskChange = (subtaskId, completed) => {
    setTask({
      ...task,
      subtasks: task.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed } : subtask
      ),
    });
  };

  const handleRemoveSubtask = (subtaskId) => {
    setTask({
      ...task,
      subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
    });
  };

  const calculateProgress = () => {
    if (task.subtasks.length === 0) {
      return task.progress;
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

      // API endpoint and method based on whether creating or editing
      const url = isNew
        ? "http://localhost:8080/api/tasks"
        : `http://localhost:8080/api/tasks/${task.id}`;

      const method = isNew ? "POST" : "PUT";

      // Send request to API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isNew ? "create" : "update"} task`);
      }

      const result = await response.json();
      console.log(`Task ${isNew ? "created" : "updated"}:`, result);

      // Show success message and go back
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
      setSubmitting(true);
      const response = await fetch(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          method: "DELETE",
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
                    <span>{task.createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created at:</span>
                    <span>{new Date(task.createdAt).toLocaleString()}</span>
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
