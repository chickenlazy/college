import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Loader, Save, X, CheckCircle, XCircle } from "lucide-react";

const UserEdit = ({ user, onBack, isNew = false }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "ROLE_USER",
    status: "ACTIVE",
    department: "",
    address: "",
    position: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isNew && user) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [user, isNew]);

  const fetchUserDetails = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        token = userObj.accessToken;
      }

      const response = await axios.get(
        `http://localhost:8080/api/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove password fields from the form data as they're not returned from API
      const userData = { ...response.data };
      delete userData.password;
      delete userData.confirmPassword;

      setFormData(userData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields
    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";

    // Validate phone format
    if (formData.phoneNumber && !/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number format is invalid";
    }

    // Validate password for new users
    if (isNew) {
      if (!formData.password) errors.password = "Password is required";
      else if (formData.password.length < 6) 
        errors.password = "Password must be at least 6 characters";

      if (!formData.confirmPassword) errors.confirmPassword = "Please confirm password";
      else if (formData.password !== formData.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    } else {
      // For existing users, validate passwords only if they're provided
      if (formData.password && formData.password.length < 6) 
        errors.password = "Password must be at least 6 characters";

      if (formData.password && formData.password !== formData.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please correct the form errors", "error");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        token = userObj.accessToken;
      }

      // Prepare form data - remove confirmPassword
      const submitData = { ...formData };
      delete submitData.confirmPassword;

      // If password is empty for existing user, remove it from the submission
      if (!isNew && !submitData.password) {
        delete submitData.password;
      }

      let response;
      if (isNew) {
        response = await axios.post(
          "http://localhost:8080/api/auth/register",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.put(
          `http://localhost:8080/api/users/${user.id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setSaving(false);
      showToast(
        `User ${isNew ? "created" : "updated"} successfully`,
        "success"
      );
      
      // Wait a moment for the toast to be seen before navigating back
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } catch (err) {
      console.error(`Error ${isNew ? "creating" : "updating"} user:`, err);
      
      // Extract error message from API response if available
      const errorMsg = err.response?.data?.message || 
        `Failed to ${isNew ? "create" : "update"} user. Username or email already exists.`;
      
      setError(errorMsg);
      setSaving(false);
      showToast(errorMsg, "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toast notification component
  const Toast = ({ message, type }) => {
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    const icon = type === "success" ? (
      <CheckCircle size={20} />
    ) : (
      <XCircle size={20} />
    );

    return (
      <div
        className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}
      >
        {icon}
        <span>{message}</span>
        <button
          onClick={() => setToast(null)}
          className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-950 text-white">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => onBack()}
          className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
          disabled={saving}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">
          {isNew ? "Create New User" : "Edit User"}
        </h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={36} className="text-purple-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl">
          {error && (
            <div className="bg-red-900 bg-opacity-20 text-red-500 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2">
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.fullName
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.username
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-gray-800 rounded-md p-2 border border-gray-700"
                  >
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_MANAGER">Manager</option>
                    <option value="ROLE_USER">User</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2">
                Professional Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-800 rounded-md p-2 border border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-800 rounded-md p-2 border border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-800 rounded-md p-2 border border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-gray-800 rounded-md p-2 border border-gray-700"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">InActive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg md:col-span-2">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2">
                {isNew ? "Set Password" : "Change Password (Optional)"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    {isNew ? "Password *" : "New Password"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.password
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    {isNew ? "Confirm Password *" : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword || ""}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => onBack()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-md flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UserEdit;