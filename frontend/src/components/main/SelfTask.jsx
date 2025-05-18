import React, { useState, useEffect } from "react";
import axios from "axios"; // Thêm import axios
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  ChevronsRight,
  ChevronLeft,
  ChevronsLeft,
  Clock,
  CheckCircle,
  Calendar,
  AlertTriangle,
  ChevronUp,
  Flag,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader,
  XCircle,
  Check,
  FolderOpen,
  ListChecks,
} from "lucide-react";
import TaskEdit from "../edit/TaskEdit";
import TaskDetail from "../detail/TaskDetail";

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
        <span>mục</span>
      </div>

      <div className="text-sm">
        Đang hiển thị {currentPage} of {totalPages}
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

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();

  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Check if date is tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Check if a task is overdue
const isOverdue = (task) => {
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  return dueDate < today && task.status !== "COMPLETED";
};

// Toast notification component
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
      <AlertTriangle size={20} />
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
        <XCircle size={16} />
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

// Task Card Component
const TaskCard = ({ task, onEdit, onMarkAsCompleted, onDelete, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine status color and icon
  let statusColor = "bg-gray-600";
  let statusIcon = <Clock size={16} />;
  let statusText = "Not Started";

  if (isOverdue(task)) {
    statusColor = "bg-red-600";
    statusIcon = <AlertTriangle size={16} />;
    statusText = "Overdue";
  } else if (task.status === "COMPLETED") {
    statusColor = "bg-green-600";
    statusIcon = <CheckCircle size={16} />;
    statusText = "Completed";
  } else if (task.status === "IN_PROGRESS") {
    statusColor = "bg-blue-600";
    statusIcon = <Clock size={16} />;
    statusText = "In Progress";
  }

  // Determine priority color and text
  let priorityColor = "text-gray-400";
  let priorityBg = "bg-gray-700";
  if (task.priority === "HIGH") {
    priorityColor = "text-red-500";
    priorityBg = "bg-red-950";
  } else if (task.priority === "MEDIUM") {
    priorityColor = "text-yellow-500";
    priorityBg = "bg-yellow-950";
  } else if (task.priority === "LOW") {
    priorityColor = "text-green-500";
    priorityBg = "bg-green-950";
  }

  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-md flex flex-col hover:shadow-lg transition-all duration-200 ${
        isHovered ? "transform scale-[1.02]" : ""
      } border border-transparent hover:border-gray-700`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      onClick={onClick}
    >
      {/* Task Status Bar */}
      <div className={`h-1.5 w-full ${statusColor}`}></div>

      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-white line-clamp-1">{task.name}</h3>
        </div>

        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <div
                className={`flex items-center gap-1 ${statusColor} bg-opacity-20 px-2 py-1 rounded-full`}
              >
                {statusIcon}
                <span>{statusText}</span>
              </div>
            </div>
            <div className="flex items-center">
              <div
                className={`flex items-center gap-1 text-xs ${priorityBg} ${priorityColor} px-2 py-1 rounded-full`}
              >
                <Flag size={12} />
                <span>{task.priority}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FolderOpen size={14} className="text-gray-400" />
              <span className="text-gray-400 text-xs">{task.projectName}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="text-gray-400 mr-1" />
              <span className="text-gray-400 text-xs">
                {isOverdue(task) ? (
                  <span className="text-red-400">
                    Overdue: {formatDate(task.dueDate)}
                  </span>
                ) : (
                  <span>Due: {formatDate(task.dueDate)}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, active, onClick, icon }) => (
  <button
    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
      active
        ? "bg-purple-700 text-white shadow-md shadow-purple-900/50"
        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

// Empty State Component
const EmptyState = ({ message, icon }) => (
  <div className="bg-gray-800 rounded-lg p-8 text-center animate-fade-in">
    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium text-gray-300 mb-2">No tasks found</h3>
    <p className="text-gray-400">{message}</p>
  </div>
);

// Task Stats Component
const TaskStats = ({ tasks }) => (
  <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-400 bg-gray-800 p-4 rounded-lg shadow-inner">
    <div className="flex items-center">
      <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
      <span>{tasks.filter((t) => isOverdue(t)).length} Overdue</span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
      <span>
        {tasks.filter((t) => t.status === "IN_PROGRESS").length} In Progress
      </span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
      <span>
        {tasks.filter((t) => t.status === "NOT_STARTED").length} Not Started
      </span>
    </div>
    <div className="flex items-center">
      <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
      <span>
        {tasks.filter((t) => t.status === "COMPLETED").length} Completed
      </span>
    </div>
  </div>
);

// Main SelfTask Component
const SelfTask = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    taskId: null,
  });
  const [apiData, setApiData] = useState({
    content: [],
    pageNo: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  const fetchTasks = async (
    page = currentPage,
    size = itemsPerPage,
    searchTerm = search,
    filterStatus = activeFilter
  ) => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let userId = 1; // Fallback
      let token = null;
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.id;
        token = parsedUser.accessToken;
      }
  
      const params = {
        pageNo: page,
        pageSize: size,
      };
  
      // Thêm tham số tìm kiếm nếu có
      if (searchTerm) {
        params.search = searchTerm;
      }
  
      // Thêm tham số lọc status nếu không phải "all"
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
  
      const response = await axios.get(`http://localhost:8080/api/tasks/user/${userId}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setApiData(response.data);
      setTasks(response.data.content);
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

  
  // Trong render, thêm xử lý error
  {error && (
    <div className="text-center p-4 text-red-500">{error}</div>
  )}

  // Update useEffect để gọi fetchTasks
  useEffect(() => {
    fetchTasks(currentPage, itemsPerPage);
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchTasks(pageNumber, itemsPerPage);
  };

  // Handler Functions
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsCompleted = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: "COMPLETED" } : task
    );

    setTasks(updatedTasks);
    showToast("Task marked as completed", "success");
  };

  const handleDeleteTask = (taskId) => {
    setDeleteConfirm({ show: true, taskId });
  };

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
  
      showToast("Task deleted successfully", "success");
      fetchTasks(currentPage, itemsPerPage); // Refresh data
    } catch (err) {
      console.error("Error deleting task:", err);
      showToast("Failed to delete task", "error");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setShowTaskEdit(true);
  };

  const handleCreateTask = () => {
    setIsNewTask(true);
    setSelectedTask(null);
    setShowTaskEdit(true);
  };

  const handleTaskEditClose = (taskData) => {
    setShowTaskEdit(false);

    // If task data was returned, update or add task
    if (taskData) {
      if (isNewTask) {
        // Add new task
        setTasks([...tasks, { ...taskData, id: Date.now() }]);
        showToast("New task created successfully", "success");
      } else {
        // Update existing task
        setTasks(
          tasks.map((task) => (task.id === taskData.id ? taskData : task))
        );
        showToast("Task updated successfully", "success");
      }
    }
  };

