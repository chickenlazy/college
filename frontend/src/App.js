import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardUI from "./components/main/Dashboard";
import Login from "./components/utils/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Kiểm tra nếu user đã được lưu trong localStorage
    const storedUser = localStorage.getItem('user');
        
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserRole(userData.role);
    }
  }, []);
  
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserRole(userData.role);
    
    // Lưu thông tin người dùng và token vào localStorage
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
      lastModifiedDate: userData.lastModifiedDate
    }));
  };
  
  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage khi logout
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };
  
  // Xác định trang mặc định và URL dựa trên vai trò
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

  // Xác định component mặc định dựa trên vai trò
  const getDefaultComponent = () => {
    switch(userRole) {
      case "ROLE_ADMIN":
        return "dashboard";
      case "ROLE_MANAGER":
        return "project";
      case "ROLE_USER":
        return "userProject"; // Thay đổi từ subTask thành userProject
      default:
        return "";
    }
  };
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />
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
    </Router>
  );
}

export default App;