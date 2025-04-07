import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Loader,
  Check,
  XCircle,
  X,
  Clock,
  CheckCircle,
  RefreshCw,
  RotateCcw,
  ClipboardList,
  FolderKanban,
  User,
  Calendar,
  Bell,
  HelpCircle,
  AlertTriangle,
  Info
} from "lucide-react";

// Format date to show in card
const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Format full date with time
const formatDateTime = (dateString) => {
  if (!dateString) return "Not available";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "incomplete", label: "Incomplete" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`px-4 py-2 rounded-md ${
            activeFilter === filter.id
              ? "bg-purple-600"
              : "bg-gray-800 hover:bg-gray-700"
          } transition-colors duration-200`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// Enhanced Subtask Card Component
const EnhancedSubtaskCard = ({ subtask, onToggle }) => {
  // Check if due date is passed
  const isDueDatePassed = () => {
    if (!subtask.dueDate) return false;
    return new Date(subtask.dueDate) < new Date() && !subtask.completed;
  };

  return (
    <div className={`${isDueDatePassed() ? 'border-red-500 border-2' : 'border border-gray-700'} bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}>
      {/* Card Header with Status */}
      <div className={`p-4 ${subtask.completed ? 'bg-green-900/30' : isDueDatePassed() ? 'bg-red-900/30' : 'bg-purple-900/30'}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-white max-w-[70%] truncate">{subtask.name}</h3>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              subtask.completed
                ? "bg-green-200 text-green-800"
                : isDueDatePassed()
                ? "bg-red-200 text-red-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {subtask.completed ? (
              <>
                <CheckCircle size={12} />
                <span>Completed</span>
              </>
            ) : isDueDatePassed() ? (
              <>
                <AlertTriangle size={12} />
                <span>Overdue</span>
              </>
            ) : (
              <>
                <Clock size={12} />
                <span>In Progress</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Body - Main Information */}
      <div className="p-4">
        <div className="space-y-4">
          {/* First Row - Task Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple-900/20 text-purple-400 rounded-full mr-3">
              <ClipboardList size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-medium">Task</p>
              <p className="text-sm font-medium truncate">{subtask.taskName || "N/A"}</p>
            </div>
          </div>
          
          {/* Second Row - Project Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-900/20 text-blue-400 rounded-full mr-3">
              <FolderKanban size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-medium">Project</p>
              <p className="text-sm font-medium truncate">{subtask.projectName || "N/A"}</p>
            </div>
          </div>
          
          {/* Dates Row - Combined Start & Due Date */}
          <div className="flex">
            {/* Start Date */}
            <div className="flex items-center flex-1 mr-3">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-900/20 text-yellow-400 rounded-full mr-3">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">Start Date</p>
                <p className="text-sm font-medium">{formatDate(subtask.startDate)}</p>
              </div>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-900/20 text-red-400 rounded-full mr-3">
                <Bell size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">Due Date</p>
                <p className={`text-sm font-medium ${isDueDatePassed() ? 'text-red-500 font-bold' : ''}`}>
                  {formatDate(subtask.dueDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information (if needed) */}
      {subtask.description && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-300">{subtask.description}</p>
        </div>
      )}



      {/* Card Footer with Action Button */}
      <div className="p-3 bg-gray-900 flex justify-center">
        <button
          onClick={() => onToggle(subtask.id)}
          className={`w-full py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            subtask.completed
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {subtask.completed ? (
            <>
              <X size={16} />
              <span>Mark as Incomplete</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Mark as Complete</span>
            </>
          )}
        </button>
      </div>
      
      {/* Subtle ID indicator at bottom */}
      <div className="px-3 py-1 bg-gray-900 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">ID: {subtask.id}</p>
      </div>
    </div>
  );
};

const Subtask = () => {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Fetch user from localStorage
  const getUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  };

  const user = getUser();

  // Load data from API
  const fetchSubtasks = async () => {
    if (!user || !user.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let token = user.accessToken;
      
      const response = await axios.get(
        `http://localhost:8080/api/subtasks/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle response
      if (Array.isArray(response.data)) {
        setSubtasks(response.data);
      } else if (response.data.content) {
        setSubtasks(response.data.content);
      } else {
        setSubtasks([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subtasks:", err);
      setError("Failed to load subtasks. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, []);

  // Filter subtasks based on active filter and search
  const filteredSubtasks = subtasks.filter(subtask => {
    // Apply completion filter
    if (activeFilter === "completed" && !subtask.completed) return false;
    if (activeFilter === "incomplete" && subtask.completed) return false;
    
    // Apply search filter (case insensitive)
    if (search && search.length > 0) {
      const searchLower = search.toLowerCase();
      return (
        (subtask.name && subtask.name.toLowerCase().includes(searchLower)) ||
        (subtask.taskName && subtask.taskName.toLowerCase().includes(searchLower)) ||
        (subtask.projectName && subtask.projectName.toLowerCase().includes(searchLower)) ||
        (subtask.assigneeName && subtask.assigneeName.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Handle toggle subtask status
  const handleToggleStatus = async (subtaskId) => {
    try {
      const token = user.accessToken;
      
      await axios.patch(
        `http://localhost:8080/api/subtasks/${subtaskId}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the subtask in the local state
      const updatedSubtasks = subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );
      
      setSubtasks(updatedSubtasks);
      showToast("Subtask status updated successfully", "success");
    } catch (err) {
      console.error("Error toggling subtask status:", err);
      showToast("Failed to update subtask status", "error");
    }
  };

  // Handle Reset functionality
  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    fetchSubtasks(); // Reload data from API
  };

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          <span className="text-purple-400">MY</span> SUBTASKS
        </h1>
        <div className="text-sm text-gray-400">
          {filteredSubtasks.length} subtask{filteredSubtasks.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors"
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
              placeholder="Search subtasks..."
              className="pl-10 pr-4 py-2 bg-gray-800 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Subtask Cards */}
      <div className="mt-4 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader
              size={36}
              className="text-purple-500 animate-spin mb-4"
            />
            <p className="text-gray-400">Loading your subtasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-64 text-center p-4">
            <XCircle size={36} className="text-red-500 mb-4" />
            <p className="text-red-400 font-medium text-lg mb-2">Error</p>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : filteredSubtasks.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <ClipboardList size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No subtasks found</h3>
            <p className="text-gray-400 max-w-md">
              {search || activeFilter !== "all" 
                ? "Try adjusting your filters or search query" 
                : "You don't have any assigned subtasks at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubtasks.map((subtask) => (
              <EnhancedSubtaskCard
                key={subtask.id}
                subtask={subtask}
                onToggle={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
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

export default Subtask;