<Pagination
  currentPage={apiData.pageNo}
  totalPages={apiData.totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={apiData.pageSize}
  totalItems={apiData.totalElements}
  onItemsPerPageChange={(newSize) => {
    setItemsPerPage(newSize);
    fetchTasks(1, newSize);
  }}
/>

  // Filter tasks based on active filter and search
  const filteredTasks = tasks.filter((task) => {
    // Apply status filter
    if (activeFilter === "overdue") {
      if (!isOverdue(task)) return false;
    } else if (activeFilter === "completed") {
      if (task.status !== "COMPLETED") return false;
    } else if (activeFilter === "in-progress") {
      if (task.status !== "IN_PROGRESS") return false;
    } else if (activeFilter === "not-started") {
      if (task.status !== "NOT_STARTED") return false;
    } else if (activeFilter === "high-priority") {
      if (task.priority !== "HIGH") return false;
    }

    // Apply search filter
    if (
      search &&
      !task.name.toLowerCase().includes(search.toLowerCase()) &&
      !task.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Component Rendering
  if (showTaskEdit) {
    return (
      <TaskEdit
        isNew={isNewTask}
        task={selectedTask}
        onBack={handleTaskEditClose}
      />
    );
  }

  if (selectedTask) {
    return (
      <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">SELF TASKS</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage and track your personal tasks
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 bg-gray-800 rounded-md w-full text-white border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-md sm:w-auto w-full justify-center border border-gray-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronUp
              size={18}
              className={`transform transition-transform duration-300 ${
                showFilters ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700 animate-fade-in">
            <FilterChip
              label="All Tasks"
              icon={<ListChecks size={14} />}
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            <FilterChip
              label="Not Started"
              icon={<Clock size={14} />}
              active={activeFilter === "not-started"}
              onClick={() => setActiveFilter("not-started")}
            />
            <FilterChip
              label="In Progress"
              icon={<Clock size={14} className="text-blue-500" />}
              active={activeFilter === "in-progress"}
              onClick={() => setActiveFilter("in-progress")}
            />
            <FilterChip
              label="Completed"
              icon={<CheckCircle size={14} />}
              active={activeFilter === "completed"}
              onClick={() => setActiveFilter("completed")}
            />
            <FilterChip
              label="Overdue"
              icon={<AlertTriangle size={14} />}
              active={activeFilter === "overdue"}
              onClick={() => setActiveFilter("overdue")}
            />
            <FilterChip
              label="High Priority"
              icon={<Flag size={14} className="text-red-500" />}
              active={activeFilter === "high-priority"}
              onClick={() => setActiveFilter("high-priority")}
            />
          </div>
        )}
      </div>

      {/* Task Content Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader size={36} className="text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          message="Try adjusting your search or filter to find what you're looking for."
          icon={<Search size={32} className="text-gray-500" />}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onMarkAsCompleted={handleMarkAsCompleted}
                onDelete={handleDeleteTask}
                onClick={() => setSelectedTask(task)} // Thêm onClick để set selectedTask
              />
            ))}
          </div>

          {/* Tasks Summary */}
          {filteredTasks.length > 0 && <TaskStats tasks={tasks} />}
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />

      {/* Add CSS animations for better UX */}
      <style>
        {`
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-in-up {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scale-in {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
`}
      </style>
    </div>
  );
};

export default SelfTask;
