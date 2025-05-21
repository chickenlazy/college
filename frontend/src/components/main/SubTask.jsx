import React, { useState, useEffect } from "react";
import UserTaskDetail from "../detail/UserTaskDetail";
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
  Eye,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Info,
} from "lucide-react";

// Format date to show in card
const formatDate = (dateString) => {
  if (!dateString) return "Chưa đặt";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Format full date with time
const formatDateTime = (dateString) => {
  if (!dateString) return "Không khả dụng";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    { id: "all", label: "Tất cả" },
    { id: "completed", label: "Hoàn thành" },
    { id: "incomplete", label: "Chưa hoàn thành" },
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

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-gray-400 gap-4">
      <div className="flex items-center gap-2">
        <span>Hiển thị</span>
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
        Đang hiển thị {currentPage} trong tổng số {totalPages} ({totalItems} mục)
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

// Enhanced Subtask Card Component
const EnhancedSubtaskCard = ({ subtask, onToggle, onViewDetails }) => {
  // Check if due date is passed
  const isDueDatePassed = () => {
    if (!subtask.dueDate) return false;
    return new Date(subtask.dueDate) < new Date() && !subtask.completed;
  };

  return (
    <div
      className={`${
        isDueDatePassed() ? "border-red-500 border-2" : "border border-gray-700"
      } bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Card Header with Status */}
      <div
        className={`p-4 ${
          subtask.completed
            ? "bg-green-900/30"
            : isDueDatePassed()
            ? "bg-red-900/30"
            : "bg-purple-900/30"
        }`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-white max-w-[70%] truncate">
            {subtask.name}
          </h3>
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
                <span>Hoàn thành</span>
              </>
            ) : isDueDatePassed() ? (
              <>
                <AlertTriangle size={12} />
                <span>Quá hạn</span>
              </>
            ) : (
              <>
                <Clock size={12} />
                <span>Đang tiến hành</span>
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
              <p className="text-xs text-gray-400 font-medium">Nhiệm vụ</p>
              <p className="text-sm font-medium truncate">
                {subtask.taskName || "N/A"}
              </p>
            </div>
          </div>

          {/* Second Row - Project Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-900/20 text-blue-400 rounded-full mr-3">
              <FolderKanban size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-medium">Dự án</p>
              <p className="text-sm font-medium truncate">
                {subtask.projectName || "N/A"}
              </p>
            </div>
          </div>

          {/* Dates Row - Combined Start & Due Date */}
          <div className="flex">
            {/* Ngày bắt đầu */}
            <div className="flex items-center flex-1 mr-3">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-900/20 text-yellow-400 rounded-full mr-3">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">Ngày bắt đầu</p>
                <p className="text-sm font-medium">
                  {formatDate(subtask.startDate)}
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-900/20 text-red-400 rounded-full mr-3">
                <Bell size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">Ngày kết thúc</p>
                <p                                            
                  className={`text-sm font-medium ${
                    isDueDatePassed() ? "text-red-500 font-bold" : ""
                  }`}
                >
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
          <p className="text-xs text-gray-400 mb-1">Mô tả</p>
          <p className="text-sm text-gray-300">{subtask.description}</p>
        </div>
      )}

      {/* Card Footer with Action Button */}
      {/* Card Footer with Action Button */}
      <div className="p-3 bg-gray-900 flex justify-between gap-2">
        <button
          onClick={() => onViewDetails(subtask)}
          className="flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <Eye size={16} />
          <span>Xem chi tiết</span>
        </button>
        <button
          onClick={() => onToggle(subtask.id)}
          className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            subtask.completed
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {subtask.completed ? (
            <>
              <X size={16} />
              <span>Đánh dấu chưa hoàn thành</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Đánh dấu hoàn thành</span>
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
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [apiData, setApiData] = useState({
    content: [],
    pageNo: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

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
  const fetchSubtasks = async (
    page = currentPage,
    size = itemsPerPage,
    searchTerm = debouncedSearch,
    filterStatus = activeFilter
  ) => {
    if (!user || !user.id) {
      setError("Người dùng chưa được xác thực");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let token = user.accessToken;

      const params = {
        pageNo: page,
        pageSize: size,
      };

      // Add search parameter if exists
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add completion filter if not 'all'
      if (filterStatus === "completed") {
        params.completed = true;
      } else if (filterStatus === "incomplete") {
        params.completed = false;
      }

      const response = await axios.get(
        `http://localhost:8080/api/subtasks/user/${user.id}`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle response
      if (response.data.content) {
        setApiData(response.data);
        setSubtasks(response.data.content);
      } else if (Array.isArray(response.data)) {
        // Handle if API returns array instead of paginated response
        setSubtasks(response.data);
        setApiData({
          content: response.data,
          pageNo: 1,
          pageSize: size,
          totalElements: response.data.length,
          totalPages: 1,
          last: true,
        });
      } else {
        setSubtasks([]);
        setApiData({
          content: [],
          pageNo: 1,
          pageSize: size,
          totalElements: 0,
          totalPages: 1,
          last: true,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching subtasks:", err);
      setError("Failed to load subtasks. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks(currentPage, itemsPerPage, debouncedSearch, activeFilter);
  }, [currentPage, itemsPerPage, debouncedSearch, activeFilter]);

  // Add pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleViewDetails = (subtask) => {
    setSelectedSubtask(subtask);
    setShowTaskDetail(true);
  };

  // Thêm hàm xử lý quay lại
  const handleBackFromDetail = () => {
    setShowTaskDetail(false);
    setSelectedSubtask(null);
  };

  // Filter subtasks based on active filter and search
  const filteredSubtasks = subtasks.filter((subtask) => {
    // Apply completion filter
    if (activeFilter === "completed" && !subtask.completed) return false;
    if (activeFilter === "incomplete" && subtask.completed) return false;

    // Apply search filter (case insensitive)
    if (search && search.length > 0) {
      const searchLower = search.toLowerCase();
      return (
        (subtask.name && subtask.name.toLowerCase().includes(searchLower)) ||
        (subtask.taskName &&
          subtask.taskName.toLowerCase().includes(searchLower)) ||
        (subtask.projectName &&
          subtask.projectName.toLowerCase().includes(searchLower)) ||
        (subtask.assigneeName &&
          subtask.assigneeName.toLowerCase().includes(searchLower))
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
      const updatedSubtasks = subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      );

      setSubtasks(updatedSubtasks);
      showToast("Cập nhật trạng thái nhiệm vụ con thành công", "success");
    } catch (err) {
      console.error("Error toggling subtask status:", err);
      showToast("Failed to update subtask status", "error");
    }
  };

  // Handle Reset functionality
  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    setCurrentPage(1); // Reset to the first page
    fetchSubtasks(1, itemsPerPage, "", "all"); // Reload data from API
  };

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      {showTaskDetail && selectedSubtask ? (
        <>
        {console.log("Selected Task ID:", selectedSubtask.taskId)}
        <UserTaskDetail
          taskId={selectedSubtask.taskId}
          onBack={handleBackFromDetail}
        />
      </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              <span className="text-purple-400">NHIỆM VỤ</span> CỦA TÔI
            </h1>
            <div className="text-sm text-gray-400">
              {apiData.totalElements} nhiệm vụ được tìm thấy
            </div>
          </div>

          {/* Action Buttons - Update search to set currentPage to 1 */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors"
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                <span>Làm mới</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhiệm vụ con..."
                  className="pl-10 pr-4 py-2 bg-gray-800 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs - Update to set currentPage to 1 */}
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1);
            }}
          />

          {/* Subtask Cards */}
          <div className="mt-4 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader
                  size={36}
                  className="text-purple-500 animate-spin mb-4"
                />
                <p className="text-gray-400">Đang tải nhiệm vụ con của bạn...</p>
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
                <h3 className="text-lg font-medium mb-2">Không tìm thấy nhiệm vụ</h3>
                <p className="text-gray-400 max-w-md">
                  {search || activeFilter !== "all"
                    ? "Hãy điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"
                    : "Bạn chưa được giao nhiệm vụ con nào vào lúc này"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSubtasks.map((subtask) => (
                  <EnhancedSubtaskCard
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={handleToggleStatus}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {!loading && subtasks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={apiData.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={apiData.totalElements}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}

          {/* Toast Notification */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Subtask;
