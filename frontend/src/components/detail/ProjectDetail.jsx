import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Users,
  ListChecks,
  PieChart,
  MessageSquare,
  Shield,
  Plus,
  User,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  Paperclip,
  Link2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download,
  Tag,
  X,
} from "lucide-react";

import ProjectEdit from "../edit/ProjectEdit";
import TaskEdit from "../edit/TaskEdit";
import TaskDetail from "./TaskDetail";

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Calculate days remaining
const getDaysRemaining = (endDateString) => {
  const endDate = new Date(endDateString);
  const today = new Date();

  // Set time to beginning of day for accurate day calculation
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Get status color and icon
const getStatusInfo = (status) => {
  switch (status) {
    case "NOT_STARTED":
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        icon: <Clock size={16} />,
        text: "Not Started",
      };
    case "IN_PROGRESS":
      return {
        color: "bg-blue-500",
        textColor: "text-blue-500",
        icon: <Clock size={16} />,
        text: "In Progress",
      };
    case "COMPLETED":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        icon: <CheckCircle size={16} />,
        text: "Completed",
      };
    case "ON_HOLD":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        icon: <AlertCircle size={16} />,
        text: "On Hold",
      };
    case "OVER_DUE":
      return {
        color: "bg-red-500",
        textColor: "text-red-500",
        icon: <AlertTriangle size={16} />,
        text: "Over Due",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        icon: <Clock size={16} />,
        text: status,
      };
  }
};

// Get priority color and text
const getPriorityInfo = (priority) => {
  switch (priority) {
    case "HIGH":
      return {
        color: "bg-red-500",
        textColor: "text-red-500",
        text: "High",
      };
    case "MEDIUM":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        text: "Medium",
      };
    case "LOW":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        text: "Low",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        text: priority,
      };
  }
};

