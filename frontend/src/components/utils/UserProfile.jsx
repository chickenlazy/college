import React, { useState, useEffect } from "react";
import {
  Lock,
  UserCircle,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  CheckCircle,
  IdCard,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// Toast Component từ ProjectEdit
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

// Reusable Input Component
const ProfileInput = ({ label, icon: Icon, value, type = "text" }) => (
  <div className="relative">
    <label className="absolute -top-2 left-3 bg-gray-900 px-1 text-xs text-gray-400">
      {label}
    </label>
    {Icon && (
      <Icon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        size={18}
      />
    )}
    <input
      type={type}
      value={value}
      readOnly
      className="w-full pl-10 pr-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all"
    />
  </div>
);

// Password Input Component
const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
}) => (
  <div className="space-y-1">
    <label className="block text-sm text-gray-400">
      {label}
    </label>
    <input
      type="password"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 bg-gray-800 rounded-md border ${
        error ? "border-red-500" : "border-gray-700"
      } focus:ring-2 focus:ring-purple-500 transition-all`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  // Thêm state cho toast
  const [toast, setToast] = useState(null);

  const [formErrors, setFormErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Hàm hiển thị toast message
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Validate current password
    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
      isValid = false;
    }

    // Validate new password
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = "Mật khẩu mới là bắt buộc";
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    } else if (passwordData.newPassword.length > 50) {
      errors.newPassword = "Mật khẩu không được vượt quá 50 ký tự";
      isValid = false;
    } else {
      // Kiểm tra các yêu cầu phức tạp của mật khẩu
      const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
      const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
      const hasNumbers = /[0-9]/.test(passwordData.newPassword);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        passwordData.newPassword
      );

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.newPassword =
          "Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
        isValid = false;
      }
    }

    // Validate confirm password
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới của bạn";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = storedUser ? JSON.parse(storedUser).accessToken : null;
        const userId = storedUser ? JSON.parse(storedUser).id : null;

        const response = await fetch(
          `http://localhost:8080/api/users/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user profile");

        const data = await response.json();
        setUser(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validate form inputs
    if (!validatePasswordForm()) {
      // Hiển thị toast khi form không hợp lệ
      showToast("Vui lòng sửa các lỗi trong biểu mẫu", "error");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).accessToken : null;

      const response = await fetch(
        "http://localhost:8080/api/users/update-password",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to Cập nhật mật khẩu");
      }

      // Hiển thị toast khi cập nhật mật khẩu thành công
      showToast("Cập nhật mật khẩu thành công", "success");
      setPasswordSuccess("Cập nhật mật khẩu thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFormErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      // Hiển thị toast khi có lỗi
      showToast(err.message || "Failed to Cập nhật mật khẩu", "error");
      setPasswordError(err.message || "Failed to Cập nhật mật khẩu");
    }
  };

  // Handle password input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-red-500">
        {error}
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-xl p-6 flex items-center space-x-6 shadow-lg">
          <div className="bg-purple-600 rounded-full p-3">
            <UserCircle size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-300">
              {user.fullName}
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 border-b border-gray-800 pb-3">
            Thông tin cá nhân
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileInput
              label="Họ và tên"
              icon={UserCircle}
              value={user.fullName}
            />
            <ProfileInput label="Email" icon={Mail} value={user.email} />
            <ProfileInput
              label="Tên đăng nhập"
              icon={IdCard}
              value={user.username}
            />
            <ProfileInput
              label="Số điện thoại"
              icon={Phone}
              value={user.phoneNumber}
            />
            <ProfileInput
              label="Phòng ban"
              icon={Building}
              value={user.department}
            />
            <ProfileInput
              label="Chức vụ"
              icon={Briefcase}
              value={user.position}
            />
            <ProfileInput label="Địa chỉ" icon={MapPin} value={user.address} />
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 border-b border-gray-800 pb-3 flex items-center">
            <Lock className="mr-3" size={20} /> Đổi mật khẩu
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <PasswordInput
                label="Mật khẩu hiện tại"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                error={formErrors.currentPassword}
              />
              <PasswordInput
                label="Mật khẩu mới"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                error={formErrors.newPassword}
              />
              <div className="md:col-span-2">
                <PasswordInput
                  label="CXác nhận mật khẩu mới"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  error={formErrors.confirmPassword}
                />
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-900/50 text-red-400 p-3 rounded-md flex items-center space-x-3">
                <AlertTriangle size={20} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-900/50 text-green-400 p-3 rounded-md flex items-center space-x-3">
                <CheckCircle size={20} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md transition-colors 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                           flex items-center space-x-2"
              >
                <Lock size={18} />
                <span>Cập nhật mật khẩu</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hiển thị Toast nếu có */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UserProfile;
