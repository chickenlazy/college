import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, Check, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Toast notification component
const Toast = ({ message, type }) => {
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const icon = type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />;

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out opacity-0 translate-y-6 animate-toast`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

const ForgotPassword = () => {
  // Chia làm 3 bước: 
  // 1: Nhập email, 
  // 2: Nhập mã xác nhận, 
  // 3: Nhập mật khẩu mới, 
  // 4: Hoàn thành
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Xử lý đếm ngược thời gian hiệu lực
  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Xử lý gửi yêu cầu lấy mã
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/users/forgot-password', {
        email
      });
      
      if (response.data.success) {
        setSuccess('Mã xác nhận đã được gửi đến email của bạn!');
        setStep(2);
        setTimer(60);
        setTimerActive(true);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email không tồn tại hoặc tài khoản đã bị vô hiệu hóa');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác thực mã xác nhận
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/users/verify-reset-code', {
        email,
        resetCode
      });
      
      if (response.data.success) {
        setSuccess('Mã xác nhận hợp lệ! Hãy đặt mật khẩu mới.');
        setStep(3); // Chuyển sang bước nhập mật khẩu mới
      } else {
        setError(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị toast message
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Validate password
  const validatePassword = () => {
    const errors = {};
    
    // Validate mật khẩu mới
    if (!newPassword) {
      errors.password = "Mật khẩu không được để trống";
    } else if (newPassword.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (newPassword.length > 50) {
      errors.password = "Mật khẩu không được vượt quá 50 ký tự";
    } else {
      // Kiểm tra yêu cầu phức tạp của mật khẩu
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /[0-9]/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.password = "Mật khẩu phải bao gồm chữ hoa, chữ thường, số, và ký tự đặc biệt";
      }
    }
    
    // Validate nhập lại mật khẩu
    if (!confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate mật khẩu trước khi gửi
    if (!validatePassword()) {
      showToast("Vui lòng kiểm tra lại thông tin mật khẩu", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8080/api/users/reset-password', {
        email,
        resetCode,
        newPassword
      });
      
      if (response.data.success) {
        setSuccess('Mật khẩu đã được đặt lại thành công!');
        showToast('Mật khẩu đã được đặt lại thành công!', 'success');
        setStep(4); // Chuyển sang bước hoàn thành
      } else {
        setError(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại');
        showToast(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi lại mã
  const handleResendCode = async () => {
    if (timerActive) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/users/forgot-password', {
        email
      });
      
      if (response.data.success) {
        setSuccess('Mã xác nhận mới đã được gửi!');
        setTimer(60);
        setTimerActive(true);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Lấy lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {step === 1 && "Nhập email của bạn để nhận mã xác nhận"}
            {step === 2 && "Nhập mã xác nhận đã gửi đến email của bạn"}
            {step === 3 && "Đặt mật khẩu mới cho tài khoản của bạn"}
            {step === 4 && "Mật khẩu đã được đặt lại thành công"}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          {error && (
            <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md flex items-center space-x-2">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-500 p-3 rounded-md flex items-center space-x-2">
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}
          
          {/* Bước 1: Nhập email */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendCode}>
              <div className="space-y-1">
                <label className="block text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Gửi mã xác nhận</span>
                )}
              </button>
            </form>
          )}
          
          {/* Bước 2: Nhập mã xác nhận */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              <div className="space-y-1">
                <label className="block text-gray-400 mb-1">Mã xác nhận</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                  placeholder="Nhập mã 6 chữ số"
                  required
                />
                <div className="flex justify-between items-center mt-1 text-sm">
                  <span className="text-gray-400">
                    {timerActive ? `Còn hiệu lực: ${timer}s` : "Mã đã hết hạn"}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={timerActive || loading}
                    className={`text-purple-400 hover:text-purple-300 ${timerActive || loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Xác nhận mã</span>
                )}
              </button>
            </form>
          )}

          {/* Bước 3: Nhập mật khẩu mới */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="space-y-1">
                <label className="block text-gray-400 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      // Clear validation error when user types
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: null});
                      }
                    }}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-700 border ${validationErrors.password ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:border-purple-500`}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.password}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Mật khẩu phải bao gồm chữ hoa, chữ thường, số, và ký tự đặc biệt
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-gray-400 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // Clear validation error when user types
                      if (validationErrors.confirmPassword) {
                        setValidationErrors({...validationErrors, confirmPassword: null});
                      }
                    }}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-700 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'} rounded-md text-white focus:outline-none focus:border-purple-500`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Đặt lại mật khẩu</span>
                )}
              </button>
            </form>
          )}
          
          {/* Bước 4: Hoàn thành */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="bg-green-900/30 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Thành công!</h3>
              <p className="text-gray-400 mb-6">Mật khẩu của bạn đã được đặt lại thành công.</p>
              <Link
                to="/login"
                className="inline-block py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-white focus:outline-none"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm">
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ForgotPassword;