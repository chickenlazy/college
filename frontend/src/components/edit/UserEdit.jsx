import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ChevronLeft,
  Loader,
  Save,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

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
  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });

  // Thêm hàm hiển thị dialog thành công
  const showSuccessDialog = (message) => {
    setSuccessDialog({
      show: true,
      message: message,
    });
  };

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

    // Kiểm tra unique sau khi người dùng ngừng nhập
    if ((name === "username" || name === "email") && value.trim().length > 0) {
      const timeoutId = setTimeout(async () => {
        const isUnique = await checkUniqueField(name, value);
        if (!isUnique) {
          setValidationErrors((prev) => ({
            ...prev,
            [name]: `This ${name} is already in use`,
          }));
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const validateForm = async () => {
    const errors = {};

    // Validate required fields
    if (!formData.fullName) errors.fullName = "Full name is required";
    else if (formData.fullName.length > 100)
      errors.fullName = "Full name cannot exceed 100 characters";

    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    else if (formData.email.length > 100)
      errors.email = "Email cannot exceed 100 characters";

    if (!formData.username) errors.username = "Username is required";
    else if (formData.username.length < 3)
      errors.username = "Username must be at least 3 characters";
    else if (formData.username.length > 50)
      errors.username = "Username cannot exceed 50 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      errors.username =
        "Username can only contain letters, numbers and underscore";

    // Validate phone format (bắt buộc)
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 10-15 digits";
    }

    // Validate department (bắt buộc)
    if (!formData.department) {
      errors.department = "Department is required";
    } else if (formData.department.length > 100) {
      errors.department = "Department name cannot exceed 100 characters";
    }

    // Validate position (bắt buộc)
    if (!formData.position) {
      errors.position = "Position is required";
    } else if (formData.position.length > 100) {
      errors.position = "Position cannot exceed 100 characters";
    }

    // Validate address (bắt buộc)
    if (!formData.address) {
      errors.address = "Address is required";
    } else if (formData.address.length > 255) {
      errors.address = "Address cannot exceed 255 characters";
    }

    // Validate password for new users
// Phần validate password hiện tại
if (isNew) {
  if (!formData.password) errors.password = "Password is required";
  else if (formData.password.length < 6)
    errors.password = "Password must be at least 6 characters";
  else if (formData.password.length > 50)
    errors.password = "Password cannot exceed 50 characters";
  else {
    // Thêm kiểm tra yêu cầu phức tạp của mật khẩu
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      errors.password = "Password must include uppercase, lowercase, number, and special character";
    }
  }

  if (!formData.confirmPassword)
    errors.confirmPassword = "Please confirm password";
  else if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
} else {
  // For existing users, validate passwords only if they're provided
  if (formData.password) {
    if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    else if (formData.password.length > 50)
      errors.password = "Password cannot exceed 50 characters";
    else {
      // Thêm kiểm tra yêu cầu phức tạp của mật khẩu
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /[0-9]/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.password = "Password must include uppercase, lowercase, number, and special character";
      }
    }

    if (!formData.confirmPassword)
      errors.confirmPassword = "Please confirm new password";
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
  }
}

    // Kiểm tra unique fields
    if (formData.email && !validationErrors.email) {
      const isEmailUnique = await checkUniqueField("email", formData.email);
      if (!isEmailUnique) {
        errors.email = "This email is already in use";
      }
    }

    if (formData.username && !validationErrors.username) {
      const isUsernameUnique = await checkUniqueField(
        "username",
        formData.username
      );
      if (!isUsernameUnique) {
        errors.username = "This username is already in use";
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFormValid = await validateForm();
    if (!isFormValid) {
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
      showSuccessDialog(`User ${isNew ? "created" : "updated"} successfully`);
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } catch (err) {
      console.error(`Error ${isNew ? "creating" : "updating"} user:`, err);

      // Extract error message from API response if available
      const errorMsg =
        err.response?.data?.message ||
        `Failed to ${
          isNew ? "create" : "update"
        } user. Username or email already exists.`;

      setError(errorMsg);
      setSaving(false);
      showToast(errorMsg, "error");
    }
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Thêm hàm kiểm tra unique
  const checkUniqueField = async (field, value) => {
    if (!value) return true;

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        token = userObj.accessToken;
      }

      // Chuẩn bị tham số cho API
      const params = new URLSearchParams();
      params.append("field", field);
      params.append("value", value);

      // Thêm excludeId nếu đang edit user
      if (!isNew && user) {
        params.append("excludeId", user.id);
      }

      // Gọi API kiểm tra unique
      const response = await axios.get(
        `http://localhost:8080/api/users/check-unique?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Phân tích kết quả từ response mới
      return response.data.unique;
    } catch (err) {
      console.error(`Error checking unique ${field}:`, err);
      return true; // Mặc định là unique nếu có lỗi
    }
  };

  // Toast notification component
  const Toast = ({ message, type }) => {
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    const icon =
      type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />;

    return (
      <div
        className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out opacity-0 translate-y-6 animate-toast`}
      >
        {icon}
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-950 text-white">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center text-gray-400 hover:text-white"
          onClick={() => onBack()}
          disabled={saving}
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>

        <h1 className="text-xl font-bold">
          {isNew ? "CREATE NEW USER" : "EDIT USER"}
        </h1>

        <div className="flex space-x-2">
          <button
            type="submit"
            className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center ${
              saving ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={saving}
          >
            <Save size={18} className="mr-2" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
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
                    Full Name *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 100 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    maxLength={100}
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
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.fullName ? formData.fullName.length : 0}/100
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Email *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 100 characters)
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={100}
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
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.email ? formData.email.length : 0}/100
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Username *{" "}
                    <span className="text-xs text-gray-500">
                      (3-50 characters, alphanumeric)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={50}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.username
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.username}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.username ? formData.username.length : 0}/50
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    maxLength={15}
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
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.phoneNumber ? formData.phoneNumber.length : 0}/15
                  </div>
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
                    Department *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 100 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    maxLength={100}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.department
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.department && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.department}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.department ? formData.department.length : 0}/100
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Position *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 100 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleChange}
                    maxLength={100}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.position
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.position && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.position}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.position ? formData.position.length : 0}/100
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Address *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 255 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    maxLength={255}
                    className={`w-full bg-gray-800 rounded-md p-2 border ${
                      validationErrors.address
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.address}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {formData.address ? formData.address.length : 0}/255
                  </div>
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
                    {isNew ? "Password *" : "New Password"}{" "}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    maxLength={50}
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
        </form>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.show}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ show: false, message: "" })}
      />
    </div>
  );
};

export default UserEdit;
