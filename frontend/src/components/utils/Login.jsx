import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertTriangle, CheckCircle } from "lucide-react";

// Input Component
const LoginInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-gray-400 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={18}
        />
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-3 py-2 bg-gray-700 border ${
          error ? "border-red-500" : "border-gray-600"
        } rounded-md text-white focus:outline-none focus:border-purple-500`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      usernameOrEmail: "",
      password: "",
    };
    let isValid = true;

    // Validate username/email
    if (!formData.usernameOrEmail.trim()) {
      errors.usernameOrEmail = "Tên đăng nhập hoặc email là bắt buộc";
      isValid = false;
    }

    // Validate password
    if (!formData.password.trim()) {
      errors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        }
      );

      // Kiểm tra nếu phản hồi chứa trường success là false
      if (response.data.success === false) {
        setError(
          response.data.message || "Không thể đăng nhập. Vui lòng thử lại."
        );
        return;
      }

      // Store the authentication token and user info
      localStorage.setItem(
        "user",
        JSON.stringify({
          accessToken: response.data.accessToken,
          tokenType: response.data.tokenType,
          id: response.data.id,
          role: response.data.role,
          fullName: response.data.fullName,
          phoneNumber: response.data.phoneNumber,
          username: response.data.username,
          email: response.data.email,
          createdDate: response.data.createdDate,
          lastModifiedDate: response.data.lastModifiedDate,
        })
      );

      setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");

      // Call the onLoginSuccess callback to handle successful login
      setTimeout(() => {
        onLoginSuccess(response.data);
      }, 1000);
    } catch (err) {
      // Xử lý lỗi từ backend
      if (err.response?.status === 401) {
        setError(
          err.response.data.message ||
            "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl font-bold text-white">
            Đăng nhập vào tài khoản của bạn
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Nếu bạn chưa có tài khoản, vui lòng liên hệ quản trị viên.
          </p>
          {/* Thêm link quên mật khẩu */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          {error && (
            <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md flex items-center space-x-2">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-500 p-3 rounded-md flex items-center space-x-2">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <LoginInput
              label="Tên đăng nhập hoặc Email"
              name="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập hoặc email của bạn"
              error={formErrors.usernameOrEmail}
              icon={Mail}
            />

            <LoginInput
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu của bạn"
              error={formErrors.password}
              icon={Lock}
            />

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
