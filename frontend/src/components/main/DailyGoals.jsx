import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Target,
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  Trophy,
  Flame,
  Edit3,
  Trash2,
  Star,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  RotateCcw,
  X,
  Save,
  AlertCircle,
  Zap,
  Award,
  Check,
  Loader,
} from "lucide-react";

// API Configuration
const API_BASE_URL = "http://localhost:8080/api/daily-goals";

// Success Dialog Component
const SuccessDialog = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in flex flex-col items-center">
        <CheckCircle size={50} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center text-white">
          {message}
        </h2>
      </div>
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";
  const icon =
    type === "success" ? (
      <Check size={20} />
    ) : type === "error" ? (
      <X size={20} />
    ) : (
      <AlertCircle size={20} />
    );

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}
    >
      {icon}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Goal Form Component
const GoalForm = ({ isOpen, onClose, onSave, editingGoal }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "WORK",
    priority: "MEDIUM",
    estimatedTime: 30,
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      const dueDate = editingGoal.dueDate
        ? new Date(editingGoal.dueDate).toISOString().slice(0, 16)
        : "";

      setFormData({
        title: editingGoal.title || "",
        description: editingGoal.description || "",
        category: editingGoal.category || "WORK",
        priority: editingGoal.priority || "MEDIUM",
        estimatedTime: editingGoal.estimatedTime || 30,
        dueDate: dueDate,
      });
    } else {
      // Set default due date to today 23:59
      const today = new Date();
      today.setHours(23, 59);
      const dueDateStr = today.toISOString().slice(0, 16);

      setFormData({
        title: "",
        description: "",
        category: "WORK",
        priority: "MEDIUM",
        estimatedTime: 30,
        dueDate: dueDateStr,
      });
    }
  }, [editingGoal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const goalData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        estimatedTime: parseInt(formData.estimatedTime),
        dueDate: new Date(formData.dueDate).toISOString(),
        progress: editingGoal ? editingGoal.progress : 0,
        completed: editingGoal ? editingGoal.completed : false,
      };

      await onSave(goalData, editingGoal);
      onClose();
    } catch (error) {
      console.error("Error saving goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
        <h2 className="text-xl font-bold mb-4 text-white">
          {editingGoal ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tiêu đề mục tiêu"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết mục tiêu"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Danh mục
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                disabled={isSubmitting}
              >
                <option value="WORK">Công việc</option>
                {/* <option value="HEALTH">Sức khỏe</option> */}
                {/* <option value="LEARNING">Học tập</option> */}
                <option value="PERSONAL">Cá nhân</option>
                {/* <option value="FINANCE">Tài chính</option> */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Độ ưu tiên
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                disabled={isSubmitting}
              >
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thời gian ước tính (phút)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTime: parseInt(e.target.value) || 30,
                  })
                }
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hạn hoàn thành
              </label>
              <input
                type="datetime-local"
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSubmitting
                ? "Đang lưu..."
                : editingGoal
                ? "Cập nhật"
                : "Tạo mục tiêu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const configs = {
    HIGH: {
      color: "bg-red-200 text-red-800",
      label: "Cao",
      icon: <Flame size={12} />,
    },
    MEDIUM: {
      color: "bg-yellow-200 text-yellow-800",
      label: "Trung bình",
      icon: <Zap size={12} />,
    },
    LOW: {
      color: "bg-green-200 text-green-800",
      label: "Thấp",
      icon: <Circle size={12} />,
    },
  };

  const config = configs[priority] || configs.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// Category Badge Component
