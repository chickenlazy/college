import React, { useState, useEffect } from "react";
import Dashboard from "./components/main/Dashboard";
import Login from "./components/utils/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu user đã được lưu trong localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setIsAuthenticated(true);  // Nếu có thông tin user trong localStorage, xem như đã đăng nhập
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);

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
  };

  return (
    <div>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
