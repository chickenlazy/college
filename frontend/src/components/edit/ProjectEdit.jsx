import React, { useState, useEffect } from 'react';
import { 
  Save,
  X,
  Calendar,
  Users,
  Tag,
  Trash2,
  Plus,
  ChevronLeft
} from 'lucide-react';

// Mock project data for editing example
const mockProject = {
  id: 31,
  name: "Đồ án tốt nghiệp updated",
  description: "A comprehensive final graduation project focused on developing an innovative solution for enterprise resource planning with AI integration for predictive analytics.",
  startDate: "2025-03-17T23:53:00",
  dueDate: "2025-05-17T23:53:00",
  status: "IN_PROGRESS",
  managerId: 1,
  managerName: "John Doe",
  users: [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      avatar: null,
      role: "Project Manager"
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      avatar: null,
      role: "UI/UX Designer"
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      avatar: null,
      role: "Frontend Developer"
    },
    {
      id: 4,
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      avatar: null,
      role: "Backend Developer"
    }
  ],
  tags: [
    { id: 1, name: "Development", color: "#3B82F6" },
    { id: 2, name: "Research", color: "#8B5CF6" }
  ]
};

// Mock user data for team member selection
const mockAllUsers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    avatar: null,
    role: "Project Manager"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    avatar: null,
    role: "UI/UX Designer"
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    avatar: null,
    role: "Frontend Developer"
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    avatar: null,
    role: "Backend Developer"
  },
  {
    id: 5,
    firstName: "William",
    lastName: "Martinez",
    email: "william.martinez@example.com",
    avatar: null,
    role: "QA Engineer"
  },
  {
    id: 6,
    firstName: "Olivia",
    lastName: "Hernandez",
    email: "olivia.hernandez@example.com",
    avatar: null,
    role: "Business Analyst"
  }
];

// Mock tags data for tag selection
const mockAllTags = [
  { id: 1, name: "Development", color: "#3B82F6" },
  { id: 2, name: "Research", color: "#8B5CF6" },
  { id: 3, name: "Design", color: "#EC4899" },
  { id: 4, name: "Marketing", color: "#F59E0B" },
  { id: 5, name: "Testing", color: "#10B981" },
  { id: 6, name: "Documentation", color: "#6B7280" }
];

