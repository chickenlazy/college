import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  Pause,
  XCircle,
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
import SubtaskMemberModal from "../utils/SubtaskMemberModal";

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
        text: "Chưa bắt đầu",
      };
    case "IN_PROGRESS":
      return {
        color: "bg-blue-500",
        textColor: "text-blue-500",
        bgColor: "bg-blue-100",
        icon: <Clock size={16} />,
        text: "Đang tiến hành",
      };
    case "COMPLETED":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        bgColor: "bg-green-100",
        icon: <CheckCircle size={16} />,
        text: "Hoàn thành",
      };
    case "ON_HOLD":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-100",
        icon: <AlertTriangle size={16} />,
        text: "Tạm dừng",
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
        text: "Cao",
      };
    case "MEDIUM":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-100",
        icon: <Flag size={16} />,
        text: "Trung bình",
      };
    case "LOW":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        bgColor: "bg-green-100",
        icon: <Flag size={16} />,
        text: "Thấp",
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
        <h3 className="font-medium">Chọn người thực hiện</h3>
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

// Comment component mới
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
          // http://localhost:8080/api/comments/${comment.id}/replies
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
                Phản hồi
              </button>

              {comment.replyCount > 0 && (
                <button
                  className="hover:text-purple-400 flex items-center"
                  onClick={fetchReplies}
                >
                  {showReplies
                    ? "Ẩn phản hồi"
                    : `Xem ${comment.replyCount} phản hồi`}
                  {loadingReplies && (
                    <span className="ml-2 animate-spin">⏳</span>
                  )}
                </button>
              )}

              {/* Chỉ hiển thị nút Delete nếu người dùng hiện tại là người tạo comment */}
              {currentUser &&
                (currentUser.id === comment.user.id ||
                  currentUser.role === "ROLE_ADMIN") && (
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
                  placeholder="Viết phản hồi..."
                  rows="2"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Hủy
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

const TaskDetail = ({ task: initialTask, onBack }) => {
  const [subtaskErrors, setSubtaskErrors] = useState({});
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
  const [subtaskStartDate, setSubtaskStartDate] = useState(
    null //new Date().toISOString().split("T")[0]
  ); // Thêm state cho startDate
  const [subtaskDueDate, setSubtaskDueDate] = useState(
    null // new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0]
  ); // Thêm state cho dueDate
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    taskId: null,
  });
  // Thêm vào phần state
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Thêm hàm showToast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    const fetchProjectUsers = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        // Fetch users từ project thay vì tất cả user
        const response = await axios.get(
          `http://localhost:8080/api/projects/${task.projectId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching project users:", error);
      }
    };

    fetchProjectUsers();
  }, [task.projectId]); // Thêm dependency task.projectId

  // Thêm useEffect để fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (activeTab === "comments") {
        try {
          setLoading(true);
          const storedUser = localStorage.getItem("user");
          let token = null;
          if (storedUser) {
            const user = JSON.parse(storedUser);
            token = user.accessToken;
          }

          const response = await axios.get(
            `http://localhost:8080/api/comments?type=TASK&referenceId=${task.id}`,
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
          setLoading(false);
        }
      }
    };

    fetchComments();
  }, [task.id, activeTab]);

  if (!task) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy nhiệm vụ</h2>
        <p className="text-gray-400">The requested task could not be found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Quay lại
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

  const handleAddSubtask = async () => {
    // Reset error state
    const errors = {};

    // Validate subtask name
    if (!newSubtask.trim()) {
      errors.name = "Tên nhiệm vụ con không được để trống";
    } else if (newSubtask.length > 100) {
      errors.name = "Tên nhiệm vụ con không được vượt quá 100 ký tự";
    }

    // Validate assignee
    if (!selectedAssignee) {
      errors.assignee = "Vui lòng chọn người thực hiện";
    }

    // Validate start date
    if (!subtaskStartDate) {
      errors.startDate = "Cần nhập ngày bắt đầu";
    }

    // Validate due date
    if (!subtaskDueDate) {
      errors.dueDate = "Cần nhập ngày kết thúc";
    }

    // Kiểm tra subtaskDueDate phải sau subtaskStartDate
    if (subtaskStartDate && subtaskDueDate) {
      const subtaskStart = new Date(subtaskStartDate);
      const subtaskDue = new Date(subtaskDueDate);

      // Set hours để so sánh chính xác ngày
      subtaskStart.setHours(0, 0, 0, 0);
      subtaskDue.setHours(0, 0, 0, 0);

      if (subtaskDue < subtaskStart) {
        errors.dueDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    // Kiểm tra startDate và dueDate của subtask phải thuộc vào khoảng thời gian của task
    if (subtaskStartDate && subtaskDueDate) {
      const subtaskStart = new Date(subtaskStartDate);
      const subtaskDue = new Date(subtaskDueDate);
      const taskStart = new Date(task.startDate);
      const taskDue = new Date(task.dueDate);

      // Set hours để so sánh chính xác ngày
      subtaskStart.setHours(0, 0, 0, 0);
      subtaskDue.setHours(0, 0, 0, 0);
      taskStart.setHours(0, 0, 0, 0);
      taskDue.setHours(0, 0, 0, 0);

      if (subtaskStart < taskStart) {
        errors.startDate =
          "Ngày bắt đầu nhiệm vụ con không thể sớm hơn ngày bắt đầu nhiệm vụ";
      }

      if (subtaskDue > taskDue) {
        errors.dueDate = "Ngày kết thúc nhiệm vụ con không thể muộn hơn ngày kết thúc nhiệm vụ";
      }
    }

    // If there are errors, stop and show them
    if (Object.keys(errors).length > 0) {
      setSubtaskErrors(errors);
      // Thêm dòng sau để hiển thị thông báo toast
      showToast("Vui lòng sửa lỗi trong biểu mẫu", "error");
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
      setSubtaskStartDate("");
      setSubtaskDueDate("");
      setShowAddSubtask(false);
      setSubtaskErrors({}); // Reset errors
      showToast("Thêm nhiệm vụ con thành công", "success");
    } catch (error) {
      console.error("Error adding subtask:", error);
      showToast("Failed to Thêm nhiệm vụ con", "error");
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
      showToast("Xóa nhiệm vụ thành công", "success");
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
      showToast("SubXóa nhiệm vụ thành công", "success");
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
          <span>Quay lại</span>
        </button>
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
                    // "COMPLETED",
                    "IN_PROGRESS",
                    // "NOT_STARTED",
                    // "OVER_DUE",
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
                            `Cập nhật trạng thái nhiệm vụ thành ${status.replace(
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
            <p className="text-sm text-gray-400 mb-1">Dự án</p>
            <p className="font-medium">{task.projectName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Tạo bởi</p>
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
              <p className="text-sm text-gray-400 mb-1">Ngày bắt đầu</p>
              <p className="font-medium">{formatDate(task.startDate)}</p>
            </div>
            <Calendar size={20} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Ngày kết thúc</p>
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
                    ? "Hết hạn hôm nay"
                    : task.status === "COMPLETED"
                    ? "Hoàn thành"
                    : `${Math.abs(daysRemaining)} ngày quá hạn`}
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
              <p className="text-sm text-gray-400 mb-1">Tiến độ</p>
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
            label="Chi tiết"
            active={activeTab === "details"}
            onClick={() => setActiveTab("details")}
          />
          <Tab
            icon={<MessageSquare size={18} />}
            label="Bình luận"
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
                  className={`text-sm ${
                    task.status === "IN_PROGRESS"
                      ? "text-purple-500 hover:text-purple-400"
                      : "text-gray-500 cursor-not-allowed opacity-60"
                  } flex items-center`}
                  onClick={() => task.status === "IN_PROGRESS" && setShowAddSubtask(!showAddSubtask)}
                  disabled={task.status !== "IN_PROGRESS"}
                  title={task.status !== "IN_PROGRESS" ? "Nhiệm vụ phải ở trạng thái đang tiến hành để thêm nhiệm vụ con" : ""}
                >
                  <Plus size={16} className="mr-1" />
                  Thêm nhiệm vụ con
                </button>
              </div>
              {showAddSubtask && (
                <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
                  <h4 className="text-sm font-medium mb-4">
                    Thông tin Subtask
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Tên subtask
                      </label>
                      <input
                        type="text"
                        className={`w-full bg-gray-700 border ${
                          subtaskErrors.name
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-3 px-4 text-white`}
                        placeholder="Nhập tên nhiệm vụ con"
                        value={newSubtask}
                        maxLength={100} // Thêm thuộc tính maxLength
                        onChange={(e) => {
                          setNewSubtask(e.target.value);
                          // Xóa lỗi khi người dùng bắt đầu nhập
                          if (subtaskErrors.name) {
                            setSubtaskErrors((prev) => ({
                              ...prev,
                              name: null,
                            }));
                          }
                        }}
                      />
                      {subtaskErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {subtaskErrors.name}
                        </p>
                      )}
                      <div className="text-xs text-right mt-1 text-gray-400">
                        {newSubtask.length}/100
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Ngày bắt đầu
                          <span className="text-xs text-gray-500">
                            (Định dạng: MM/DD/YYYY - Phải trong khoảng từ{" "}
                            {formatDate(task.startDate)} đến{" "}
                            {formatDate(task.dueDate)})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            className={`w-full bg-gray-700 border ${
                              subtaskErrors.startDate
                                ? "border-red-500"
                                : "border-gray-600"
                            } rounded-md py-3 px-4 text-white`}
                            style={{ colorScheme: "dark" }}
                            value={subtaskStartDate}
                            onChange={(e) => {
                              setSubtaskStartDate(e.target.value);
                              // Xóa lỗi khi người dùng chọn ngày
                              if (subtaskErrors.startDate) {
                                setSubtaskErrors((prev) => ({
                                  ...prev,
                                  startDate: null,
                                }));
                              }
                            }}
                            min={task.startDate}
                            max={task.dueDate}
                          />
                        </div>
                        {subtaskErrors.startDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {subtaskErrors.startDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Ngày kết thúc 
                          <span className="text-xs text-gray-500">
                            (Định dạng: MM/DD/YYYY - Phải trong khoảng từ{" "}
                            {formatDate(subtaskStartDate || task.startDate)} and{" "}
                            {formatDate(task.dueDate)})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            className={`w-full bg-gray-700 border ${
                              subtaskErrors.dueDate
                                ? "border-red-500"
                                : "border-gray-600"
                            } rounded-md py-3 px-4 text-white`}
                            style={{ colorScheme: "dark" }}
                            value={subtaskDueDate}
                            onChange={(e) => {
                              setSubtaskDueDate(e.target.value);
                              // Xóa lỗi khi người dùng chọn ngày
                              if (subtaskErrors.dueDate) {
                                setSubtaskErrors((prev) => ({
                                  ...prev,
                                  dueDate: null,
                                }));
                              }
                            }}
                            min={subtaskStartDate || task.startDate}
                            max={task.dueDate}
                          />
                        </div>
                        {subtaskErrors.dueDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {subtaskErrors.dueDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phần chọn assignee */}
                    <div className="relative">
                      <label className="block text-sm text-gray-400 mb-1">
                        Người thực hiện
                      </label>
                      <div
                        className={`w-full bg-gray-700 border ${
                          subtaskErrors.assignee
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-3 px-4 text-white cursor-pointer flex justify-between items-center`}
                        onClick={() => setMembersMenuOpen(true)} // Thay đổi từ toggle sang set true
                      >
                        <div className="flex items-center">
                          {selectedAssignee ? (
                            <>
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mr-2">
                                {selectedAssignee.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </div>
                              <div>
                                <span>{selectedAssignee.fullName}</span>
                                {selectedAssignee.role && (
                                  <div className="text-xs text-gray-400">
                                    {selectedAssignee.role}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">
                              Chọn người thực hiện
                            </span>
                          )}
                        </div>
                        <ChevronDown size={16} />
                      </div>
                      {subtaskErrors.assignee && (
                        <p className="text-red-500 text-sm mt-1">
                          {subtaskErrors.assignee}
                        </p>
                      )}

                      {/* Sử dụng Modal mới thay vì dropdown cũ */}
                      <SubtaskMemberModal
                        isOpen={membersMenuOpen}
                        onClose={() => setMembersMenuOpen(false)}
                        users={allUsers}
                        onSelect={(user) => {
                          setSelectedAssignee(user);
                          setMembersMenuOpen(false);
                          // Xóa lỗi nếu có
                          if (subtaskErrors.assignee) {
                            setSubtaskErrors((prev) => ({
                              ...prev,
                              assignee: null,
                            }));
                          }
                        }}
                      />
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
                          setSubtaskErrors({}); // Reset errors
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 px-4 rounded-md transition-colors"
                        onClick={handleAddSubtask}
                      >
                        Thêm nhiệm vụ con
                      </button>
                    </div>
                  </div>
                </div>
              )}

{subtasks.length === 0 ? (
  <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={24} className="text-gray-500" />
      </div>
      <p className="text-lg font-medium text-gray-300 mb-2">Chưa có nhiệm vụ con</p>
      <p className="text-sm text-gray-500">Thêm nhiệm vụ con để chia nhỏ công việc</p>
    </div>
  </div>
) : (
  <div className="space-y-4">
    {subtasks.map((subtask) => {
      const subtaskStartDate = new Date(subtask.startDate);
      const subtaskDueDate = new Date(subtask.dueDate);
      const today = new Date();
      const isOverdue = subtaskDueDate < today && !subtask.completed;
      const daysRemaining = Math.ceil((subtaskDueDate - today) / (1000 * 60 * 60 * 24));
      
      return (
        <div
          key={subtask.id}
          className={`border rounded-lg p-4 transition-all duration-200 ${
            subtask.completed 
              ? "bg-gray-800/50 border-green-500/30" 
              : isOverdue
              ? "bg-red-900/20 border-red-500/30"
              : "bg-gray-800 border-gray-700 hover:border-purple-500/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask.id)}
                  className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-purple-600 
                           focus:ring-purple-500 focus:ring-2 focus:ring-offset-0 
                           focus:ring-offset-gray-800"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className={`font-medium text-lg ${
                    subtask.completed
                      ? "line-through text-gray-500"
                      : "text-white"
                  }`}>
                    {subtask.name}
                  </h4>
                  
                  {/* Status badges */}
                  <div className="flex items-center gap-2">
                    {subtask.completed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                                     bg-green-100 text-green-800 font-medium">
                        <CheckCircle size={12} className="mr-1" />
                        Hoàn thành
                      </span>
                    )}
                    
                    {isOverdue && !subtask.completed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                                     bg-red-100 text-red-800 font-medium">
                        <AlertTriangle size={12} className="mr-1" />
                        Quá hạn
                      </span>
                    )}
                    
                    {!subtask.completed && !isOverdue && daysRemaining <= 3 && daysRemaining > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                                     bg-yellow-100 text-yellow-800 font-medium">
                        <Clock size={12} className="mr-1" />
                        Sắp hết hạn
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Assignee Info */}
                {subtask.assigneeName && (
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 
                                  flex items-center justify-center text-white text-sm mr-3">
                      {subtask.assigneeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{subtask.assigneeName}</p>
                      <p className="text-xs text-gray-400">{subtask.assigneeEmail}</p>
                    </div>
                  </div>
                )}
                
                {/* Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar size={14} className="mr-2 text-green-400" />
                    <div>
                      <span className="font-medium text-gray-300">Bắt đầu:</span>
                      <span className="ml-1">{formatDate(subtask.startDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar size={14} className={`mr-2 ${isOverdue ? 'text-red-400' : 'text-blue-400'}`} />
                    <div>
                      <span className="font-medium text-gray-300">Kết thúc:</span>
                      <span className={`ml-1 ${isOverdue ? 'text-red-400' : ''}`}>
                        {formatDate(subtask.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Time remaining */}
                {!subtask.completed && (
                  <div className="text-sm">
                    {isOverdue ? (
                      <span className="text-red-400 font-medium">
                        Quá hạn {Math.abs(daysRemaining)} ngày
                      </span>
                    ) : daysRemaining === 0 ? (
                      <span className="text-yellow-400 font-medium">
                        Hết hạn hôm nay
                      </span>
                    ) : (
                      <span className={`font-medium ${daysRemaining <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        Còn {daysRemaining} ngày
                      </span>
                    )}
                  </div>
                )}
                
                {/* Completion info */}
                {subtask.completed && (
                  <div className="text-sm text-green-400">
                    <span>Hoàn thành vào {formatDate(subtask.lastModifiedDate)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 
                       p-2 rounded-full transition-colors ml-2"
              onClick={() => handleDeleteSubtask(subtask.id)}
              title="Xóa nhiệm vụ con"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}
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
                    placeholder="Viết bình luận..."
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
                              type: "TASK",
                              referenceId: task.id,
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
                          showToast("Thêm bình luận thành công", "success");
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="mt-2 text-gray-400">Đang tải bình luận...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-800 rounded-lg">
                    <MessageSquare
                      size={40}
                      className="mx-auto text-gray-500 mb-2"
                    />
                    <p className="text-gray-400">
                      Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
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
                          showToast("Xóa bình luận thành công", "success");
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
      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Modal xác nhận xóa task */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa nhiệm vụ này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setDeleteConfirm({ show: false, taskId: null })}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                onClick={handleDeleteTask}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
