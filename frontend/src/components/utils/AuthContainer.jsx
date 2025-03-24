import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";

const AuthContainer = ({ onAuthSuccess }) => {
  // State để theo dõi xem hiển thị màn hình đăng nhập hay đăng ký
  const [showLogin, setShowLogin] = useState(true);

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    onAuthSuccess();
  };

  // Xử lý khi đăng ký thành công
  const handleSignUpSuccess = () => {
    // Có thể chuyển sang màn hình đăng nhập sau khi đăng ký thành công
    setShowLogin(true);
    // Hoặc có thể trực tiếp đăng nhập người dùng
    // onAuthSuccess();
  };

  // Chuyển đổi giữa màn hình đăng nhập và đăng ký
  const switchToLogin = () => {
    setShowLogin(true);
  };

  const switchToSignUp = () => {
    setShowLogin(false);
  };

  return (
    <>
      {showLogin ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          switchToSignUp={switchToSignUp} 
        />
      ) : (
        <SignUp 
          onSignUpSuccess={handleSignUpSuccess} 
          switchToLogin={switchToLogin} 
        />
      )}
    </>
  );
};

export default AuthContainer;