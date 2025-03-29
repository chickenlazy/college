import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Dùng để điều hướng trang sau khi đăng nhập thành công

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra nếu email và password không trống
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Kiểm tra thông tin đăng nhập (đơn giản, giả sử tài khoản admin)
    if (email === "admin@example.com" && password === "admin123") {
      setError(""); // Xóa lỗi nếu đăng nhập thành công
      localStorage.setItem('isAuthenticated', 'true');
      navigate("/dashboard"); // Chuyển hướng đến trang Dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Login</h2>

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;