const CategoryBadge = ({ category }) => {
  const configs = {
    WORK: { color: "bg-blue-200 text-blue-800", label: "Công việc" },
    // HEALTH: { color: "bg-green-200 text-green-800", label: "Sức khỏe" },
    // LEARNING: { color: "bg-purple-200 text-purple-800", label: "Học tập" },
    PERSONAL: { color: "bg-pink-200 text-pink-800", label: "Cá nhân" },
    // FINANCE: { color: "bg-orange-200 text-orange-800", label: "Tài chính" },
  };

  const config = configs[category] || {
    color: "bg-gray-200 text-gray-800",
    label: category,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// Goal Card Component
const GoalCard = ({
  goal,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [newProgress, setNewProgress] = useState(goal.progress);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProgressUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdateProgress(goal.id, newProgress);
      setShowProgressUpdate(false);
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`;
    } else if (diffDays === 0) {
      return "Hôm nay";
    } else if (diffDays === 1) {
      return "Ngày mai";
    } else {
      return `${diffDays} ngày nữa`;
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border-l-4 transition-all duration-200 hover:shadow-lg ${
        goal.completed ? "border-green-500 bg-gray-800/70" : "border-purple-500"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleComplete(goal.id, !goal.completed)}
            className={`p-1 rounded-full transition-colors ${
              goal.completed
                ? "text-green-500 hover:text-green-400"
                : "text-gray-400 hover:text-purple-500"
            }`}
          >
            {goal.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
          </button>
          <div>
            <h3
              className={`font-medium text-lg ${
                goal.completed ? "line-through text-gray-500" : "text-white"
              }`}
            >
              {goal.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-full transition-colors"
            title="Chỉnh sửa"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <CategoryBadge category={goal.category} />
        <PriorityBadge priority={goal.priority} />
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Clock size={14} />
          {formatTime(goal.estimatedTime)}
        </div>
      </div>

      {!goal.completed && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Tiến độ</span>
            <button
              onClick={() => setShowProgressUpdate(!showProgressUpdate)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Cập nhật
            </button>
          </div>

          {showProgressUpdate ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value))}
                className="flex-1"
                disabled={isUpdating}
              />
              <span className="text-sm text-gray-400 w-12">{newProgress}%</span>
              <button
                onClick={handleProgressUpdate}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs flex items-center gap-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader size={12} className="animate-spin" />
                ) : (
                  "Lưu"
                )}
              </button>
            </div>
          ) : (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${goal.progress}%` }}
              />
              <span className="text-xs text-gray-400 mt-1 block">
                {goal.progress}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Hạn: {formatDate(goal.dueDate)}</span>
        {goal.completed && (
          <div className="flex items-center gap-1 text-green-500">
            <Trophy size={12} />
            Hoàn thành
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, color = "purple" }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-${color}-600/20 text-${color}-500`}>
        {icon}
      </div>
    </div>
  </div>
);

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "completed", label: "Hoàn thành" },
    { id: "pending", label: "Đang thực hiện" },
    { id: "HIGH", label: "Ưu tiên cao" },
    // { id: "WORK", label: "Công việc" },
    // { id: "HEALTH", label: "Sức khỏe" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            activeFilter === filter.id
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// Main DailyGoals Component
const DailyGoals = () => {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);
    }
  }, []);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    pendingGoals: 0,
    todayGoals: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });
  const [toast, setToast] = useState(null);

  // API Functions
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      let token = null;
      let currentUserId = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
        currentUserId = user.id;
      }

      const response = await axios.get(
        `${API_BASE_URL}/all?userId=${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      showToast("Không thể tải dữ liệu mục tiêu", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      let currentUserId = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
        currentUserId = user.id;
      }

      const response = await axios.get(
        `${API_BASE_URL}/stats?userId=${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, []);

  // Filter goals based on search and active filter
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeFilter) {
      case "completed":
        return matchesSearch && goal.completed;
      case "pending":
        return matchesSearch && !goal.completed;
      case "HIGH":
        return matchesSearch && goal.priority === "HIGH";
      case "WORK":
      case "HEALTH":
        return matchesSearch && goal.category === activeFilter;
      default:
        return matchesSearch;
    }
  });

  // Handle goal save
  const handleSaveGoal = async (goalData, editingGoal) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      let currentUserId = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
        currentUserId = user.id;
      }

      if (editingGoal) {
        await axios.put(
          `${API_BASE_URL}/${editingGoal.id}?userId=${currentUserId}`,
          goalData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showSuccessMessage("Mục tiêu đã được cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE_URL}?userId=${currentUserId}`, goalData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessMessage("Mục tiêu mới đã được tạo thành công!");
      }

      await fetchGoals();
      await fetchStats();
      setEditingGoal(null);
    } catch (error) {
      console.error("Error saving goal:", error);
      showToast("Không thể lưu mục tiêu", "error");
      throw error;
    }
  };

  // Handle goal toggle complete
  const handleToggleComplete = async (goalId, completed) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      let currentUserId = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
        currentUserId = user.id;
      }

      await axios.patch(
        `${API_BASE_URL}/${goalId}/toggle?userId=${currentUserId}`,
        {
          completed: completed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (completed) {
        showSuccessMessage("Chúc mừng! Bạn đã hoàn thành mục tiêu!");
      }

      await fetchGoals();
      await fetchStats();
    } catch (error) {
      console.error("Error toggling goal:", error);
      showToast("Không thể cập nhật trạng thái mục tiêu", "error");
    }
  };

  // Handle goal edit
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  // Handle goal delete
const handleDeleteGoal = async (goalId) => {
  try {
    const storedUser = localStorage.getItem("user");
    let token = null;
    let currentUserId = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
      currentUserId = user.id;
    }

    await axios.delete(
      `${API_BASE_URL}/${goalId}?userId=${currentUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    showToast("Mục tiêu đã được xóa", "success");
    await fetchGoals();
    await fetchStats();
  } catch (error) {
    console.error("Error deleting goal:", error);
    showToast("Không thể xóa mục tiêu", "error");
  }
};

  // Handle progress update
  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      let currentUserId = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
        currentUserId = user.id;
      }

      await axios.patch(
        `${API_BASE_URL}/${goalId}/progress?userId=${currentUserId}`,
        {
          progress: newProgress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Tiến độ đã được cập nhật", "success");
      await fetchGoals();
      await fetchStats();
    } catch (error) {
      console.error("Error updating progress:", error);
      showToast("Không thể cập nhật tiến độ", "error");
      throw error;
    }
  };

  // Handle reset
  const handleReset = () => {
    setSearchTerm("");
    setActiveFilter("all");
  };

  const showSuccessMessage = (message) => {
    setSuccessDialog({ show: true, message });
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-950 text-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader size={48} className="text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400">Đang tải dữ liệu mục tiêu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-950 text-white min-h-screen">
      <div >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">
              MỤC TIÊU HÀNG NGÀY
            </h1>
            <p className="text-gray-400 mt-2">
              Quản lý và theo dõi mục tiêu của bạn mỗi ngày
            </p>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setShowGoalForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Tạo mục tiêu mới
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatsCard
            icon={<Target size={24} />}
            title="Tổng mục tiêu"
            value={stats.totalGoals}
            color="purple"
          />
          <StatsCard
            icon={<CheckCircle size={24} />}
            title="Hoàn thành"
            value={stats.completedGoals}
            color="green"
          />
          <StatsCard
            icon={<Clock size={24} />}
            title="Đang thực hiện"
            value={stats.pendingGoals}
            color="yellow"
          />
          <StatsCard
            icon={<TrendingUp size={24} />}
            title="Tỷ lệ hoàn thành"
            value={`${stats.completionRate.toFixed(1)}%`}
            color="blue"
          />
          <StatsCard
            icon={<Calendar size={24} />}
            title="Hôm nay"
            value={stats.todayGoals}
            color="pink"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm mục tiêu..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={18} />
            Đặt lại
          </button>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Goals Grid */}
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <Target size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchTerm || activeFilter !== "all"
                  ? "Không tìm thấy mục tiêu nào"
                  : "Chưa có mục tiêu nào"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || activeFilter !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  : "Hãy tạo mục tiêu đầu tiên của bạn"}
              </p>
              {!searchTerm && activeFilter === "all" && (
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setShowGoalForm(true);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={18} />
                  Tạo mục tiêu đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </div>

        {/* Motivational Section */}
        {stats.completedGoals > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/30 rounded-full">
                <Award size={32} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Xuất sắc! Bạn đã hoàn thành {stats.completedGoals} mục tiêu
                </h3>
                <p className="text-gray-300">
                  Tiếp tục duy trì momentum này và đạt được những thành tựu lớn
                  hơn!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {stats.completionRate.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-400">Tỷ lệ hoàn thành tổng thể</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.round(
                (stats.completedGoals / (stats.totalGoals || 1)) *
                  stats.totalGoals
              )}
            </div>
            <p className="text-sm text-gray-400">Mục tiêu đã đạt được</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {stats.todayGoals}
            </div>
            <p className="text-sm text-gray-400">Mục tiêu hôm nay</p>
          </div>
        </div>
      </div>

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={showGoalForm}
        onClose={() => {
          setShowGoalForm(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.show}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ show: false, message: "" })}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #374151;
        }

        ::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Progress slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #374151;
          border-radius: 3px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default DailyGoals;
