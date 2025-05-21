import React, { useState, useEffect } from "react";
import UserProjectDetail from "../detail/UserProjectDetail";
import axios from "axios";
import {
  Search,
  Loader,
  X,
  RotateCcw,
  FolderKanban,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Eye,
  XCircle,
  RefreshCw,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

// Format date to show in card
const formatDate = (dateString) => {
  if (!dateString) return "Chưa thiết lập";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Status Badge Component
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
      icon = <RefreshCw size={14} />;
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
      icon = <Pause size={14} />;
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
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out animate-toast`}
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
    { id: "NOT_STARTED", label: "Chưa bắt đầu" },
    { id: "IN_PROGRESS", label: "Đang tiến hành" },
    { id: "COMPLETED", label: "hoàn thành" },
    { id: "ON_HOLD", label: "Tạm dừng" },
    { id: "OVER_DUE", label: "Quá hạn" },
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

// Progress Bar Component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full flex items-center gap-2">
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${progress > 0 ? "bg-purple-500" : "bg-gray-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-sm whitespace-nowrap">{progress}%</span>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, onViewDetails }) => {
  // Check if due date is passed
  const isDueDatePassed = () => {
    if (!project.dueDate) return false;
    return new Date(project.dueDate) < new Date() && project.status !== "COMPLETED";
  };

  return (
    <div 
      className={`${project.status === "OVER_DUE" || isDueDatePassed() ? 'border-red-500 border-2' : 'border border-gray-700'} 
      bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Card Header with Status */}
      <div 
        className={`p-4 ${
          project.status === "COMPLETED" 
            ? 'bg-green-900/30' 
            : project.status === "OVER_DUE" || isDueDatePassed() 
              ? 'bg-red-900/30' 
              : project.status === "IN_PROGRESS" 
                ? 'bg-blue-900/30'
                : project.status === "ON_HOLD"
                  ? 'bg-yellow-900/30'
                  : 'bg-purple-900/30'
        }`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-white max-w-[70%] truncate">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Card Body - Main Information */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Description */}
          {project.description && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Mô tả</p>
              <p className="text-sm text-gray-300 line-clamp-2">{project.description}</p>
            </div>
          )}
          
          {/* Manager Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple-900/20 text-purple-400 rounded-full mr-3">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-medium">Quản lý</p>
              <p className="text-sm font-medium truncate">{project.managerName || "Chưa phân công"}</p>
            </div>
          </div>
          
          {/* Dates Row - Combined Start & Due Date */}
          <div className="flex">
            {/* Start Date */}
            <div className="flex items-center flex-1 mr-3">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-900/20 text-blue-400 rounded-full mr-3">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">Ngày bắt đầu</p>
                <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
              </div>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-900/20 text-red-400 rounded-full mr-3">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium">Ngày đến hạn</p>
                <p className={`text-sm font-medium ${isDueDatePassed() ? 'text-red-500 font-bold' : ''}`}>
                  {formatDate(project.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Progress & Tasks */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">Tiến độ</p>
              <p className="text-xs text-gray-400">
                {project.totalCompletedTasks}/{project.totalTasks} nhiệm vụ đã hoàn thành
              </p>
            </div>
            <ProgressBar progress={project.progress?.toFixed(1) || 0} />
          </div>
        </div>
      </div>

      {/* Card Footer with Action Button */}
      <div className="p-3 bg-gray-900 flex justify-center">
        <button
          onClick={() => onViewDetails(project)}
          className="w-full py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <Eye size={16} />
          <span>Xem chi tiết</span>
        </button>
      </div>
      
      {/* Subtle ID indicator at bottom */}
      <div className="px-3 py-1 bg-gray-900 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">ID: {project.id}</p>
      </div>
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
        Đang hiển thị {currentPage} trên tổng số {totalPages} ({totalItems} mục)
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

const UserProject = () => {
  const [selectedProject, setSelectedProject] = useState(null);
const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
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

  // Debounce search input
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

  // Load data from API
  const fetchProjects = async (
    page = currentPage,
    size = itemsPerPage,
    searchTerm = debouncedSearch,
    filterStatus = activeFilter
  ) => {
    if (!user || !user.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        pageNo: page,
        pageSize: size,
      };

      // Add search parameter if exists
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add status filter if not 'all'
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const token = user.accessToken;
      
      const response = await axios.get(
        `http://localhost:8080/api/projects/user/${user.id}`,
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
        setProjects(response.data.content);
      } else {
        setProjects([]);
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
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch projects when page, size, search or filter changes
  useEffect(() => {
    fetchProjects(currentPage, itemsPerPage, debouncedSearch, activeFilter);
  }, [currentPage, itemsPerPage, debouncedSearch, activeFilter]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle view project details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowProjectDetail(false);
    setSelectedProject(null);
  };

  // Handle Reset functionality
  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    setCurrentPage(1); // Reset to the first page
    fetchProjects(1, itemsPerPage, "", "all"); // Reload data from API
  };

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      {showProjectDetail && selectedProject ? (
        <UserProjectDetail 
          projectId={selectedProject.id} 
          onBack={handleBackFromDetail} 
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              <span className="text-purple-400">DỰ ÁN</span> CỦA TÔI
            </h1>
            <div className="text-sm text-gray-400">
              {apiData.totalElements} dự án được tìm thấy
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
                <span>Làm mới</span>
              </button>
            </div>
  
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm dự án..."
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
  
          {/* Filter Tabs */}
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1);
            }}
          />
  
          {/* Project Cards */}
          <div className="mt-4 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader
                  size={36}
                  className="text-purple-500 animate-spin mb-4"
                />
                <p className="text-gray-400">Đang tải dự án của bạn...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-64 text-center p-4">
                <XCircle size={36} className="text-red-500 mb-4" />
                <p className="text-red-400 font-medium text-lg mb-2">Error</p>
                <p className="text-gray-400">{error}</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center">
                <FolderKanban size={48} className="text-gray-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">Không tìm thấy dự án nào</h3>
                <p className="text-gray-400 max-w-md">
                  {search || activeFilter !== "all" 
                    ? "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn" 
                    : "Hiện tại bạn chưa được giao bất kỳ dự án nào"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
  
          {/* Pagination */}
          {!loading && projects.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={apiData.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={apiData.totalElements}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
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
    </div>
  );
};

export default UserProject;