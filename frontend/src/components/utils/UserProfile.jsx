import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  ChevronDown, 
  Shield, 
  Briefcase 
} from 'lucide-react';

const UserProfile = ({ user }) => {
  const [userState, setUserState] = useState({
    id: null,
    firstName: user.fullName.split(' ').slice(0, -1).join(' '),
    lastName: user.fullName.split(' ').slice(-1)[0],
    email: user.email,
    role: user.role,
    avatar: null,
    phone: user.phoneNumber,
    joinedDate: user.createdDate
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({...user});
  const [activeTab, setActiveTab] = useState('profile');

  // Handle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setUserState({...editedUser});
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cancel edit mode
  const handleCancel = () => {
    setEditedUser({...user});
    setIsEditing(false);
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'PROJECT_MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'TEAM_MEMBER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Generate avatar with initials if no avatar image
  const generateInitialsAvatar = () => {
    const initials = `${userState.firstName[0]}${userState.lastName[0]}`;
    return (
      <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
        {initials}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
      {/* Header with edit controls */}
      <div className="p-6 bg-gray-800 flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Profile</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
              <button 
                onClick={handleEditToggle}
                className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Save size={18} />
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditToggle}
              className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Edit size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'profile' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'projects' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'tasks' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'settings' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column - Avatar and basic info */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="mb-4">
                {userState.avatar ? (
                  <img 
                    src={userState.avatar} 
                    alt="User avatar" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                  />
                ) : generateInitialsAvatar()}
              </div>

              <div className="bg-gray-800 p-4 rounded-lg w-full">
                <h3 className="text-xl font-bold text-center">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="firstName"
                        value={editedUser.firstName}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm w-1/2"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={editedUser.lastName}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm w-1/2"
                      />
                    </div>
                  ) : (
                    `${userState.firstName} ${userState.lastName}`
                  )}
                </h3>
                <div className="mt-2 text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {isEditing ? (
                      <select
                        name="role"
                        value={editedUser.role}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                        <option value="TEAM_MEMBER">Team Member</option>
                      </select>
                    ) : (
                      userState.role.replace('_', ' ')
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column - Detailed info */}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <div className="flex items-center gap-2 border border-gray-700 rounded-md p-3 bg-gray-800">
                      <Mail size={18} className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email}
                          onChange={handleInputChange}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm flex-1"
                        />
                      ) : (
                        <span>{userState.email}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <div className="flex items-center gap-2 border border-gray-700 rounded-md p-3 bg-gray-800">
                      <Phone size={18} className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={editedUser.phone}
                          onChange={handleInputChange}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm flex-1"
                        />
                      ) : (
                        <span>{userState.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                    <div className="flex items-center gap-2 border border-gray-700 rounded-md p-3 bg-gray-800">
                      <Briefcase size={18} className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          name="position"
                          value={editedUser.position}
                          onChange={handleInputChange}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm flex-1"
                        />
                      ) : (
                        <span>{userState.position}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                    <div className="flex items-center gap-2 border border-gray-700 rounded-md p-3 bg-gray-800">
                      <Building size={18} className="text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          name="department"
                          value={editedUser.department}
                          onChange={handleInputChange}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm flex-1"
                        />
                      ) : (
                        <span>{userState.department}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Joined Date</label>
                  <div className="flex items-center gap-2 border border-gray-700 rounded-md p-3 bg-gray-800">
                    <Calendar size={18} className="text-gray-400" />
                    {isEditing ? (
                      <input
                        type="date"
                        name="joinedDate"
                        value={editedUser.joinedDate}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm flex-1"
                      />
                    ) : (
                      <span>{formatDate(userState.joinedDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Projects Tab Content - Simple placeholder content */}
      {activeTab === 'projects' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">My Projects</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-purple-600 rounded-md text-sm hover:bg-purple-700 transition-colors">
                New Project
              </button>
              <button className="px-3 py-1.5 bg-gray-700 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center gap-1">
                <span>Filter</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Project cards would go here */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
              <h4 className="font-medium">Client Portal Redesign</h4>
              <p className="text-sm text-gray-400 mt-1">Redesigning the client portal with improved UX/UI</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                <span className="text-xs text-gray-400">Due: Apr 15, 2025</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
              <h4 className="font-medium">Marketing Dashboard</h4>
              <p className="text-sm text-gray-400 mt-1">Creating analytics dashboard for marketing team</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">On Hold</span>
                <span className="text-xs text-gray-400">Due: May 10, 2025</span>
              </div>
            </div>

            <div className="text-center p-4">
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View all projects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab - Simple placeholder */}
      {activeTab === 'tasks' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">My Tasks</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-purple-600 rounded-md text-sm hover:bg-purple-700 transition-colors">
                New Task
              </button>
              <button className="px-3 py-1.5 bg-gray-700 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center gap-1">
                <span>Sort</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Task items would go here */}
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-600"/>
              <div className="flex-1">
                <h4 className="font-medium">Create wireframes for homepage</h4>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <span className="mr-3">Client Portal Redesign</span>
                  <span>Due: Mar 30, 2025</span>
                </div>
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">High</span>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-600"/>
              <div className="flex-1">
                <h4 className="font-medium">Review API documentation</h4>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <span className="mr-3">Marketing Dashboard</span>
                  <span>Due: Apr 5, 2025</span>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Medium</span>
            </div>

            <div className="text-center p-4">
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View all tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab - Simple placeholder */}
      {activeTab === 'settings' && (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Account Settings</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Profile Settings</h4>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Change Password</label>
                    <button className="px-3 py-1.5 bg-gray-700 rounded-md text-sm hover:bg-gray-600 transition-colors">
                      Update Password
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Two-Factor Authentication</label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Disabled</span>
                      <button className="px-3 py-1.5 bg-gray-700 rounded-md text-sm hover:bg-gray-600 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Notification Preferences</h4>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <input type="checkbox" checked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Task Reminders</span>
                    <input type="checkbox" checked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Project Updates</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;