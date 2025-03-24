import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const SignUp = ({ onSignUpSuccess, switchToLogin }) => {
  // State quản lý thông tin người dùng
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Hàm xử lý khi người dùng nhập họ tên
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Hàm xử lý khi người dùng nhập email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Hàm xử lý khi người dùng nhập mật khẩu
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Hàm xử lý khi người dùng nhập xác nhận mật khẩu
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra các trường nhập liệu
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Kiểm tra mật khẩu trùng khớp
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Giả sử đây là thao tác đăng ký (có thể thay thế bằng API thực tế)
    try {
      // Xử lý logic đăng ký tại đây
      console.log("Signing up with:", { name, email, password });
      
      // Đăng ký thành công
      setError("");
      onSignUpSuccess();
    } catch (error) {
      setError("Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Sign Up
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4 relative">
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Confirm your password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <button 
              onClick={switchToLogin} 
              className="text-blue-500 hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;