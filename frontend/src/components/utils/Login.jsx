import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess, switchToSignUp }) => {
  // State quản lý thông tin người dùng
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  // Hàm xử lý khi người dùng nhập email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Hàm xử lý khi người dùng nhập mật khẩu
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Kiểm tra các trường nhập liệu
    if (!email || !password) {
      setError("Both email and password are required");
      return;
    }
  
    // Giả sử đây là thao tác đăng nhập (có thể thay thế bằng API thực tế)
    if (email === "user@example.com" && password === "password123") {
      // Thực hiện đăng nhập thành công
      setError("");
      
      // Kiểm tra nếu onLoginSuccess là một hàm thì mới gọi
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
      
      navigate("/dashboard");
    } else {
      // Đăng nhập thất bại
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Log In
          </button>
        </form>

        {/* Sign-up Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <button 
              onClick={switchToSignUp} 
              className="text-blue-500 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;