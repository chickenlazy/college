import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader,
  XCircle,
  Check,
  User,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlignLeft,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Clock
} from "lucide-react";

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",
    status: "Active",
    lastLogin: "2025-03-20T14:30:00",
    createdAt: "2024-11-15T09:30:00",
  },
  {
    id: 2,
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    phone: "+1 (555) 234-5678",
    role: "Manager",
    status: "Active",
    lastLogin: "2025-03-22T10:45:00",
    createdAt: "2024-12-05T11:20:00",
  },
  {
    id: 3,
    name: "Michael Davis",
    email: "michael.davis@example.com",
    phone: "+1 (555) 345-6789",
    role: "Editor",
    status: "Inactive",
    lastLogin: "2025-03-10T09:15:00",
    createdAt: "2025-01-18T13:40:00",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+1 (555) 456-7890",
    role: "Viewer",
    status: "Active",
    lastLogin: "2025-03-23T16:20:00",
    createdAt: "2025-01-25T10:10:00",
  },
  {
    id: 5,
    name: "David Martinez",
    email: "david.martinez@example.com",
    phone: "+1 (555) 567-8901",
    role: "Editor",
    status: "Active",
    lastLogin: "2025-03-21T11:30:00",
    createdAt: "2025-02-03T14:15:00",
  },
  {
    id: 6,
    name: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    phone: "+1 (555) 678-9012",
    role: "Manager",
    status: "Pending",
    lastLogin: null,
    createdAt: "2025-02-15T09:50:00",
  },
  {
    id: 7,
    name: "Robert Anderson",
    email: "robert.anderson@example.com",
    phone: "+1 (555) 789-0123",
    role: "Viewer",
    status: "Active",
    lastLogin: "2025-03-19T15:40:00",
    createdAt: "2025-02-20T16:30:00",
  },
  {
    id: 8,
    name: "Lisa Thomas",
    email: "lisa.thomas@example.com",
    phone: "+1 (555) 890-1234",
    role: "Editor",
    status: "Inactive",
    lastLogin: "2025-03-01T10:25:00",
    createdAt: "2025-03-01T13:20:00",
  },
  {
    id: 9,
    name: "Daniel White",
    email: "daniel.white@example.com",
    phone: "+1 (555) 901-2345",
    role: "Administrator",
    status: "Active",
    lastLogin: "2025-03-22T09:10:00",
    createdAt: "2025-03-05T11:45:00",
  },
  {
    id: 10,
    name: "Michelle Clark",
    email: "michelle.clark@example.com",
    phone: "+1 (555) 012-3456",
    role: "Manager",
    status: "Active",
    lastLogin: "2025-03-23T14:05:00",
    createdAt: "2025-03-10T10:30:00",
  },
];

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Never";
  
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const icon = type === 'success' ? <Check size={20} /> : type === 'error' ? <XCircle size={20} /> : <RefreshCw size={20} />;
  
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}>
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

