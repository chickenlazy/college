import React, { createContext, useState, useContext, useEffect } from "react";

// Tạo context
const AuthContext = createContext(null);

// Custom hook để sử dụng authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // State quản lý thông tin người dùng và trạng thái đăng nhập
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kiểm tra authentication từ localStorage khi component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = (userData) => {
    // Lưu thông tin người dùng vào localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  // Signup function
  const signup = (userData) => {
    // Ở đây bạn có thể thực hiện logic đăng ký
    // Sau khi đăng ký thành công, bạn có thể tự động đăng nhập người dùng
    login(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Value object cung cấp cho context
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;