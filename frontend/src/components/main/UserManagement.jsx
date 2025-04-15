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
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Power,
} from "lucide-react";
import UserDetail from "../detail/UserDetail";
import UserEdit from "../edit/UserEdit";
// Component hiển thị thông báo thành công ở giữa màn hình và tự động đóng
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

// Format name with tooltip for long names
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

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let icon;
  let displayText = status;

  switch (status) {
    case "ACTIVE":
      color = "bg-green-200 text-green-800";
      icon = <CheckCircle size={14} />;
      break;
    case "INACTIVE":
      color = "bg-red-200 text-red-800";
      icon = <X size={14} />;
      break;
    default:
      color = "bg-gray-200 text-gray-800";
      icon = <AlertTriangle size={14} />;
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

// Role Badge Component
const RoleBadge = ({ role }) => {
  let color;
  let displayText = role.replace("ROLE_", "");

  switch (role) {
    case "ROLE_ADMIN":
      color = "bg-purple-200 text-purple-800";
      break;
    case "ROLE_MANAGER":
      color = "bg-blue-200 text-blue-800";
      break;
    case "ROLE_USER":
      color = "bg-yellow-200 text-yellow-800";
      break;
    default:
      color = "bg-gray-200 text-gray-800";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
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
            <Check size={16} />
            Confirm
          </button>
        </div>
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
// Action Buttons Component
const ActionButtons = ({
  user,
  openUserDetail,
  openUserEdit,
  onToggleStatus,
}) => {
  // Kiểm tra xem user có phải là admin không
  const isAdmin = user.role === "ROLE_ADMIN";

  return (
    <div className="flex gap-2">
      <button
        className="p-2 rounded-full bg-green-600 text-white"
        onClick={() => openUserDetail(user)}
        title="View Details"
      >
        <Eye size={16} />
      </button>
      <button
        className={`p-2 rounded-full ${
          isAdmin ? "bg-gray-500 cursor-not-allowed" : "bg-yellow-600"
        } text-white`}
        onClick={() => !isAdmin && openUserEdit(user)}
        disabled={isAdmin}
        title={isAdmin ? "Cannot edit Admin users" : "Edit User"}
      >
        <Edit size={16} />
      </button>
      <button
        className={`p-2 rounded-full ${
          isAdmin
            ? "bg-gray-500 cursor-not-allowed"
            : user.status === "ACTIVE"
            ? "bg-red-600"
            : "bg-green-600"
        } text-white`}
        onClick={() => !isAdmin && onToggleStatus(user.id, user.status)}
        disabled={isAdmin}
        title={
          isAdmin
            ? "Cannot change Admin status"
            : user.status === "ACTIVE"
            ? "Deactivate User"
            : "Activate User"
        }
      >
        <Power size={16} />
      </button>
    </div>
  );
};

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "ROLE_ADMIN", label: "Admin" },
    { id: "ROLE_MANAGER", label: "Manager" },
    { id: "ROLE_USER", label: "User" },
    { id: "ACTIVE", label: "Active" },
    { id: "INACTIVE", label: "Inactive" },
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    userId: null,
    currentStatus: null,
    action: "",
  });
  const [apiData, setApiData] = useState({
    content: [],
    pageNo: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  // State for managing detail and edit views
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load data from API
  const fetchUsers = async (
    page = currentPage,
    size = itemsPerPage,
    searchTerm = search,
    filterValue = activeFilter
  ) => {
    setLoading(true);
    try {
      const params = {
        pageNo: page,
        pageSize: size,
      };

      // Add search parameter if provided
      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterValue !== "all") {
        // Luôn sử dụng tham số filterValue cho cả role và status
        params.filterValue = filterValue;
      }

      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get(`http://localhost:8080/api/users`, {
        params: params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApiData(response.data);
      setUsers(response.data.content);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
      setLoading(false);
    }
  };

  // Search debounce effect
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

  // Fetch data when dependencies change
  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage, debouncedSearch, activeFilter);
  }, [currentPage, itemsPerPage, debouncedSearch, activeFilter]);

  // Refresh data
  const refreshData = () => {
    fetchUsers(currentPage, itemsPerPage, search, activeFilter);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Open user detail view
  const openUserDetail = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  // Open user edit view
  const openUserEdit = (user) => {
    setSelectedUser(user);
    setShowUserEdit(true);
  };

  // Handle back from detail view
  const handleBackFromDetail = (needRefresh = false) => {
    setShowUserDetail(false);
    setSelectedUser(null);

    if (needRefresh) {
      refreshData();
    }
  };

  // Handle back from edit view
  const handleBackFromEdit = (needRefresh = false) => {
    setShowUserEdit(false);
    setSelectedUser(null);

    if (needRefresh) {
      refreshData();
    }
  };

  // Handle reset functionality
  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    setCurrentPage(1); // Reset to the first page
    fetchUsers(1, itemsPerPage); // Reload data from API
  };

  // Handle toggle user status
  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = currentStatus === "ACTIVE" ? "deactivate" : "activate";

    setConfirmDialog({
      show: true,
      userId,
      currentStatus,
      action,
    });
  };

  // Confirm toggle status
  const confirmToggleStatus = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.put(
        `http://localhost:8080/api/users/${confirmDialog.userId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const action =
        confirmDialog.action === "deactivate" ? "deactivated" : "activated";
      showSuccessDialog(`User ${action} successfully`);
      refreshData();
    } catch (err) {
      console.error("Error toggling user status:", err);
      showToast("Failed to update user status", "error");
    }
  };

  const showSuccessDialog = (message) => {
    setSuccessDialog({
      show: true,
      message: message,
    });
  };

  // Cập nhật hàm showToast để chỉ dùng cho thông báo lỗi
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      {showUserDetail ? (
        <UserDetail user={selectedUser} onBack={handleBackFromDetail} />
      ) : showUserEdit ? (
        <UserEdit
          user={selectedUser}
          onBack={handleBackFromEdit}
          isNew={selectedUser === null}
        />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">USER MANAGEMENT</h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-md"
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserEdit(true);
                }}
              >
                <Plus size={18} />
                <span>New User</span>
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
                  placeholder="Search by Name or Email"
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

          {/* User Table */}
          <div className="mt-4 overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader
                  size={36}
                  className="text-purple-500 animate-spin mb-4"
                />
                <p className="text-gray-400">Loading user data...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">{error}</div>
            ) : users.length === 0 ? (
              <div className="text-center p-4">No users found</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-left">
                    <th className="p-4 border-b border-gray-800">Name</th>
                    <th className="p-4 border-b border-gray-800">Department</th>
                    <th className="p-4 border-b border-gray-800">Position</th>
                    <th className="p-4 border-b border-gray-800">Role</th>
                    <th className="p-4 border-b border-gray-800">Status</th>
                    <th className="p-4 border-b border-gray-800">
                      Created Date
                    </th>
                    <th className="p-4 border-b border-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-900">
                      <td className="p-4 border-b border-gray-800">
                        {formatName(user.fullName)}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {user.department}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {user.position}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {formatDate(user.createdDate)}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <ActionButtons
                          user={user}
                          openUserDetail={openUserDetail}
                          openUserEdit={openUserEdit}
                          onToggleStatus={handleToggleStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={apiData.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={apiData.totalElements}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      {/* Confirmation Dialog for Status Toggle */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        onClose={() => setConfirmDialog({ ...confirmDialog, show: false })}
        onConfirm={confirmToggleStatus}
        title={`${
          confirmDialog.action === "deactivate" ? "Deactivate" : "Activate"
        } User`}
        message={`Are you sure you want to ${confirmDialog.action} this user? ${
          confirmDialog.action === "deactivate"
            ? "This will prevent them from logging in."
            : "This will allow them to log in again."
        }`}
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
    </div>
  );
};

export default UserManagement;