// Member Dropdown Menu Component
const MemberDropdownMenu = ({
  isOpen,
  onClose,
  users,
  onSelect,
  usedUserIds,
}) => {
  if (!isOpen) return null;

  // Lọc ra những user chưa được thêm vào project
  const availableUsers = users.filter((user) => !usedUserIds.includes(user.id));

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">Select Team Member</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        {availableUsers.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>No more users available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => onSelect(user.id)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-medium">{user.fullName}</h4>
                  <p className="text-sm text-gray-400">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Task Item Component
// Task Item Component
const TaskItem = ({ task, index, onTaskDetail, onTaskDeleted }) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden mb-3">
      <div
        className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer hover:bg-gray-750"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-400 w-6">{index + 1}.</div>
          <div className={`h-3 w-3 rounded-full ${statusInfo.color}`}></div>
          <h3 className="font-medium">{task.name}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${priorityInfo.textColor}`}>●</span>
              <span>{priorityInfo.text}</span>
            </div>
            {task.assigneeName && (
              <div className="flex items-center text-sm">
                <User size={14} className="mr-1 text-gray-400" />
                <span>{task.assigneeName}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-1 text-gray-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
          <button>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-3">{task.description}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <div className="flex items-center">
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Priority</p>
              <div className="flex items-center">
                <span className={`mr-1 ${priorityInfo.textColor}`}>●</span>
                <span>{priorityInfo.text}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Start Date</p>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                <span>{formatDate(task.startDate)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Due Date</p>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Hiển thị subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 mb-4">
              <p className="text-xs text-gray-400 mb-2">Subtasks</p>
              <div className="space-y-2 pl-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center">
                    <CheckCircle2
                      size={14}
                      className={
                        subtask.completed
                          ? "text-green-500 mr-2"
                          : "text-gray-400 mr-2"
                      }
                    />
                    <span
                      className={
                        subtask.completed ? "text-gray-400 line-through" : ""
                      }
                    >
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-2">
            <button
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              onClick={() => onTaskDetail(task)}
            >
              Detail
            </button>
            <button
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const storedUser = localStorage.getItem("user");
                  let token = null;
                  if (storedUser) {
                    const user = JSON.parse(storedUser);
                    token = user.accessToken;
                  }

                  // Dùng ConfirmationDialog thay vì window.confirm
                  if (
                    window.confirm(
                      "Are you sure you want to delete this task? This action cannot be undone."
                    )
                  ) {
                    await axios.delete(
                      `http://localhost:8080/api/tasks/${task.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    // Thay vì reload toàn bộ trang, gọi API lấy dữ liệu project mới nhất
                    const projectResponse = await axios.get(
                      `http://localhost:8080/api/projects/${task.projectId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    // Dùng callback để cập nhật dữ liệu
                    onTaskDeleted(projectResponse.data);
                  }
                } catch (error) {
                  console.error("Error deleting task:", error);
                  alert("Failed to delete task. Please try again.");
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Member Component
const TeamMember = ({ user }) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
      {user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)}
    </div>
    <div>
      <h4 className="font-medium">{user.fullName}</h4>
      <p className="text-sm text-gray-400">{user.role}</p>
    </div>
  </div>
);

// Tag Component
const TagItem = ({ tag }) => (
  <div
    className="inline-flex items-center px-3 py-1 rounded-full text-sm mr-2 mb-2"
    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
  >
    <Tag size={12} className="mr-1" />
    {tag.name}
  </div>
);

// Tab Component
const Tab = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-3 border-b-2 ${
      active
        ? "border-purple-500 text-purple-500"
        : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
    }`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Thêm component này vào trước hoặc sau component chính
const TagDropdownMenu = ({ isOpen, onClose, tags, onSelect, usedTagIds }) => {
  if (!isOpen) return null;

  // Lọc ra những tag chưa được sử dụng
  const availableTags = tags.filter((tag) => !usedTagIds.includes(tag.id));

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">Select Tag</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        {availableTags.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>No more tags available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableTags.map((tag) => (
              <div
                key={tag.id}
                className="cursor-pointer flex items-center px-3 py-2 rounded-md hover:bg-gray-700"
                style={{ borderLeft: `4px solid ${tag.color}` }}
                onClick={() => onSelect(tag.id)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <span>{tag.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDetail = ({ project: initialProject, onBack: navigateBack }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [loadingTag, setLoadingTag] = useState(false);
  const [tagError, setTagError] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [memberError, setMemberError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const onBack = (needRefresh) => {
    if (needRefresh) {
      fetchProjectData();
    } else {
      navigateBack();
    }
  };

  // Thêm hàm xử lý task bị xóa
  const handleTaskDeleted = (updatedProject) => {
    // Cập nhật state project với dữ liệu mới
    setProject(updatedProject);
    // Hiển thị thông báo
    showToast("Task deleted successfully", "success");
  };

  const openTaskDetail = async (task) => {
    try {
      setTaskLoading(true);
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      // Gọi API để lấy chi tiết task
      const response = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật task với dữ liệu chi tiết từ API
      setSelectedTask(response.data);
      setShowTaskDetail(true);
    } catch (error) {
      console.error("Error fetching task details:", error);
      showToast("Failed to load task details", "error");
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        const response = await axios.get(
          "http://localhost:8080/api/users/active",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // Thêm hàm xử lý Delete Project
  // Trong ProjectDetail.jsx

const handleDeleteProject = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    await axios.delete(`http://localhost:8080/api/projects/${project.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    showToast("Project deleted successfully", "success");

    // Thay đổi ở đây: chuyển trực tiếp về trang Project
    setTimeout(() => {
      navigateBack(true); // Truyền tham số true để báo hiệu cần refresh dữ liệu
    }, 1000);
  } catch (err) {
    console.error("Error deleting project:", err);
    showToast("Failed to delete project", "error");
  }
};

  // Hàm hiển thị toast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm thêm member vào project
  const handleAddMember = async (userId) => {
    if (!project || !userId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingMember(true);
    setMemberError(null);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/projects/${project.id}/members/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
      setMembersMenuOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
      setMemberError("Failed to add member. Please try again.");
    } finally {
      setLoadingMember(false);
    }
  };

  // Hàm xóa member khỏi project
  const handleRemoveMember = async (userId) => {
    if (!project || !userId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingMember(true);
    setMemberError(null);

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/projects/${project.id}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error("Error removing member:", error);
      setMemberError("Failed to remove member. Please try again.");
    } finally {
      setLoadingMember(false);
    }
  };

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        const response = await axios.get("http://localhost:8080/api/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllTags(response.data.content || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchAllTags();
  }, []);

  const handleAddTag = async (tagId) => {
    if (!project || !tagId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingTag(true);
    setTagError(null);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/projects/${project.id}/tags/${tagId}`,
        {}, // empty data object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
      setTagsMenuOpen(false);
    } catch (error) {
      console.error("Error adding tag:", error);
      setTagError("Failed to add tag. Please try again.");
    } finally {
      setLoadingTag(false);
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (!project || !tagId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingTag(true);
    setTagError(null);

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/projects/${project.id}/tags/${tagId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error("Error removing tag:", error);
      setTagError("Failed to remove tag. Please try again.");
    } finally {
      setLoadingTag(false);
    }
  };

  // Load project data
  useEffect(() => {
    if (initialProject) {
      // If project is passed as prop
      setProject(initialProject);
      setLoading(false);
    } else {
      // If we need to fetch project
      fetchProjectData();
    }
  }, [initialProject]);

  const fetchProjectData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get(
        `http://localhost:8080/api/projects/${initialProject.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-gray-400">
          The requested project could not be found.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
          onClick={() => onBack(false)}
        >
          Back
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(project.status);
  const daysRemaining = getDaysRemaining(project.dueDate);

// Trong ProjectDetail.jsx - phần render TaskEdit

if (showTaskEdit) {
  return (
    <TaskEdit
      isNew={true}
      projectId={project.id}
      projectName={project.name}
      onBack={(needRefresh) => {
        setShowTaskEdit(false);
        if (needRefresh) {
          // Fetch lại dữ liệu project khi task được thêm thành công
          fetchProjectData();
        }
      }}
    />
  );
}

  return (
    <>
      {showTaskDetail ? (
        taskLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <TaskDetail
            task={selectedTask}
            onBack={(needRefresh) => {
              setShowTaskDetail(false);
              setSelectedTask(null);

              // Nếu needRefresh là true, cập nhật lại dữ liệu project
              if (needRefresh) {
                const fetchProjectData = async () => {
                  try {
                    const storedUser = localStorage.getItem("user");
                    let token = null;
                    if (storedUser) {
                      const user = JSON.parse(storedUser);
                      token = user.accessToken;
                    }

                    const response = await axios.get(
                      `http://localhost:8080/api/projects/${project.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    setProject(response.data);
                  } catch (error) {
                    console.error("Error fetching project details:", error);
                    showToast("Failed to refresh project data", "error");
                  }
                };

                fetchProjectData();
              }
            }}
          />
        )
      ) : (
        <div className="p-6 bg-gray-900 text-white rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              className="flex items-center text-gray-400 hover:text-white"
              onClick={() => onBack(false)}
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>

          {/* Project Title and Status */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h1 className="text-2xl font-bold mr-3">{project.name}</h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} bg-opacity-20 ${statusInfo.textColor}`}
              >
                {statusInfo.text}
              </div>
            </div>
            <p className="text-gray-300">{project.description}</p>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap">
                {project.tags.map((tag) => (
                  <TagItem key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Timeline</p>
                  <p className="font-medium">
                    {formatDate(project.startDate)} -{" "}
                    {formatDate(project.dueDate)}
                  </p>
                </div>
                <Calendar size={20} className="text-purple-500" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Days Remaining</p>
                  <p className="font-medium">
                    {daysRemaining > 0
                      ? `${daysRemaining} days left`
                      : daysRemaining === 0
                      ? "Due today"
                      : project.status === "COMPLETED"
                      ? "Completed"
                      : `${Math.abs(daysRemaining)} days overdue`}
                  </p>
                </div>
                <Clock
                  size={20}
                  className={
                    daysRemaining < 0 && project.status !== "COMPLETED"
                      ? "text-red-500"
                      : "text-purple-500"
                  }
                />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Team Members</p>
                  <p className="font-medium">{project.users.length} members</p>
                </div>
                <Users size={20} className="text-purple-500" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tasks Progress</p>
                  <p className="font-medium">
                    {project.totalCompletedTasks}/{project.totalTasks} completed
                  </p>
                </div>
                <ListChecks size={20} className="text-purple-500" />
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <div className="flex overflow-x-auto hide-scrollbar">
              <Tab
                icon={<ListChecks size={18} />}
                label="Tasks"
                active={activeTab === "tasks"}
                onClick={() => setActiveTab("tasks")}
              />
              <Tab
                icon={<Users size={18} />}
                label="Team"
                active={activeTab === "team"}
                onClick={() => setActiveTab("team")}
              />
              <Tab
                icon={<Tag size={18} />}
                label="Tags"
                active={activeTab === "tags"}
                onClick={() => setActiveTab("tags")}
              />
              
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === "tasks" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Project Tasks</h2>
                  <button
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                    onClick={() => setShowTaskEdit(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </button>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total</div>
                      <div className="text-2xl font-bold">
                        {project.totalTasks}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        In Progress
                      </div>
                      <div className="text-2xl font-bold text-blue-500">
                        {
                          project.tasks.filter(
                            (t) => t.status === "IN_PROGRESS"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Completed
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        {
                          project.tasks.filter((t) => t.status === "COMPLETED")
                            .length
                        }
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Not Started
                      </div>
                      <div className="text-2xl font-bold text-gray-500">
                        {
                          project.tasks.filter(
                            (t) => t.status === "NOT_STARTED"
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {project.tasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                      <ListChecks
                        size={48}
                        className="mx-auto mb-3 opacity-50"
                      />
                      <p>No tasks found for this project.</p>
                      <button
                        className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
                        onClick={() => setShowTaskEdit(true)}
                      >
                        Add your first task
                      </button>
                    </div>
                  ) : (
                    project.tasks.map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={{ ...task, projectId: project.id }}
                        onTaskDeleted={handleTaskDeleted}
                        index={index}
                        onTaskDetail={openTaskDetail}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Team Members</h2>
                  <div className="relative">
                    <button
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                      onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                      disabled={loadingMember}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Member
                      {loadingMember && (
                        <span className="ml-2 animate-spin">⟳</span>
                      )}
                    </button>

                    {/* Member Dropdown Menu */}
                    <MemberDropdownMenu
                      isOpen={membersMenuOpen}
                      onClose={() => setMembersMenuOpen(false)}
                      users={allUsers}
                      onSelect={handleAddMember}
                      usedUserIds={project.users.map((user) => user.id)}
                    />
                  </div>
                </div>

                {memberError && (
                  <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md">
                    {memberError}
                  </div>
                )}

                {project.managerId && (
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-3 text-purple-400 flex items-center">
                      <Shield size={16} className="mr-2" />
                      Project Manager
                    </h3>
                    <div className="bg-purple-900 bg-opacity-30 border border-purple-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                            {project.managerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">
                              {project.managerName}
                            </h4>
                            {/* Tạm thời bỏ qua position và department nếu không có */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-md font-medium mb-3 flex items-center">
                  <Users size={16} className="mr-2" />
                  Team Members
                </h3>

                {project.users.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No team members assigned to this project yet.</p>
                    <button
                      className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
                      onClick={() => setMembersMenuOpen(true)}
                    >
                      Add team members
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.users
                      .filter((user) => user.id !== project.managerId)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-medium">{user.fullName}</h4>
                              <p className="text-sm text-gray-400">
                                {user.position}
                              </p>
                            </div>
                          </div>
                          <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"
                            onClick={() => handleRemoveMember(user.id)}
                            disabled={loadingMember}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tags" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Project Tags</h2>
                  <div className="relative">
                    <button
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                      onClick={() => setTagsMenuOpen(!tagsMenuOpen)}
                      disabled={loadingTag}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Tag
                      {loadingTag && (
                        <span className="ml-2 animate-spin">⟳</span>
                      )}
                    </button>

                    {/* Tag Dropdown Menu */}
                    <TagDropdownMenu
                      isOpen={tagsMenuOpen}
                      onClose={() => setTagsMenuOpen(false)}
                      tags={allTags}
                      onSelect={handleAddTag}
                      usedTagIds={
                        project.tags ? project.tags.map((tag) => tag.id) : []
                      }
                    />
                  </div>
                </div>

                {tagError && (
                  <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md">
                    {tagError}
                  </div>
                )}

                {!project.tags || project.tags.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                    <Tag size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No tags assigned to this project yet.</p>
                    <button
                      className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
                      onClick={() => setTagsMenuOpen(true)}
                    >
                      Add your first tag
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex flex-wrap">
                      {project.tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between bg-gray-700 rounded-lg p-3 mr-4 mb-4"
                          style={{ borderLeft: `4px solid ${tag.color}` }}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: tag.color }}
                            ></div>
                            <span>{tag.name}</span>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              className="p-1 hover:bg-gray-600 rounded"
                              onClick={() => handleRemoveTag(tag.id)}
                              disabled={loadingTag}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Confirmation Dialog for Deleting Project */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
                <h2 className="text-xl font-bold mb-4">Delete Project</h2>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md flex items-center gap-2"
                    onClick={handleDeleteProject}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-4 right-4 ${
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
              } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProjectDetail;
