import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Clock,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Pause,
  FileText,
  MessageSquare,
  Flag,
  X,
} from "lucide-react";

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

// Get priority info
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

const UserTaskDetail = ({ taskId, onBack }) => {
    const [task, setTask] = useState(null);
    const [activeTab, setActiveTab] = useState("details");
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchTaskDetails = async () => {
        if (!taskId) return;
        
        try {
          const storedUser = localStorage.getItem("user");
          let token = null;
          if (storedUser) {
            const user = JSON.parse(storedUser);
            token = user.accessToken;
          }
  
          const response = await axios.get(
            `http://localhost:8080/api/tasks/${taskId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTask(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching task details:", error);
          showToast("Failed to load task details", "error");
          setLoading(false);
        }
      };
  
      fetchTaskDetails();
    }, [taskId]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const priorityInfo = getPriorityInfo(task.priority);
  const daysRemaining = getDaysRemaining(task.dueDate);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onBack(true)}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Task Title and Status */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{task.name}</h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Project</p>
            <p className="font-medium">{task.projectName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Assigned to</p>
            <p className="font-medium">{task.assigneeName || "Not assigned"}</p>
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
                    daysRemaining < 0 && task.status !== "COMPLETED"
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
                    : task.status === "COMPLETED"
                    ? "Completed"
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
            label="Updates"
            active={activeTab === "updates"}
            onClick={() => setActiveTab("updates")}
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
              </div>

              {(!task.subTasks || task.subTasks.length === 0) ? (
                <div className="text-center py-4 text-gray-400 bg-gray-800 rounded-lg">
                  <p>No subtasks have been created for this task.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {task.subTasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 h-4 w-4 flex items-center justify-center">
                          {subtask.completed ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <X size={16} className="text-gray-500" />
                          )}
                        </div>
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
                            {formatDate(subtask.startDate)} -{" "}
                            {formatDate(subtask.dueDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-center py-8">
              No updates available for this task.
            </p>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-md ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default UserTaskDetail;