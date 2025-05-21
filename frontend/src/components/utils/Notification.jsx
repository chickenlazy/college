import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Bell,
  Check,
  Calendar,
  Clock,
  X,
  User,
  FolderKanban,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  // Format date to "x time ago" format
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút${diffInMinutes > 1 ? "s" : ""} trước`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ${diffInHours > 1 ? "s" : ""} trước`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ngày${diffInDays > 1 ? "s" : ""} trước`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} tháng${diffInMonths > 1 ? "s" : ""} trước`;
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "PROJECT":
        return <FolderKanban size={18} className="text-purple-500" />;
      case "TASK":
        return <CheckCircle size={18} className="text-blue-500" />;
      case "USER":
        return <User size={18} className="text-green-500" />;
      case "SYSTEM":
        return <AlertTriangle size={18} className="text-yellow-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Handle click on notification if there's a reference ID (navigate to project/task)
  const handleNotificationClick = () => {
    // Nếu có referenceId và notification.type là PROJECT hoặc TASK
    // thì có thể chuyển hướng người dùng đến trang chi tiết tương ứng
    if (notification.referenceId) {
      if (notification.type === "PROJECT") {
        // window.location.href = `/projects/${notification.referenceId}`;
        // Hoặc sử dụng navigation từ router nếu dùng React Router
      } else if (notification.type === "TASK") {
        // window.location.href = `/tasks/${notification.referenceId}`;
      }
    }
  };

  return (
    <div
      className={`border-b border-gray-700 p-3 hover:bg-gray-800 transition-colors ${
        notification.status !== "READ" ? "bg-gray-850" : ""
      }`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h4
              className={`font-medium ${
                notification.status !== "READ" ? "text-white" : "text-gray-300"
              }`}
            >
              {notification.title}
            </h4>
            <span className="text-xs text-gray-400">
              {formatTimeAgo(notification.createdDate)}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{notification.content}</p>

          <div className="flex justify-end mt-2 space-x-2">
            {notification.status !== "READ" && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan toả lên parent div
                  onMarkAsRead(notification.id);
                }}
                className="text-xs flex items-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Check size={14} className="mr-1" />
                Đánh dấu đã đọc
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan toả lên parent div
                onDelete(notification.id);
              }}
              className="text-xs flex items-center text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={14} className="mr-1" />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "unread", "read"
  const notificationRef = useRef(null);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when component mounts or notifications are updated
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Poll for new notifications every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (localStorage.getItem("user")) {
        fetchUnreadCount();
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  // Initial unread count check
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const token = user.accessToken;

      const response = await axios.get(
        `http://localhost:8080/api/notifications/user/${user.id}/count-unread`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(response.data);
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const token = user.accessToken;

      // Sử dụng pageNo và pageSize cho phân trang
      const response = await axios.get(
        `http://localhost:8080/api/notifications/user/${user.id}?pageNo=1&pageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // API trả về dạng PagedResponse, cần lấy ra mảng content
      setNotifications(response.data.content);
      console.log("API response:", response.data);
      fetchUnreadCount(); // Update unread count
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please Thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const token = user.accessToken;

      // API trả về notification đã cập nhật
      const response = await axios.put(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: "READ" } 
            : notification
        )
      );

      fetchUnreadCount(); // Update unread count
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const token = user.accessToken;

      // API của bạn vẫn trả về response object thay vì no content
      await axios.delete(
        `http://localhost:8080/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );

      fetchUnreadCount(); // Update unread count
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const token = user.accessToken;

      await axios.put(
        `http://localhost:8080/api/notifications/user/${user.id}/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, status: "READ" }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return notification.status !== "READ";
    if (activeTab === "read") return notification.status === "READ";
    return true;
  });

  const toggleNotificationPanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="relative p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
        onClick={toggleNotificationPanel}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {unreadCount > 99 ? "99+" : unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-900 rounded-lg shadow-lg z-50 border border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "all"
                  ? "text-purple-500 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "unread"
                  ? "text-purple-500 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("unread")}
            >
              Chưa đọc
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "read"
                  ? "text-purple-500 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("read")}
            >
              Đã đọc
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                <p>{error}</p>
                <button
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                  onClick={fetchNotifications}
                >
                  Thử lại
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-3 opacity-50" />
                <p>Không có thông báo để hiển thị</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
