import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardUI from "./components/main/Dashboard";
import Login from "./components/utils/Login";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import ForgotPassword from "./components/utils/ForgotPassword";

// Thêm component ErrorDialog vào App.js
const ErrorDialog = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in flex flex-col items-center">
        <AlertTriangle size={50} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center">{message}</h2>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Thêm state cho dialog
  const [errorDialog, setErrorDialog] = useState({
    show: false,
    message: ""
  });
  
  // Cập nhật hàm checkUserStatus để sử dụng dialog thay vì alert
  const checkUserStatus = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const token = userData.accessToken;
        
        // Kiểm tra token có hết hạn hay không (5 ngày)
        const tokenTimestamp = new Date(userData.tokenTimestamp || 0);
        const currentTime = new Date();
        const fiveDays = 5 * 24 * 60 * 60 * 1000; // 5 ngày tính bằng milliseconds
        
        if (currentTime - tokenTimestamp > fiveDays) {
          // Token đã hết hạn sau 5 ngày
          console.log("Token expired after 5 days, logging out");
          handleLogout();
          setErrorDialog({
            show: true,
            message: "Your session has expired. Please log in again."
          });
          return;
        }
        
        // Gọi API để kiểm tra status của user
        const response = await axios.get('http://localhost:8080/api/auth/check-status', {
          headers: {
            'Authorization': `${userData.tokenType} ${token}`
          }
        });
        
        if (response.data.status === 'INACTIVE') {
          // User đã bị vô hiệu hóa
          console.log("User is inactive, logging out");
          handleLogout();
          setErrorDialog({
            show: true,
            message: "Your account has been disabled. Please contact administrator."
          });
        } else {
          // User vẫn active
          setIsAuthenticated(true);
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      if (error.response?.status === 401) {
        handleLogout();
        setErrorDialog({
          show: true,
          message: "Authentication failed. Please log in again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkUserStatus();
    
    // Thêm event listener để kiểm tra status mỗi khi tab được focus lại
    const handleTabFocus = () => {
      checkUserStatus();
    };
    
    window.addEventListener('focus', handleTabFocus);
    
    return () => {
      window.removeEventListener('focus', handleTabFocus);
    };
  }, []);
  
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserRole(userData.role);
    
    // Lưu thông tin người dùng và token vào localStorage cùng với thời gian
    localStorage.setItem('user', JSON.stringify({
      accessToken: userData.accessToken,
      tokenType: userData.tokenType,
      id: userData.id,
      role: userData.role,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      username: userData.username,
      email: userData.email,
      createdDate: userData.createdDate,
      lastModifiedDate: userData.lastModifiedDate,
      tokenTimestamp: new Date().getTime() // Thêm thời gian tạo token
    }));
  };
  
  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage khi logout
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };
  
  // Các hàm getDefaultRoute và getDefaultComponent giữ nguyên
  const getDefaultRoute = () => {
    switch(userRole) {
      case "ROLE_ADMIN":
        return "/admin";
      case "ROLE_MANAGER":
        return "/manager";
      case "ROLE_USER":
        return "/user";
      default:
        return "/login";
    }
  };

  const getDefaultComponent = () => {
    switch(userRole) {
      case "ROLE_ADMIN":
        return "dashboard";
      case "ROLE_MANAGER":
        return "project";
      case "ROLE_USER":
        return "userProject";
      default:
        return "";
    }
  };

  if (isLoading) {
    // Hiển thị loading khi đang kiểm tra status
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin h-8 w-8 border-4 border-t-purple-500 border-purple-500/30 rounded-full"></div>
        <span className="ml-3 text-white">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/*" element={
          isAuthenticated && userRole === "ROLE_ADMIN" 
            ? <DashboardUI onLogout={handleLogout} initialComponent="dashboard" />
            : <Navigate to="/login" />
        } />
        <Route path="/manager/*" element={
          isAuthenticated && userRole === "ROLE_MANAGER" 
            ? <DashboardUI onLogout={handleLogout} initialComponent="project" />
            : <Navigate to="/login" />
        } />
        <Route path="/user/*" element={
          isAuthenticated && userRole === "ROLE_USER" 
            ? <DashboardUI onLogout={handleLogout} initialComponent="userProject" />
            : <Navigate to="/login" />
        } />
        <Route path="/" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to={isAuthenticated ? getDefaultRoute() : "/login"} />} />
      </Routes>
      
      {/* Error Dialog */}
      <ErrorDialog 
        isOpen={errorDialog.show}
        message={errorDialog.message}
        onClose={() => setErrorDialog({ show: false, message: "" })}
      />
    </Router>
  );
}

export default App;