// User Form Modal
const UserFormModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Viewer",
    status: "Active",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "Viewer",
        status: user.status || "Active",
        password: "",
      });
      setPasswordRequired(false);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Viewer",
        status: "Active",
        password: "",
      });
      setPasswordRequired(true);
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (passwordRequired && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        id: user ? user.id : Date.now(),
        createdAt: user ? user.createdAt : new Date().toISOString(),
        lastLogin: user ? user.lastLogin : null,
      });
      
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg shadow-xl animate-scale-in max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold">{user ? "Edit User" : "Add New User"}</h2>
          <button 
            className="p-1 hover:bg-gray-700 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Name
              </label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 rounded-md text-white border ${errors.name ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Email
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 rounded-md text-white border ${errors.email ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Phone Number
              </label>
              <input 
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">
                Password {!passwordRequired && "(Leave empty to keep unchanged)"}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 rounded-md text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500 pr-10`}
                  placeholder={passwordRequired ? "Enter password" : "Enter new password (optional)"}
                />
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md flex items-center gap-2"
            >
              <Check size={18} />
              {user ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, active, onClick, icon }) => (
  <button
    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
      active
        ? "bg-blue-700 text-white shadow-md shadow-blue-900/50"
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
    <h3 className="text-xl font-medium text-gray-300 mb-2">
      No users found
    </h3>
    <p className="text-gray-400">
      {message}
    </p>
  </div>
);

// Main UserManagement Component
const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null });
  
  // Load data initially
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800);
  }, []);
  
  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="text-blue-500" />
      : <ChevronDown size={16} className="text-blue-500" />;
  };
  
  // Filter users based on active filter and search
  const filteredUsers = sortedUsers.filter((user) => {
    // Apply status filter
    if (activeFilter === "active") {
      if (user.status !== "Active") return false;
    } else if (activeFilter === "inactive") {
      if (user.status !== "Inactive") return false;
    } else if (activeFilter === "pending") {
      if (user.status !== "Pending") return false;
    } else if (activeFilter === "administrators") {
      if (user.role !== "Administrator") return false;
    } else if (activeFilter === "managers") {
      if (user.role !== "Manager") return false;
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
  
  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Handle user actions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormOpen(true);
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormOpen(true);
  };
  
  const handleDeleteUser = (userId) => {
    setDeleteConfirm({ show: true, userId });
  };
  
  const confirmDeleteUser = () => {
    const updatedUsers = users.filter(user => user.id !== deleteConfirm.userId);
    setUsers(updatedUsers);
    showToast('User deleted successfully', 'success');
  };
  
  const handleSaveUser = (userData) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === userData.id ? userData : user
      ));
      showToast('User updated successfully', 'success');
    } else {
      // Add new user
      setUsers([...users, userData]);
      showToast('New user added successfully', 'success');
    }
  };
  
  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">USER MANAGEMENT</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and control user accounts and permissions</p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md flex items-center gap-2 shadow-md shadow-blue-900/30"
          onClick={handleAddUser}
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 bg-gray-800 rounded-md w-full text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
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
              label="All Users"
              icon={<Users size={14} />}
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            <FilterChip
              label="Active"
              icon={<CheckCircle size={14} className="text-green-500" />}
              active={activeFilter === "active"}
              onClick={() => setActiveFilter("active")}
            />
            <FilterChip
              label="Inactive"
              icon={<XCircle size={14} className="text-red-500" />}
              active={activeFilter === "inactive"}
              onClick={() => setActiveFilter("inactive")}
            />
            <FilterChip
              label="Pending"
              icon={<Clock size={14} className="text-yellow-500" />}
              active={activeFilter === "pending"}
              onClick={() => setActiveFilter("pending")}
            />
            <FilterChip
              label="Administrators"
              icon={<Shield size={14} className="text-purple-500" />}
              active={activeFilter === "administrators"}
              onClick={() => setActiveFilter("administrators")}
            />
            <FilterChip
              label="Managers"
              icon={<User size={14} className="text-blue-500" />}
              active={activeFilter === "managers"}
              onClick={() => setActiveFilter("managers")}
            />
          </div>
        )}
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader size={36} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading user data...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState 
          message="Try adjusting your search or filter to find what you're looking for."
          icon={<Search size={32} className="text-gray-500" />}
        />
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-left text-sm uppercase">
                  <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => requestSort('email')}>
                    <div className="flex items-center gap-2">
                      <span>Email</span>
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => requestSort('role')}>
                    <div className="flex items-center gap-2">
                      <span>Role</span>
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => requestSort('lastLogin')}>
                    <div className="flex items-center gap-2">
                      <span>Last Login</span>
                      {getSortIcon('lastLogin')}
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="font-bold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === "Administrator" ? (
                          <Shield size={16} className="text-purple-500" />
                        ) : user.role === "Manager" ? (
                          <User size={16} className="text-blue-500" />
                        ) : user.role === "Editor" ? (
                          <Edit size={16} className="text-yellow-500" />
                        ) : (
                          <Eye size={16} className="text-green-500" />
                        )}
                        <span>{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-900 text-green-300"
                          : user.status === "Inactive"
                          ? "bg-red-900 text-red-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`} />
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          user.status === "Active"
                            ? "bg-green-400"
                            : user.status === "Inactive"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}></span>
                        {user.status}                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(user.lastLogin)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting User */}
      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, userId: null })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
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
