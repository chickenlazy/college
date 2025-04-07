import React, { useState, useEffect } from 'react';
import { Lock, UserCircle, Mail, Phone, Building, Briefcase, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

// Reusable Input Component
const ProfileInput = ({ label, icon: Icon, value, type = 'text' }) => (
  <div className="relative">
    <label className="absolute -top-2 left-3 bg-gray-900 px-1 text-xs text-gray-400">{label}</label>
    {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />}
    <input 
      type={type}
      value={value}
      readOnly
      className="w-full pl-10 pr-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all"
    />
  </div>
);

// Password Input Component
const PasswordInput = ({ label, name, value, onChange, required = false }) => (
  <div className="space-y-1">
    <label className="block text-sm text-gray-400">{label}</label>
    <input 
      type="password"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all"
    />
  </div>
);

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = storedUser ? JSON.parse(storedUser).accessToken : null;
        const userId = storedUser ? JSON.parse(storedUser).id : null;

        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user profile');

        const data = await response.json();
        setUser(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      const token = storedUser ? JSON.parse(storedUser).accessToken : null;

      const response = await fetch('http://localhost:8080/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  // Handle password input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-950">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-950 text-red-500">
      {error}
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-xl p-6 flex items-center space-x-6 shadow-lg">
          <div className="bg-purple-600 rounded-full p-3">
            <UserCircle size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-300">{user.fullName}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 border-b border-gray-800 pb-3">
            Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileInput label="Full Name" icon={UserCircle} value={user.fullName} />
            <ProfileInput label="Email" icon={Mail} value={user.email} />
            <ProfileInput label="Phone Number" icon={Phone} value={user.phoneNumber} />
            <ProfileInput label="Department" icon={Building} value={user.department} />
            <ProfileInput label="Position" icon={Briefcase} value={user.position} />
            <ProfileInput label="Address" icon={MapPin} value={user.address} />
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 border-b border-gray-800 pb-3 flex items-center">
            <Lock className="mr-3" size={20} /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <PasswordInput 
                label="Current Password" 
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                required
              />
              <PasswordInput 
                label="New Password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                required
              />
              <div className="md:col-span-2">
                <PasswordInput 
                  label="Confirm New Password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-900/50 text-red-400 p-3 rounded-md flex items-center space-x-3">
                <AlertTriangle size={20} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-900/50 text-green-400 p-3 rounded-md flex items-center space-x-3">
                <CheckCircle size={20} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md transition-colors 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                           flex items-center space-x-2"
              >
                <Lock size={18} />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;