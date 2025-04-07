import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Pause,
  Edit,
  Trash2,
  Clock,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Paperclip,
  Link2,
  Flag,
  MoreVertical,
  ChevronDown,
  X,
  Plus,
} from "lucide-react";
import TaskEdit from "../edit/TaskEdit";

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const StatusBadge = ({ status }) => {
  let color;
  let icon;
  let displayText = status.replace(/_/g, " ");

  switch (status) {
    case "NOT_STARTED":
      color = "bg-gray-200 text-gray-800";
      icon = <Clock size={16} />;
      break;
    case "IN_PROGRESS":
      color = "bg-blue-200 text-blue-800";
      icon = <Clock size={16} />;
      break;
    case "COMPLETED":
      color = "bg-green-200 text-green-800";
      icon = <CheckCircle size={16} />;
      break;
    case "OVER_DUE":
      color = "bg-red-200 text-red-800";
      icon = <AlertTriangle size={16} />;
      break;
    case "ON_HOLD":
      color = "bg-yellow-200 text-yellow-800";
      icon = <Pause size={16} />;
      break;
    default:
      color = "bg-gray-200 text-gray-800";
      icon = <Clock size={16} />;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${color} whitespace-nowrap min-w-[120px] justify-center`}
    >
      {icon}
      <span>{displayText}</span>
    </span>
  );
};

// Format datetime for display
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get days remaining
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

// Get status icon and color
const getStatusInfo = (status) => {
  switch (status) {
    case "NOT_STARTED":
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: <Clock size={16} />,
        text: "Not Started",
      };
    case "IN_PROGRESS":
      return {
        color: "bg-blue-500",
        textColor: "text-blue-500",
        bgColor: "bg-blue-100",
        icon: <Clock size={16} />,
        text: "In Progress",
      };
    case "COMPLETED":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        bgColor: "bg-green-100",
        icon: <CheckCircle size={16} />,
        text: "Completed",
      };
    case "ON_HOLD":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-100",
        icon: <AlertTriangle size={16} />,
        text: "On Hold",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: <Clock size={16} />,
        text: status.replace(/_/g, " "),
      };
  }
};

// Get priority color and icon
const getPriorityInfo = (priority) => {
  switch (priority) {
    case "HIGH":
      return {
        color: "bg-red-500",
        textColor: "text-red-500",
        bgColor: "bg-red-100",
        icon: <Flag size={16} />,
        text: "High",
      };
    case "MEDIUM":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-100",
        icon: <Flag size={16} />,
        text: "Medium",
      };
    case "LOW":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        bgColor: "bg-green-100",
        icon: <Flag size={16} />,
        text: "Low",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: <Flag size={16} />,
        text: priority,
      };
  }
};

// Get file icon based on file type
const getFileIcon = (fileType) => {
  if (fileType.includes("image")) {
    return "🖼️";
  } else if (fileType.includes("pdf")) {
    return "📄";
  } else if (fileType.includes("zip") || fileType.includes("rar")) {
    return "🗜️";
  } else if (fileType.includes("fig")) {
    return "🎨";
  } else {
    return "📎";
  }
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  let icon;
  let colorClass = "bg-gray-500";

  switch (activity.type) {
    case "CREATED":
      icon = <Plus size={14} />;
      colorClass = "bg-purple-500";
      break;
    case "ASSIGNED":
      icon = <User size={14} />;
      colorClass = "bg-blue-500";
      break;
    case "STATUS_CHANGE":
      icon = <Clock size={14} />;
      colorClass = "bg-yellow-500";
      break;
    case "SUBTASK_COMPLETED":
      icon = <CheckCircle size={14} />;
      colorClass = "bg-green-500";
      break;
    case "ATTACHMENT_ADDED":
      icon = <Paperclip size={14} />;
      colorClass = "bg-indigo-500";
      break;
    case "COMMENT_ADDED":
      icon = <MessageSquare size={14} />;
      colorClass = "bg-blue-400";
      break;
    default:
      icon = <Clock size={14} />;
  }

  return (
    <div className="relative pl-6 pb-5 group">
      <div
        className={`absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass} text-white`}
      >
        {icon}
      </div>
      <div className="ml-4">
        <div className="font-medium">{activity.details}</div>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>{activity.user}</span>
          <span>•</span>
          <span>{new Date(activity.timestamp).toLocaleString()}</span>
        </div>
      </div>
      {/* Connection line to the next activity item */}
      <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gray-700 group-last:hidden"></div>
    </div>
  );
};

// Comment Item Component
const CommentItem = ({ comment }) => (
  <div className="mb-4">
    <div className="flex items-start space-x-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0">
        {comment.author.split(" ")[0][0]}
        {comment.author.split(" ")[1][0]}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium">{comment.author}</h4>
          <span className="text-xs text-gray-400">
            {new Date(comment.timestamp).toLocaleString()}
          </span>
        </div>
        <p className="text-sm">{comment.text}</p>

        {comment.attachments.length > 0 && (
          <div className="mt-2 bg-gray-800 p-2 rounded">
            {comment.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center text-xs text-blue-400 hover:underline cursor-pointer"
              >
                <Paperclip size={12} className="mr-1" />
                {attachment}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Attachment Item Component
const AttachmentItem = ({ attachment }) => (
  <div className="flex items-center justify-between hover:bg-gray-800 p-3 rounded">
    <div className="flex items-center space-x-3">
      <div className="text-2xl">{getFileIcon(attachment.type)}</div>
      <div>
        <p className="font-medium">{attachment.name}</p>
        <p className="text-xs text-gray-400">
          {attachment.size} • Uploaded by {attachment.uploadedBy} on{" "}
          {formatDateTime(attachment.uploadedAt)}
        </p>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="p-1 hover:bg-gray-700 rounded">
        <Link2 size={18} />
      </button>
      <button className="p-1 hover:bg-gray-700 rounded">
        <MoreVertical size={18} />
      </button>
    </div>
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

const MemberDropdownMenu = ({ isOpen, onClose, users, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">Select Assignee</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        {users.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>No users available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => {
                  onSelect(user);
                  onClose();
                }}
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

const TaskDetail = ({ task: initialTask, onBack }) => {
  const [task, setTask] = useState(initialTask);
  const [activeTab, setActiveTab] = useState("details");
  const [showAddComment, setShowAddComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subtasks, setSubtasks] = useState(initialTask.subTasks || []);
  const [allUsers, setAllUsers] = useState([]);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [subtaskStartDate, setSubtaskStartDate] = useState(""); // Thêm state cho startDate
  const [subtaskDueDate, setSubtaskDueDate] = useState(""); // Thêm state cho dueDate
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    taskId: null,
  });

  // Thêm hàm showToast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Trong component TaskDetail, useEffect đang thiếu phần mảng dependencies
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        const response = await axios.get("http://localhost:8080/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllUsers(response.data.content || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []); // Đã có mảng dependencies nhưng không có vấn đề

  if (!task) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Task Not Found</h2>
        <p className="text-gray-400">The requested task could not be found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Back
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  const daysRemaining = getDaysRemaining(task.dueDate);

  if (isEditing) {
    return (
      <TaskEdit
        task={task}
        onBack={() => setIsEditing(false)}
        isNew={false} // Thêm prop này để biết đang edit task đã tồn tại
        taskId={task.id} // Truyền ID của task để fetch chi tiết
      />
    );
  }

  // Thêm subtask
  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !selectedAssignee) {
      showToast("Please enter subtask name and select an assignee", "error");
      return;
    }

    // Kiểm tra các trường ngày tháng
    if (!subtaskStartDate || !subtaskDueDate) {
      showToast("Please select start date and due date", "error");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.post(
        "http://localhost:8080/api/subtasks",
        {
          name: newSubtask,
          completed: false,
          taskId: task.id,
          assigneeId: selectedAssignee.id,
          startDate: subtaskStartDate,
          dueDate: subtaskDueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Lấy dữ liệu task mới sau khi thêm subtask
      const taskResponse = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật cả task và subtasks
      setTask(taskResponse.data);
      setSubtasks(taskResponse.data.subTasks || []);
      setNewSubtask("");
      setSelectedAssignee(null);
      setSubtaskStartDate(""); // Reset startDate
      setSubtaskDueDate(""); // Reset dueDate
      setShowAddSubtask(false);
      showToast("Subtask added successfully", "success");
    } catch (error) {
      console.error("Error adding subtask:", error);
      showToast("Failed to add subtask", "error");
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await fetch(
        `http://localhost:8080/api/subtasks/${subtaskId}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle subtask completion");
      }

      // Lấy dữ liệu task mới sau khi toggle subtask
      const taskResponse = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật cả task và subtasks
      setTask(taskResponse.data);
      setSubtasks(taskResponse.data.subTasks || []);
    } catch (error) {
      console.error("Error toggling subtask:", error);
      showToast("Failed to update subtask", "error");
    }
  };

  const handleDeleteTask = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.delete(
        `http://localhost:8080/api/tasks/${deleteConfirm.taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Quay lại và báo hiệu cần refresh dữ liệu
      onBack(true);
      showToast("Task deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", "error");
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.delete(`http://localhost:8080/api/subtasks/${subtaskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Lấy dữ liệu task mới sau khi xóa subtask
      const taskResponse = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật cả task và subtasks
      setTask(taskResponse.data);
      setSubtasks(taskResponse.data.subTasks || []);
      showToast("Subtask deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting subtask:", error);
      showToast("Failed to delete subtask", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onBack(true)} // Thêm tham số true để báo hiệu cần refresh
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>

        <div className="flex space-x-2">
          {/* Replace the "Mark Complete" button */}
          <div className="relative"></div>
          <button
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
            onClick={handleEdit}
          >
            <Edit size={16} className="mr-2" />
            Edit Task
          </button>
          <button
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center"
            onClick={() => setDeleteConfirm({ show: true, taskId: task.id })}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Task Title and Status */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{task.name}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="cursor-pointer"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              >
                <div className="flex items-center gap-1">
                  <StatusBadge status={task.status} />
                  <ChevronDown size={12} />
                </div>
              </div>
              {statusMenuOpen && (
                <div className="absolute left-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700 min-w-[171px] w-auto">
                  {[
                    "COMPLETED",
                    "IN_PROGRESS",
                    "NOT_STARTED",
                    "OVER_DUE",
                    "ON_HOLD",
                  ].map((status) => (
                    <div
                      key={status}
                      className={`px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer my-1 hover:bg-gray-700 mx-1 ${
                        task.status === status ? "bg-gray-700" : ""
                      }`}
                      onClick={async () => {
                        try {
                          const storedUser = localStorage.getItem("user");
                          let token = null;
                          if (storedUser) {
                            const user = JSON.parse(storedUser);
                            token = user.accessToken;
                          }

                          await axios.patch(
                            `http://localhost:8080/api/tasks/${task.id}/status?status=${status}`,
                            {}, // body rỗng nếu không cần gửi dữ liệu
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          // Lấy dữ liệu task mới sau khi cập nhật status
                          const response = await axios.get(
                            `http://localhost:8080/api/tasks/${task.id}`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          // Cập nhật dữ liệu task trong component hiện tại
                          setTask(response.data);
                          showToast(
                            `Task status updated to ${status.replace(
                              /_/g,
                              " "
                            )}`,
                            "success"
                          );
                          setStatusMenuOpen(false);
                        } catch (error) {
                          console.error("Error updating task status:", error);
                          showToast("Failed to update task status", "error");
                          setStatusMenuOpen(false);
                        }
                      }}
                    >
                      <StatusBadge status={status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${priorityInfo.bgColor} ${priorityInfo.textColor}`}
            >
              {priorityInfo.icon}
              <span>{priorityInfo.text}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-300">{task.description}</p>
      </div>

      {/* Project and Assignee Info */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {" "}
          {/* Thay đổi thành 2 cột thay vì 3 */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Project</p>
            <p className="font-medium">{task.projectName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Created by</p>
            <p className="font-medium">{task.createdByName || "Unknown"}</p>
            <p className="text-xs text-gray-400">
              {formatDateTime(task.createdDate)}
            </p>
          </div>
        </div>
      </div>
      {/* Timeline and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Start Date</p>
              <p className="font-medium">{formatDate(task.startDate)}</p>
            </div>
            <Calendar size={20} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Due Date</p>
              <div>
                <p className="font-medium">{formatDate(task.dueDate)}</p>
                <p
                  className={`text-xs ${
                    daysRemaining < 0
                      ? "text-red-500"
                      : daysRemaining < 3
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} days left`
                    : daysRemaining === 0
                    ? "Due today"
                    : `${Math.abs(daysRemaining)} days overdue`}
                </p>
              </div>
            </div>
            <Calendar
              size={20}
              className={daysRemaining < 0 ? "text-red-500" : "text-purple-500"}
            />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Progress</p>
              <p className="font-medium">{task.progress.toFixed(1)}%</p>
            </div>
            <CheckCircle size={20} className="text-purple-500" />
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar">
          <Tab
            icon={<FileText size={18} />}
            label="Details"
            active={activeTab === "details"}
            onClick={() => setActiveTab("details")}
          />
          <Tab
            icon={<MessageSquare size={18} />}
            label="Comments"
            active={activeTab === "comments"}
            onClick={() => setActiveTab("comments")}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === "details" && (
          <div>
            {/* Subtasks */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Subtasks</h3>
                <button
                  className="text-sm text-purple-500 hover:text-purple-400 flex items-center"
                  onClick={() => setShowAddSubtask(!showAddSubtask)}
                >
                  <Plus size={16} className="mr-1" />
                  Add Subtask
                </button>
              </div>
              {showAddSubtask && (
                <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
                  <h4 className="text-sm font-medium mb-4">New Subtask</h4>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white"
                      placeholder="Enter subtask name"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Start Date
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white"
                          value={subtaskStartDate}
                          onChange={(e) => setSubtaskStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white"
                          value={subtaskDueDate}
                          onChange={(e) => setSubtaskDueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-between text-left"
                        onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                      >
                        {selectedAssignee ? (
                          <div className="flex items-center overflow-hidden">
                            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm mr-3 flex-shrink-0">
                              {selectedAssignee.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <div className="truncate">
                              <div className="font-medium">
                                {selectedAssignee.fullName}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {selectedAssignee.position} •{" "}
                                {selectedAssignee.department}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Select Assignee</span>
                        )}
                        <ChevronDown
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                      </button>

                      {membersMenuOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-30 max-h-80 overflow-y-auto">
                          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-medium">Select Assignee</h3>
                            <button
                              className="p-1 hover:bg-gray-700 rounded-full"
                              onClick={() => setMembersMenuOpen(false)}
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div className="p-2">
                            {allUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md cursor-pointer"
                                onClick={() => {
                                  setSelectedAssignee(user);
                                  setMembersMenuOpen(false);
                                }}
                              >
                                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                  {user.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {user.fullName}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-400 gap-2">
                                    <span className="truncate">
                                      {user.position}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span className="truncate">
                                      {user.department}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                        onClick={() => {
                          setShowAddSubtask(false);
            setNewSubtask("");
            setSelectedAssignee(null);
            setSubtaskStartDate("");
            setSubtaskDueDate("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddSubtask}
                        disabled={!newSubtask.trim() || !selectedAssignee || !subtaskStartDate || !subtaskDueDate}
                      >
                        Add Subtask
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {subtasks.length === 0 ? (
                <div className="text-center py-4 text-gray-400 bg-gray-800 rounded-lg">
                  <p>No subtasks have been created for this task.</p>
                </div>
              ) : (
                <div className="space-y-2">
{subtasks.map((subtask) => (
  <div
    key={subtask.id}
    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
  >
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => handleToggleSubtask(subtask.id)}
        className="mr-3 h-4 w-4"
      />
      <div>
        <span
          className={
            subtask.completed
              ? "line-through text-gray-400"
              : ""
          }
        >
          {subtask.name}
        </span>
        {subtask.assigneeName && (
          <div className="text-xs text-gray-400 flex items-center mt-1">
            <User size={12} className="mr-1" />
            {subtask.assigneeName}
          </div>
        )}
        {/* Hiển thị thông tin ngày tháng */}
        <div className="text-xs text-gray-400 flex items-center mt-1">
          <Calendar size={12} className="mr-1" />
          {formatDate(subtask.startDate)} - {formatDate(subtask.dueDate)}
        </div>
      </div>
    </div>
    <button
      className="text-gray-400 hover:text-red-500"
      onClick={() => handleDeleteSubtask(subtask.id)}
    >
      <X size={16} />
    </button>
  </div>
))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Thiếu phần hiển thị toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-md ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Modal xác nhận xóa task */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setDeleteConfirm({ show: false, taskId: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                onClick={handleDeleteTask}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
