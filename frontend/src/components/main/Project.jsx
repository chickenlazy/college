import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Loader,
  Check,
  XCircle,
  X,
  Plus,
  Edit,
  RotateCcw,
  Upload,
  CheckCircle,
  AlertTriangle,
  Pause,
  Clock,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  FileDown,
  Table,
} from "lucide-react";
import ProjectDetail from "../detail/ProjectDetail";
import ProjectEdit from "../edit/ProjectEdit";

// Error Details Dialog Component
const ErrorDetailsDialog = ({ isOpen, onClose, title, errors }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="max-h-80 overflow-y-auto">
          <ul className="list-disc pl-5 space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="text-red-400">
                {error}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDescription = (description) => {
  if (!description) return null;

  if (description.length > 50) {
    return (
      <div className="text-sm text-gray-400 group relative cursor-pointer">
        <span>{description.substring(0, 50)}...</span>
        <div className="absolute top-full left-0 mt-1 bg-gray-800 text-white p-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-64 text-sm">
          {description}
        </div>
      </div>
    );
  }

  return <div className="text-sm text-gray-400">{description}</div>;
};

// Format date to show in the table
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

// Component hiển thị thông báo thành công ở giữa màn hình và tự động đóng
const SuccessDialog = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Tự động đóng dialog sau 2 giây
      const timer = setTimeout(() => {
        onClose();
      }, 1000);

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

const formatName = (name, description) => {
  if (!name) return "";

  return (
    <div>
      <div className="font-medium">
        {name.length > 25 ? (
          <div className="group relative cursor-pointer">
            <span>{name.substring(0, 25)}...</span>
            <div className="absolute top-full left-0 mt-1 bg-gray-800 text-white p-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-64 text-sm">
              {name}
            </div>
          </div>
        ) : (
          name
        )}
      </div>
      {formatDescription(description)}
    </div>
  );
};

// Get assigned users as a comma-separated string
const getAssignedUsers = (users) => {
  if (!users || users.length === 0) {
    return (
      <span className="italic text-gray-400 flex items-center">
        <X size={14} className="text-red-400 mr-1" />
        No body assigned
      </span>
    );
  }

  const fullNames = users.map((user) => user.fullName).join(", ");

  if (fullNames.length > 20) {
    return (
      <div className="group relative cursor-pointer">
        <span>{fullNames.substring(0, 20)}...</span>
        <div className="absolute top-full left-0 mt-1 bg-gray-800 text-white p-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-48 text-sm">
          {fullNames}
        </div>
      </div>
    );
  }

  return fullNames;
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
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out opacity-0 translate-y-6 animate-toast`}
    >
      {icon}
      <span>{message}</span>
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

// Progress Bar Component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full flex items-center gap-2">
      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${progress > 0 ? "bg-purple-500" : "bg-gray-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-sm">{progress}%</span>
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
const ActionButtons = ({
  project,
  openProjectDetail,
  openProjectEdit,
  onDelete,
  onExport,
}) => {
  return (
    <div className="flex gap-2">
      <div className="relative group">
        <button
          className="p-2 rounded-full bg-blue-600 text-white"
          onClick={() => openProjectDetail(project)}
        >
          <Eye size={16} />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          View details
        </div>
      </div>

      <div className="relative group">
        <button
          className="p-2 rounded-full bg-yellow-600 text-white"
          onClick={() => openProjectEdit(project)}
        >
          <Edit size={16} />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Edit project
        </div>
      </div>

      <div className="relative group">
        <button
          className="p-2 rounded-full bg-green-700 text-white"
          onClick={() => onExport(project.id)}
        >
          <FileSpreadsheet size={16} />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Export to Excel
        </div>
      </div>

      <div className="relative group">
        <button
          className="p-2 rounded-full bg-red-600 text-white"
          onClick={() => onDelete(project.id)}
        >
          <Trash2 size={16} />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Delete project
        </div>
      </div>
    </div>
  );
};

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All" },
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
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [errorDetails, setErrorDetails] = useState({
    show: false,
    title: "",
    errors: [],
  });
  const [importLoading, setImportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    projectId: null,
  });
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

  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });

  // Load data from API
  // 1. Cập nhật hàm fetchProjects để gửi các tham số tìm kiếm và lọc
  const fetchProjects = async (
    page = currentPage,
    size = itemsPerPage,
    searchTerm = search,
    filterStatus = activeFilter
  ) => {
    setLoading(true);
    try {
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

      let apiUrl = "http://localhost:8080/api/projects";
      if (userRole === "ROLE_MANAGER") {
        apiUrl = `http://localhost:8080/api/projects/manager/${userId}`;
      }

      const response = await axios.get(apiUrl, {
        params: params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApiData(response.data);
      setProjects(response.data.content);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
      setLoading(false);
    }
  };

  // 2. Cập nhật useEffect để phản ứng với sự thay đổi của search và activeFilter
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
    fetchProjects(currentPage, itemsPerPage, debouncedSearch, activeFilter);
  }, [currentPage, itemsPerPage, debouncedSearch, activeFilter]);

  const refreshData = () => {
    fetchProjects(currentPage, itemsPerPage, search, activeFilter);
  };

  // Filter projects based on active filter and search
  const filteredProjects = projects;

  const currentProjects = filteredProjects;

  const totalPages = apiData.totalPages;

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDownloadTemplate = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get(
        "http://localhost:8080/api/excel/template/project",
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "project_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("Template downloaded successfully", "success");
    } catch (err) {
      console.error("Error downloading template:", err);
      showToast("Failed to download template", "error");
    }
  };

  // Thêm hàm xử lý import Excel
  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input để có thể chọn lại cùng một file
    event.target.value = null;

    // Kiểm tra định dạng file
    const fileExt = file.name.split(".").pop().toLowerCase();
    if (fileExt !== "xlsx" && fileExt !== "xls") {
      showToast("Please upload an Excel file (.xlsx or .xls)", "error");
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit", "error");
      return;
    }

    setImportLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.post(
        "http://localhost:8080/api/excel/import/project",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setImportLoading(false);
      setSuccessDialog({
        show: true,
        message: "Project imported successfully!",
      });
      refreshData();
    } catch (err) {
      setImportLoading(false);
      console.error("Error importing project:", err);

      let errorMessage = "Failed to import project";

      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        // Nếu API trả về danh sách lỗi chi tiết
        if (err.response.data.errors && err.response.data.errors.length > 0) {
          setErrorDetails({
            show: true,
            title: "Import Errors",
            errors: err.response.data.errors,
          });
          return;
        }
      }

      showToast(errorMessage, "error");
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleExportProject = async (projectId) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      // Gọi API với responseType là 'blob' để nhận dữ liệu dạng file
      const response = await axios.get(
        `http://localhost:8080/api/projects/${projectId}/export`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Tạo URL object từ blob response
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Tạo link để download
      const link = document.createElement("a");
      link.href = url;

      // Lấy thông tin project từ danh sách hiện tại để có tên
      const project = projects.find((p) => p.id === projectId);
      let projectName = "unknown";

      if (project) {
        // Thay thế các ký tự không hợp lệ cho tên file
        projectName = project.name
          .replace(/[\\/:*?"<>|]/g, "_")
          .substring(0, 30);
      }

      // Tạo tên file chuẩn theo định dạng
      const currentDate = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      const filename = `${projectId}_${projectName}_${currentDate}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Giải phóng URL object
      window.URL.revokeObjectURL(url);

      showToast("Project exported successfully", "success");
    } catch (err) {
      console.error("Error exporting project:", err);
      showToast("Failed to export project", "error");
    }
  };

  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showProjectEdit, setShowProjectEdit] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const openProjectDetail = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  // Cập nhật hàm xử lý khi quay lại
  const handleBackFromDetail = (needRefresh = false) => {
    setShowProjectDetail(false);
    setSelectedProject(null);

    if (needRefresh) {
      refreshData(); // Gọi refreshData để cập nhật dữ liệu
    }
  };

  const openProjectEdit = (project) => {
    setSelectedProject(project);
    setShowProjectEdit(true);
  };

  // Handle Reset functionality
  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    setCurrentPage(1); // Reset to the first page
    setSelectAll(false); // Unselect 'select all' checkbox
    setSelectedProjects([]); // Deselect all projects
    fetchProjects(1, itemsPerPage); // Reload data from API
  };

  const handleDeleteProject = (projectId) => {
    setDeleteConfirm({ show: true, projectId });
  };

  const confirmDeleteProject = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.delete(
        `http://localhost:8080/api/projects/${deleteConfirm.projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessDialog({
        show: true,
        message: "Project deleted successfully!",
      });
      refreshData();
    } catch (err) {
      console.error("Error deleting project:", err);
      showToast("Failed to delete project", "error");
    }
  };

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      {showProjectDetail ? (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackFromDetail}
        />
      ) : showProjectEdit ? (
        <ProjectEdit
          project={selectedProject}
          onBack={() => {
            setShowProjectEdit(false);
            refreshData();
          }}
          isNew={selectedProject === null}
        />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">PROJECT MANAGEMENT</h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-md"
                onClick={() => {
                  setSelectedProject(null);
                  setShowProjectEdit(true);
                }}
              >
                <Plus size={18} />
                <span>New</span>
              </button>
              {/* <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-md"
                onClick={() => document.getElementById("import-excel").click()}
              >
                <FileDown size={18} />
                <span>Import Excel</span>
              </button> */}
              <input
                type="file"
                id="import-excel"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
              />
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-700 rounded-md"
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                <span>Reset</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-md"
                onClick={handleDownloadTemplate}
              >
                <Table size={18} />
                <span>Download Template</span>
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

          {/* Filter Tabs */}
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1);
            }}
          />

          {/* Project Table */}
          <div className="mt-4 overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader
                  size={36}
                  className="text-purple-500 animate-spin mb-4"
                />
                <p className="text-gray-400">Loading project data...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">{error}</div>
            ) : currentProjects.length === 0 ? (
              <div className="text-center p-4">No projects found</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-left">
                    <th className="p-4 border-b border-gray-800">Name</th>
                    <th className="p-4 border-b border-gray-800">Manager</th>
                    <th className="p-4 border-b border-gray-800">Tasks</th>
                    <th className="p-4 border-b border-gray-800">Progress</th>
                    <th className="p-4 border-b border-gray-800">Status</th>
                    <th className="p-4 border-b border-gray-800">Due Date</th>
                    <th className="p-4 border-b border-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-900">
                      <td className="p-4 border-b border-gray-800">
                        {formatName(project.name, project.description)}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {project.managerName || (
                          <span className="italic text-gray-400 flex items-center">
                            <X size={14} className="text-red-400 mr-1" />
                            No manager assigned
                          </span>
                        )}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {project.totalCompletedTasks}/{project.totalTasks}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <ProgressBar progress={project.progress.toFixed(1)} />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {formatDate(project.dueDate)}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <ActionButtons
                          project={project}
                          openProjectDetail={openProjectDetail}
                          openProjectEdit={openProjectEdit}
                          onDelete={handleDeleteProject}
                          onExport={handleExportProject}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Error Details Dialog */}
          <ErrorDetailsDialog
            isOpen={errorDetails.show}
            onClose={() =>
              setErrorDetails({ show: false, title: "", errors: [] })
            }
            title={errorDetails.title}
            errors={errorDetails.errors}
          />

          {/* Pagination */}
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

      {/* Confirmation Dialog for Deleting Project */}
      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, projectId: null })}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />

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

      {/* Overlay hiển thị khi đang import */}
      {importLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md shadow-xl flex flex-col items-center">
            <Loader size={40} className="text-purple-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold">Importing project...</h2>
            <p className="text-gray-400 mt-2">
              Please wait while we process your Excel file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
