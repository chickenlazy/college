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
  Loader,
  X,
  MessageSquare,
} from "lucide-react";

// Comment component
const Comment = ({ comment, onReply, onDelete }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchReplies = async () => {
    if (!showReplies && comment.replyCount > 0) {
      try {
        setLoadingReplies(true);
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        const response = await axios.get(
          `http://localhost:8080/api/comments/${comment.id}/replies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReplies(response.data || []);
        setShowReplies(true);
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    } else {
      setShowReplies(!showReplies);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.post(
        "http://localhost:8080/api/comments",
        {
          content: replyText,
          type: "TASK",
          referenceId: comment.referenceId,
          parentId: comment.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Thêm reply mới vào danh sách
      setReplies([...replies, response.data]);
      // Reset form
      setReplyText("");
      setShowReplyForm(false);
      // Đảm bảo hiển thị replies
      setShowReplies(true);

      onReply && onReply(response.data);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  return (
    <div className="mb-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0">
            {comment.user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium">{comment.user.fullName}</h4>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdDate).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>

            <div className="mt-3 flex items-center text-sm text-gray-400 space-x-4">
              <button
                className="hover:text-purple-400"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                Reply
              </button>

              {comment.replyCount > 0 && (
                <button
                  className="hover:text-purple-400 flex items-center"
                  onClick={fetchReplies}
                >
                  {showReplies
                    ? "Hide replies"
                    : `View ${comment.replyCount} replies`}
                  {loadingReplies && (
                    <span className="ml-2 animate-spin">⏳</span>
                  )}
                </button>
              )}

              {/* Chỉ hiển thị nút Delete nếu người dùng hiện tại là người tạo comment */}
              {currentUser && (currentUser.id === comment.user.id || currentUser.role === "ROLE_ADMIN") && (
                <button
                  className="hover:text-red-400"
                  onClick={() => onDelete && onDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                  placeholder="Write a reply..."
                  rows="2"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md"
                    onClick={handleSubmitReply}
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="ml-10 mt-2 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0">
                  {reply.user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm">
                      {reply.user.fullName}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {new Date(reply.createdDate).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
          <div
            className={`h-3 w-3 rounded-full ${
              task.status === "COMPLETED"
                ? "bg-green-500"
                : task.status === "IN_PROGRESS"
                ? "bg-blue-500"
                : task.status === "OVER_DUE"
                ? "bg-red-500"
                : task.status === "ON_HOLD"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
          ></div>
          <h3 className="font-medium">{task.name}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={task.status} />
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-3">
            {task.description || "No description provided."}
          </div>

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
              <p className="text-xs text-gray-400 mb-2">
                Subtasks ({task.subtasks.filter((s) => s.completed).length}/
                {task.subtasks.length})
              </p>
              <div className="space-y-2 pl-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center">
                    {subtask.completed ? (
                      <CheckCircle size={14} className="text-green-500 mr-2" />
                    ) : (
                      <XCircle size={14} className="text-gray-400 mr-2" />
                    )}
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
  const [activeTab, setActiveTab] = useState("tasks");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Thêm useEffect để fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (activeTab === "comments" && project && project.id) {
        try {
          setLoadingComments(true);
          const storedUser = localStorage.getItem("user");
          let token = null;
          if (storedUser) {
            const user = JSON.parse(storedUser);
            token = user.accessToken;
          }

          const response = await axios.get(
            `http://localhost:8080/api/comments?type=PROJECT&referenceId=${project.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setComments(response.data || []);
        } catch (error) {
          console.error("Error fetching comments:", error);
          showToast("Failed to load comments", "error");
        } finally {
          setLoadingComments(false);
        }
      }
    };

    fetchComments();
  }, [project, activeTab]);

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
            icon={<MessageSquare size={18} />}
            label="Comments"
            active={activeTab === "comments"}
            onClick={() => setActiveTab("comments")}
          />
        </div>
      </div>
  
      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === "tasks" && (
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
        )}
        
        {activeTab === "team" && (
          <div>
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
            <div>
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
          </div>
        )}
        
        {activeTab === "comments" && (
          <div>
            <div className="mb-6">
              <div className="flex flex-col space-y-4">
                {/* Form thêm comment mới */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white"
                    placeholder="Write a comment..."
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end mt-3">
                    <button
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
                      onClick={async () => {
                        if (!newComment.trim()) return;
  
                        try {
                          const storedUser = localStorage.getItem("user");
                          let token = null;
                          if (storedUser) {
                            const user = JSON.parse(storedUser);
                            token = user.accessToken;
                          }
  
                          const response = await axios.post(
                            "http://localhost:8080/api/comments",
                            {
                              content: newComment,
                              type: "PROJECT",
                              referenceId: project.id,
                              parentId: null,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
  
                          // Thêm comment mới vào đầu danh sách
                          setComments([response.data, ...comments]);
                          // Reset form
                          setNewComment("");
                          showToast(
                            "Comment added successfully",
                            "success"
                          );
                        } catch (error) {
                          console.error("Error adding comment:", error);
                          showToast("Failed to add comment", "error");
                        }
                      }}
                    >
                      Comment
                    </button>
                  </div>
                </div>
  
                {/* Danh sách comments */}
                {loadingComments ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="mt-2 text-gray-400">
                      Loading comments...
                    </p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-800 rounded-lg">
                    <MessageSquare
                      size={40}
                      className="mx-auto text-gray-500 mb-2"
                    />
                    <p className="text-gray-400">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onReply={() => {
                        // Cập nhật lại danh sách comments sau khi reply
                        const updatedComments = [...comments];
                        const index = updatedComments.findIndex(
                          (c) => c.id === comment.id
                        );
                        if (index !== -1) {
                          updatedComments[index] = {
                            ...comment,
                            replyCount: comment.replyCount + 1,
                          };
                          setComments(updatedComments);
                        }
                      }}
                      onDelete={async (commentId) => {
                        try {
                          const storedUser = localStorage.getItem("user");
                          let token = null;
                          if (storedUser) {
                            const user = JSON.parse(storedUser);
                            token = user.accessToken;
                          }
  
                          await axios.delete(
                            `http://localhost:8080/api/comments/${commentId}`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
  
                          // Xóa comment khỏi danh sách
                          setComments(
                            comments.filter((c) => c.id !== commentId)
                          );
                          showToast(
                            "Comment deleted successfully",
                            "success"
                          );
                        } catch (error) {
                          console.error("Error deleting comment:", error);
                          showToast("Failed to delete comment", "error");
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
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
  );
};

export default UserProjectDetail;
