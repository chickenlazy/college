import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  ListChecks,
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Loader
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

// StatusBadge Component
const StatusBadge = ({ status }) => {
  let color;
  let bgColor;
  let icon;
  let displayText = status.replace(/_/g, " ");

  switch (status) {
    case "NOT_STARTED":
      color = "text-gray-800";
      bgColor = "bg-gray-200";
      icon = <Clock size={14} />;
      break;
    case "IN_PROGRESS":
      color = "text-blue-800";
      bgColor = "bg-blue-200";
      icon = <Clock size={14} />;
      break;
    case "COMPLETED":
      color = "text-green-800";
      bgColor = "bg-green-200";
      icon = <CheckCircle size={14} />;
      break;
    case "OVER_DUE":
      color = "text-red-800";
      bgColor = "bg-red-200";
      icon = <AlertTriangle size={14} />;
      break;
    case "ON_HOLD":
      color = "text-yellow-800";
      bgColor = "bg-yellow-200";
      icon = <Clock size={14} />;
      break;
    default:
      color = "text-gray-800";
      bgColor = "bg-gray-200";
      icon = <Clock size={14} />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}
    >
      {icon}
      {displayText}
    </span>
  );
};

// Task Item Component
const TaskItem = ({ task }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden mb-3">
      <div
        className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer hover:bg-gray-750"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`h-3 w-3 rounded-full ${
            task.status === "COMPLETED" ? "bg-green-500" : 
            task.status === "IN_PROGRESS" ? "bg-blue-500" : 
            task.status === "OVER_DUE" ? "bg-red-500" :
            task.status === "ON_HOLD" ? "bg-yellow-500" : "bg-gray-500"
          }`}></div>
          <h3 className="font-medium">{task.name}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={task.status} />
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-3">{task.description || "No description provided."}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</p>
              <div className="space-y-2 pl-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center">
                    {subtask.completed ? 
                      <CheckCircle size={14} className="text-green-500 mr-2" /> : 
                      <XCircle size={14} className="text-gray-400 mr-2" />
                    }
                    <span className={subtask.completed ? "text-gray-400 line-through" : ""}>
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// TagItem Component
const TagItem = ({ tag }) => (
  <div
    className="inline-flex items-center px-3 py-1 rounded-full text-sm mr-2 mb-2"
    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
  >
    <Tag size={12} className="mr-1" />
    {tag.name}
  </div>
);

const UserProjectDetail = ({ projectId, onBack }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        const response = await axios.get(
          `http://localhost:8080/api/projects/${projectId}`,
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
        setError("Failed to load project details");
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size={36} className="text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Project</h2>
        <p className="text-gray-400">{error || "Project not found"}</p>
        <button
          className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    );
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    
    // Set time to beginning of day for accurate day calculation
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center text-gray-400 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Project Title and Status */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h1 className="text-2xl font-bold mr-3">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-gray-300">{project.description || "No description provided."}</p>

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
                {formatDate(project.startDate)} - {formatDate(project.dueDate)}
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

      {/* Project Manager */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Project Manager</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
              {project.managerName ? project.managerName.charAt(0) : "M"}
            </div>
            <div className="ml-3">
              <p className="font-medium">{project.managerName}</p>
              <p className="text-sm text-gray-400">Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Team Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.users.map((user) => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                  {user.fullName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-400">{user.position || user.role.replace("ROLE_", "")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tasks</h2>
        {project.tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>No tasks found for this project.</p>
          </div>
        ) : (
          project.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};

export default UserProjectDetail;