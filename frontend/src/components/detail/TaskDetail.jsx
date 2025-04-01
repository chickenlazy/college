import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
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
  CheckCircle2,
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

const TaskDetail = ({ task, onBack }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [showAddComment, setShowAddComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subTasks || []);
  const [allUsers, setAllUsers] = useState([]);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users");
        setAllUsers(response.data.content || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

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
          Back to Tasks
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  const daysRemaining = getDaysRemaining(task.dueDate);

  if (isEditing) {
    return <TaskEdit task={task} onBack={() => setIsEditing(false)} />;
  }

  // Thêm subtask
  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !selectedAssignee) {
      alert("Vui lòng nhập tên subtask và chọn người được giao");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/subtasks", {
        name: newSubtask,
        completed: false,
        taskId: task.id,
        assigneeId: selectedAssignee.id,
      });

      // Thêm subtask mới vào danh sách
      setSubtasks([...subtasks, response.data]);
      setNewSubtask("");
      setSelectedAssignee(null);
      setShowAddSubtask(false);
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  // Toggle trạng thái subtask
  const handleToggleSubtask = async (subtaskId) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/subtasks/${subtaskId}/toggle`
      );

      // Cập nhật trạng thái subtask trong state
      const updatedSubtasks = subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      );
      setSubtasks(updatedSubtasks);
    } catch (error) {
      console.error("Error toggling subtask:", error);
    }
  };

  // Xóa subtask
  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await axios.delete(`http://localhost:8080/api/subtasks/${subtaskId}`);

      // Loại bỏ subtask khỏi danh sách
      const updatedSubtasks = subtasks.filter(
        (subtask) => subtask.id !== subtaskId
      );
      setSubtasks(updatedSubtasks);
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Project</span>
        </button>

        <div className="flex space-x-2">
          {/* Replace the "Mark Complete" button */}
<div className="relative">
  <button 
    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
    onClick={() => setStatusMenuOpen(!statusMenuOpen)}
  >
    <Clock size={16} className="mr-2" />
    Update Status
  </button>
  
  {statusMenuOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-10">
      {['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'OVER_DUE', 'ON_HOLD'].map(status => (
        <div
          key={status} 
          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={async () => {
            try {
              await axios.patch(`http://localhost:8080/api/tasks/${task.id}/status?status=${status}`);
              // Refresh task data after updating status
              // You can fetch the updated task here and update the state
            } catch (error) {
              console.error('Error updating task status:', error);  
            }
            setStatusMenuOpen(false);
          }}
        >
          {status.replace('_', ' ')}
        </div>
      ))}
    </div>
  )}
</div>
          <button
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
            onClick={handleEdit}
          >
            <Edit size={16} className="mr-2" />
            Edit Task
          </button>
          <button className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center">
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
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.textColor}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Project</p>
            <p className="font-medium">{task.projectName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Assignee</p>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mr-2">
                {task.assigneeName
                  ? task.assigneeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "?"}
              </div>
              <div>
                <p className="font-medium">
                  {task.assigneeName || "Unassigned"}
                </p>
                <p className="text-xs text-gray-400">
                  {task.assigneeRole || ""}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Created by</p>
            <p className="font-medium">{task.createdBy}</p>
            <p className="text-xs text-gray-400">
              {formatDateTime(task.createdAt)}
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
              <p className="font-medium">{task.progress}%</p>
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
          <Tab
            icon={<Paperclip size={18} />}
            label="Attachments"
            active={activeTab === "attachments"}
            onClick={() => setActiveTab("attachments")}
          />
          <Tab
            icon={<Clock size={18} />}
            label="Activity"
            active={activeTab === "activity"}
            onClick={() => setActiveTab("activity")}
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
                <div className="flex items-center mb-3 relative">
                  <input
                    type="text"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3"
                    placeholder="Enter subtask name"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                  />
                  <div className="relative">
                    <button
                      className="px-3 py-2 bg-gray-700 border-t border-b border-gray-700 flex items-center"
                      onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                    >
                      {selectedAssignee ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs mr-2">
                            {selectedAssignee.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <span>{selectedAssignee.fullName}</span>
                        </div>
                      ) : (
                        <span>Select Assignee</span>
                      )}
                    </button>
                    <MemberDropdownMenu
                      isOpen={membersMenuOpen}
                      onClose={() => setMembersMenuOpen(false)}
                      users={allUsers}
                      onSelect={setSelectedAssignee}
                    />
                  </div>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-r-md"
                    onClick={handleAddSubtask}
                    disabled={!selectedAssignee}
                  >
                    Add
                  </button>
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
                        <span
                          className={
                            subtask.completed
                              ? "line-through text-gray-400"
                              : ""
                          }
                        >
                          {subtask.name}
                        </span>
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

        {/* thêm điều kiện như subTask */}
        {/* {activeTab === 'comments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button 
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                onClick={() => setShowAddComment(!showAddComment)}
              >
                <Plus size={16} className="mr-2" />
                Add Comment
              </button>
            </div>
            
            {showAddComment && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white resize-none mb-3"
                  rows="4"
                  placeholder="Type your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <div className="flex items-center justify-between">
                  <button className="flex items-center text-gray-400 hover:text-white">
                    <Paperclip size={16} className="mr-1" />
                    Attach File
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                      onClick={() => {
                        setCommentText('');
                        setShowAddComment(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {task.comments.length === 0 ? (
                <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                task.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'attachments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Attachments</h3>
              <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center">
                <Plus size={16} className="mr-2" />
                Upload File
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              {task.attachments.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Paperclip size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No files have been attached to this task.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <AttachmentItem key={attachment.id} attachment={attachment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
            
            <div className="bg-gray-800 rounded-lg p-4">
              {task.activity.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Clock size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No activity recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2 mt-4">
                  {task.activity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default TaskDetail;
