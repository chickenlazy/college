import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Pause,
  Calendar,
  CheckCircle,
  Clock,
  Check,
  XCircle,
  X,
  RefreshCw,
  Loader,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  RotateCcw,
  ChevronsRight,
} from "lucide-react";
import axios from "axios";
import TaskEdit from "../edit/TaskEdit";
import TaskDetail from "../detail/TaskDetail";

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let icon;
  let displayText = status.replace(/_/g, " ");

  switch (status) {
    case "NOT_STARTED":
      color = "bg-gray-200 text-gray-800";
      icon = <Clock size={14} />;
      break;
    case "IN_PROGRESS":
      color = "bg-blue-200 text-blue-800";
      icon = <Clock size={14} />;
      break;
    case "COMPLETED":
      color = "bg-green-200 text-green-800";
      icon = <CheckCircle size={14} />;
      break;
    case "OVER_DUE":
      color = "bg-red-200 text-red-800";
      icon = <AlertTriangle size={14} />;
      break;
    case "ON_HOLD":
      color = "bg-yellow-200 text-yellow-800";
      icon = <Pause size={14} />;
      break;
    default:
      color = "bg-gray-200 text-gray-800";
      icon = <Clock size={14} />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {icon}
      {displayText}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  let color;

  switch (priority) {
    case "HIGH":
      color = "bg-red-200 text-red-800";
      break;
    case "MEDIUM":
      color = "bg-yellow-200 text-yellow-800";
      break;
    case "LOW":
      color = "bg-green-200 text-green-800";
      break;
    default:
      color = "bg-gray-200 text-gray-800";
  }

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {priority}
    </span>
  );
};

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All Tasks" },
    { id: "NOT_STARTED", label: "Not Started" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "COMPLETED", label: "Completed" },
    { id: "ON_HOLD", label: "On Hold" },
    { id: "OVER_DUE", label: "Over Due" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`px-4 py-2 rounded-md ${
            activeFilter === filter.id
              ? "bg-purple-600 text-white"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-gray-400 gap-4">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select
          className="bg-gray-800 border border-gray-700 rounded-md p-1"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>entries</span>
      </div>

      <div className="text-sm">
        Showing page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show pages around current page
          let pageNum = i + 1;
          if (currentPage > 3 && totalPages > 5) {
            pageNum = i + currentPage - 2;
          }

          if (pageNum <= totalPages) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-md ${
                  pageNum === currentPage ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({ task, onDelete, onEdit, onView }) => {
  return (
    <div className="flex gap-2">
      <button
        className="p-2 rounded-full bg-green-600 text-white"
        title="View Details"
        onClick={() => onView(task)}
      >
        <Eye size={16} />
      </button>
      <button
        className="p-2 rounded-full bg-blue-600 text-white"
        title="Edit Task"
        onClick={() => onEdit(task)}
      >
        <Edit size={16} />
      </button>
      <button
        className="p-2 rounded-full bg-red-600 text-white"
        title="Delete Task"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// Thêm các component Toast và ConfirmationDialog
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
      <XCircle size={20} />
    ) : (
      <RefreshCw size={20} />
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

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md flex items-center gap-2"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Component SuccessDialog để hiển thị thông báo thành công ở giữa màn hình
const SuccessDialog = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Tự động đóng dialog sau 1.5 giây
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      
      // Cleanup timer khi component unmount hoặc isOpen thay đổi
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in flex flex-col items-center">
        <CheckCircle size={50} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center">{message}</h2>
      </div>
    </div>
  );
};

const TeamTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [taskDetail, setTaskDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    taskId: null,
  });

  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });

  const showSuccessDialog = (message) => {
    setSuccessDialog({
      show: true,
      message: message
    });
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskEdit(true);
  };

  const handleViewTask = async (task) => {
    try {
      // Lấy token từ localStorage
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào headers
          },
        }
      );
      setTaskDetail(response.data);
      setShowTaskDetail(true);
      setShowTaskEdit(false);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching task details:", err);
      setLoading(false);
    }
  };

  const handleBackFromTaskDetail = () => {
    setShowTaskDetail(false);
    refreshData();
  };

  const [apiData, setApiData] = useState({
    content: [],
    pageNo: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: false,
  });

  // Cập nhật hàm handleDeleteTask
  const handleDeleteTask = (taskId) => {
    setDeleteConfirm({ show: true, taskId });
  };

  // Thêm hàm confirmDeleteTask
  const confirmDeleteTask = async () => {
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

      showSuccessDialog("Task deleted successfully!");
      refreshData();
    } catch (err) {
      console.error("Error deleting task:", err);
      showToast("Failed to delete task", "error");
    }
  };

  // Thêm hàm showToast
 const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

// Cập nhật hàm fetchTasks để xử lý khác biệt cho ROLE_USER
const fetchTasks = async (
  page = currentPage,
  size = itemsPerPage,
  searchTerm = search,
  filterStatus = activeFilter
) => {
  setLoading(true);
  try {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("user");
    let token = null;
    let userId = null;
    let userRole = null;
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
      userId = user.id;
      userRole = user.role;
    }

    const params = {
      page: page,
      size: size,
    };

    // Thêm tham số tìm kiếm nếu có
    if (searchTerm) {
      params.search = searchTerm;
    }

    // Thêm tham số lọc status nếu không phải "all"
    if (filterStatus !== "all") {
      params.status = filterStatus;
    }

    // Xác định URL API dựa trên vai trò người dùng
    let apiUrl = "http://localhost:8080/api/tasks";
    if (userRole === "ROLE_MANAGER") {
      apiUrl = `http://localhost:8080/api/tasks/user/${userId}`;
    }

    const response = await axios.get(apiUrl, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    setApiData(response.data);
    setTasks(response.data.content);
    setError(null); // Reset error
    setLoading(false);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    setError("Failed to load tasks. Please try again later.");
    setLoading(false);
  }
};

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.length >= 3 || search.length === 0) {
        setDebouncedSearch(search);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    fetchTasks(currentPage, itemsPerPage, debouncedSearch, activeFilter);
  }, [currentPage, itemsPerPage, debouncedSearch, activeFilter]);

  // Calculate pagination
  const currentTasks = tasks;
  const totalPages = apiData.totalPages;

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset về trang 1
    fetchTasks(1, newItemsPerPage, search, activeFilter); // Gọi API với pageSize mới
  };

  // Thêm hàm formatName để giới hạn độ dài tên task
  const formatName = (name) => {
    if (!name) return "";

    if (name.length > 25) {
      return (
        <div className="group relative cursor-pointer">
          <span>{name.substring(0, 25)}...</span>
          <div className="absolute top-full left-0 mt-1 bg-gray-800 text-white p-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-64 text-sm">
            {name}
          </div>
        </div>
      );
    }

    return name;
  };

  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    setCurrentPage(1); // Reset to the first page
    setSelectedTasks([]); // Deselect all tasks
    fetchTasks(1, itemsPerPage); // Reload data from API
  };

  const refreshData = () => {
    fetchTasks(currentPage, itemsPerPage, search, activeFilter);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(currentTasks.map((task) => task.id));
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      {showTaskEdit ? (
        <TaskEdit
          isNew={selectedTask === null}
          taskId={selectedTask?.id}
          onBack={() => {
            setShowTaskEdit(false);
            refreshData();
          }}
        />
      ) : showTaskDetail ? (
        <TaskDetail task={taskDetail} onBack={handleBackFromTaskDetail} />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">TEAM TASKS</h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-md"
                onClick={() => {
                  setSelectedTask(null);
                  setShowTaskEdit(true);
                }}
              >
                <Plus size={18} />
                <span>New</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-700 rounded-md"
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Name"
                  className="pl-4 pr-10 py-2 bg-gray-800 rounded-md w-64"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={(filter) => {
                setActiveFilter(filter);
                setCurrentPage(1); // Reset to first page when changing filter
              }}
            />
          </div>

          {/* Tasks Table */}
          <div className="mt-4 overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader
                  size={36}
                  className="text-purple-500 animate-spin mb-4"
                />
                <p className="text-gray-400">Loading task data...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">{error}</div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center p-4">No tasks found</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-left">
                    <th className="p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">Task</div>
                    </th>
                    <th className="p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">Project</div>
                    </th>
                    <th className="p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">Due Date</div>
                    </th>
                    <th className="p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">Priority</div>
                    </th>
                    <th className="p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">Status</div>
                    </th>
                    <th className="p-3 border-b border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center">
                        <div className="flex flex-col justify-center items-center h-64">
                          <Loader
                            size={36}
                            className="text-purple-500 animate-spin mb-4"
                          />
                          <p className="text-gray-400">Loading task data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentTasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center">
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    currentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-800">
                        <td className="p-3 border-b border-gray-700">
                          <div>
                            <div className="font-medium">
                              {formatName(task.name)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {task.description && task.description.length > 50
                                ? task.description.substring(0, 50) + "..."
                                : task.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          {task.projectName}
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {formatDate(task.dueDate)}
                          </div>
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="p-3 border-b border-gray-700">
                          <ActionButtons
                            task={task}
                            onDelete={handleDeleteTask}
                            onEdit={handleEditTask}
                            onView={handleViewTask}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={apiData.totalElements}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

<ConfirmationDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
      
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.show}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ show: false, message: "" })}
      />

      {/* Toast Notification - chỉ dùng cho lỗi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TeamTask;