// User Card Component for Team Members
const UserCard = ({ user, onRemove, isSelectable = false, onSelect }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isSelectable ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer' : 'bg-gray-800'}`}
         onClick={isSelectable ? () => onSelect(user) : undefined}>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="ml-3">
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-gray-400">{user.role}</div>
        </div>
      </div>
      {!isSelectable && (
        <button 
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(user.id);
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// Tag Component
const TagBadge = ({ tag, onRemove, isSelectable = false, onSelect }) => {
  const tagStyle = {
    backgroundColor: tag.color + '20', // Adding transparency
    color: tag.color,
    borderColor: tag.color
  };
  
  return (
    <div 
      className={`flex items-center px-3 py-1 rounded-full border text-sm ${isSelectable ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={tagStyle}
      onClick={isSelectable ? () => onSelect(tag) : undefined}
    >
      <span>{tag.name}</span>
      {!isSelectable && (
        <button 
          className="ml-2 hover:bg-gray-700 rounded-full p-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">{title}</h3>
        <button 
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const ProjectEdit = ({ onBack, isNew = false }) => {
  const [project, setProject] = useState(isNew ? {
    name: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    status: "NOT_STARTED",
    managerId: null,
    managerName: "",
    users: [],
    tags: []
  } : null);
  
  const [loading, setLoading] = useState(!isNew);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Load project data when editing existing project
  useEffect(() => {
    if (!isNew) {
      // Simulate API call
      setTimeout(() => {
        setProject(mockProject);
        setLoading(false);
      }, 500);
    }
  }, [isNew]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({
      ...project,
      [name]: value
    });
    
    // Clear error message when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const handleAddMember = (user) => {
    // Check if user is already in the project
    if (!project.users.find(u => u.id === user.id)) {
      setProject({
        ...project,
        users: [...project.users, user]
      });
    }
    setMembersMenuOpen(false);
  };
  
  const handleRemoveMember = (userId) => {
    setProject({
      ...project,
      users: project.users.filter(user => user.id !== userId)
    });
  };
  
  const handleAddTag = (tag) => {
    // Check if tag is already in the project
    if (!project.tags.find(t => t.id === tag.id)) {
      setProject({
        ...project,
        tags: [...project.tags, tag]
      });
    }
    setTagsMenuOpen(false);
  };
  
  const handleRemoveTag = (tagId) => {
    setProject({
      ...project,
      tags: project.tags.filter(tag => tag.id !== tagId)
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!project.name.trim()) {
      errors.name = "Project name is required";
    }
    
    if (!project.startDate) {
      errors.startDate = "Start date is required";
    }
    
    if (!project.dueDate) {
      errors.dueDate = "Due date is required";
    } else if (new Date(project.dueDate) <= new Date(project.startDate)) {
      errors.dueDate = "Due date must be after start date";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Simulate saving project
    console.log("Saving project:", project);
    alert(`Project ${isNew ? 'created' : 'updated'} successfully!`);
    
    // In a real application, you would make an API call here
    // and redirect to the project detail page after successful save
  };
  
  const handleDelete = () => {
    // Simulate deleting project
    console.log("Deleting project:", project.id);
    alert(`Project deleted successfully!`);
    
    // In a real application, you would make an API call here
    // and redirect to the projects list page after successful delete
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center text-gray-400 hover:text-white"  onClick={onBack}>
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
        
        <h1 className="text-xl font-bold">{isNew ? 'CREATE NEW PROJECT' : 'EDIT PROJECT'}</h1>
        
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center"
            onClick={handleSubmit}
          >
            <Save size={18} className="mr-2" />
            Save
          </button>
          {!isNew && (
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md flex items-center"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} className="mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={project.name}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 border ${formErrors.name ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white`}
                    placeholder="Enter project name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={project.description}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-32 resize-none"
                    placeholder="Enter project description"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Start Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={project.startDate}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${formErrors.startDate ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white`}
                      />
                      <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {formErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-1">Due Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dueDate"
                        value={project.dueDate}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${formErrors.dueDate ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white`}
                      />
                      <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {formErrors.dueDate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={project.status}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Tags Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Tags</h2>
                <div className="relative">
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-sm"
                    onClick={() => setTagsMenuOpen(!tagsMenuOpen)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Tag
                  </button>
                  
                  <DropdownMenu
                    isOpen={tagsMenuOpen}
                    onClose={() => setTagsMenuOpen(false)}
                    title="Select Tags"
                  >
                    <div className="space-y-2">
                      {mockAllTags
                        .filter(tag => !project.tags.find(t => t.id === tag.id))
                        .map(tag => (
                          <TagBadge
                            key={tag.id}
                            tag={tag}
                            isSelectable={true}
                            onSelect={handleAddTag}
                          />
                        ))}
                    </div>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {project.tags.length === 0 ? (
                  <p className="text-gray-400 text-sm">No tags added yet.</p>
                ) : (
                  project.tags.map(tag => (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      onRemove={handleRemoveTag}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Team Members */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team Members</h2>
                <div className="relative">
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-sm"
                    onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Member
                  </button>
                  
                  <DropdownMenu
                    isOpen={membersMenuOpen}
                    onClose={() => setMembersMenuOpen(false)}
                    title="Select Team Members"
                  >
                    <div className="space-y-2">
                      {mockAllUsers
                        .filter(user => !project.users.find(u => u.id === user.id))
                        .map(user => (
                          <UserCard
                            key={user.id}
                            user={user}
                            isSelectable={true}
                            onSelect={handleAddMember}
                          />
                        ))}
                    </div>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="space-y-2">
                {project.users.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No team members added yet.</p>
                  </div>
                ) : (
                  project.users.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onRemove={handleRemoveMember}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and all associated tasks will be deleted."
      />
    </div>
  );
};

export default ProjectEdit;