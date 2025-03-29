import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar, 
  Users, 
  ListChecks, 
  PieChart, 
  MessageSquare, 
  Plus,
  User,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  Paperclip,
  Link2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download
} from 'lucide-react';

import ProjectEdit from '../edit/ProjectEdit';
import TaskEdit from '../edit/TaskEdit';

// Mock Project Data
const projectData = {
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
  tasks: [
    {
      id: 1,
      name: "Project Planning and Requirements Gathering",
      description: "Define project scope, objectives, and collect requirements from stakeholders",
      assigneeId: 1,
      assigneeName: "John Doe",
      startDate: "2025-03-17T23:53:00",
      dueDate: "2025-03-24T23:53:00",
      status: "COMPLETED",
      priority: "HIGH",
      comments: 3,
      attachments: 2
    },
    {
      id: 2,
      name: "UI/UX Design",
      description: "Create wireframes, mockups, and design system for the application",
      assigneeId: 2,
      assigneeName: "Jane Smith",
      startDate: "2025-03-25T10:00:00",
      dueDate: "2025-04-05T17:00:00",
      status: "IN_PROGRESS",
      priority: "HIGH",
      comments: 5,
      attachments: 8
    },
    {
      id: 3,
      name: "Database Design",
      description: "Design database schema and relationships",
      assigneeId: 4,
      assigneeName: "Emily Davis",
      startDate: "2025-03-25T10:00:00",
      dueDate: "2025-04-01T17:00:00",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      comments: 2,
      attachments: 1
    },
    {
      id: 4,
      name: "Frontend Development",
      description: "Implement user interface components and pages",
      assigneeId: 3,
      assigneeName: "Michael Johnson",
      startDate: "2025-04-06T09:00:00",
      dueDate: "2025-04-20T17:00:00",
      status: "NOT_STARTED",
      priority: "HIGH",
      comments: 0,
      attachments: 0
    },
    {
      id: 5,
      name: "Backend Development",
      description: "Implement server-side logic and API endpoints",
      assigneeId: 4,
      assigneeName: "Emily Davis",
      startDate: "2025-04-06T09:00:00",
      dueDate: "2025-04-25T17:00:00",
      status: "NOT_STARTED",
      priority: "HIGH",
      comments: 0,
      attachments: 0
    },
    {
      id: 6,
      name: "Integration and Testing",
      description: "Integrate frontend and backend, perform testing",
      assigneeId: null,
      assigneeName: null,
      startDate: "2025-04-26T09:00:00",
      dueDate: "2025-05-10T17:00:00",
      status: "NOT_STARTED",
      priority: "MEDIUM",
      comments: 0,
      attachments: 0
    },
    {
      id: 7,
      name: "Deployment and Documentation",
      description: "Deploy application and prepare documentation",
      assigneeId: null,
      assigneeName: null,
      startDate: "2025-05-11T09:00:00",
      dueDate: "2025-05-17T17:00:00",
      status: "NOT_STARTED",
      priority: "LOW",
      comments: 0,
      attachments: 0
    }
  ],
  totalTasks: 7,
  completedTasks: 1,
  progress: 14.3,
  documents: [
    {
      id: 1,
      name: "Project Requirements Document.pdf",
      size: "2.4 MB",
      uploadedBy: "John Doe",
      uploadedDate: "2025-03-18T10:30:00"
    },
    {
      id: 2,
      name: "UI Design Mockups.zip",
      size: "15.7 MB",
      uploadedBy: "Jane Smith",
      uploadedDate: "2025-03-26T14:15:00"
    },
    {
      id: 3,
      name: "Database Schema.png",
      size: "1.2 MB",
      uploadedBy: "Emily Davis",
      uploadedDate: "2025-03-27T11:20:00"
    }
  ],
  comments: [
    {
      id: 1,
      text: "Initial requirements have been gathered and documented. Please review the attached document.",
      author: "John Doe",
      timestamp: "2025-03-18T16:45:00",
      attachments: ["Project Requirements Document.pdf"]
    },
    {
      id: 2,
      text: "UI design work has started. Will share the first mockups by the end of the week.",
      author: "Jane Smith",
      timestamp: "2025-03-25T11:30:00",
      attachments: []
    },
    {
      id: 3,
      text: "Database schema initial draft is ready for review.",
      author: "Emily Davis",
      timestamp: "2025-03-27T11:20:00",
      attachments: ["Database Schema.png"]
    }
  ]
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Calculate days remaining
const getDaysRemaining = (endDateString) => {
  const endDate = new Date(endDateString);
  const today = new Date();
  
  // Set time to beginning of day for accurate day calculation
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get status color and icon
const getStatusInfo = (status) => {
  switch (status) {
    case 'NOT_STARTED':
      return { 
        color: 'bg-gray-500', 
        textColor: 'text-gray-500',
        icon: <Clock size={16} />,
        text: 'Not Started'
      };
    case 'IN_PROGRESS':
      return { 
        color: 'bg-blue-500', 
        textColor: 'text-blue-500',
        icon: <Clock size={16} />,
        text: 'In Progress'
      };
    case 'COMPLETED':
      return { 
        color: 'bg-green-500', 
        textColor: 'text-green-500',
        icon: <CheckCircle size={16} />,
        text: 'Completed'
      };
    case 'ON_HOLD':
      return { 
        color: 'bg-yellow-500', 
        textColor: 'text-yellow-500',
        icon: <AlertCircle size={16} />,
        text: 'On Hold'
      };
    default:
      return { 
        color: 'bg-gray-500', 
        textColor: 'text-gray-500',
        icon: <Clock size={16} />,
        text: status
      };
  }
};

// Get priority color and text
const getPriorityInfo = (priority) => {
  switch (priority) {
    case 'HIGH':
      return { 
        color: 'bg-red-500', 
        textColor: 'text-red-500',
        text: 'High'
      };
    case 'MEDIUM':
      return { 
        color: 'bg-yellow-500', 
        textColor: 'text-yellow-500',
        text: 'Medium'
      };
    case 'LOW':
      return { 
        color: 'bg-green-500', 
        textColor: 'text-green-500',
        text: 'Low'
      };
    default:
      return { 
        color: 'bg-gray-500', 
        textColor: 'text-gray-500',
        text: priority
      };
  }
};

// Task Item Component
const TaskItem = ({ task, index }) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden mb-3">
      <div 
        className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer hover:bg-gray-750"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-400 w-6">{index + 1}.</div>
          <div className={`h-3 w-3 rounded-full ${statusInfo.color}`}></div>
          <h3 className="font-medium">{task.name}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${priorityInfo.textColor}`}>●</span>
              <span>{priorityInfo.text}</span>
            </div>
            {task.assigneeName && (
              <div className="flex items-center text-sm">
                <User size={14} className="mr-1 text-gray-400" />
                <span>{task.assigneeName}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-1 text-gray-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
          <button>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-3">{task.description}</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <div className="flex items-center">
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Priority</p>
              <div className="flex items-center">
                <span className={`mr-1 ${priorityInfo.textColor}`}>●</span>
                <span>{priorityInfo.text}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Assignee</p>
              <div className="flex items-center">
                {task.assigneeName ? (
                  <>
                    <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-xs mr-2">
                      {task.assigneeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{task.assigneeName}</span>
                  </>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Start Date</p>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                <span>{formatDate(task.startDate)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Due Date</p>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Activity</p>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <MessageSquare size={14} className="mr-1 text-gray-400" />
                  <span>{task.comments}</span>
                </div>
                <div className="flex items-center">
                  <Paperclip size={14} className="mr-1 text-gray-400" />
                  <span>{task.attachments}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-2">
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Edit</button>
            {task.status !== 'COMPLETED' && (
              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center">
                <CheckCircle2 size={14} className="mr-1" />
                Complete
              </button>
            )}
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Member Component
const TeamMember = ({ user }) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
      {user.firstName[0]}{user.lastName[0]}
    </div>
    <div>
      <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
      <p className="text-sm text-gray-400">{user.role}</p>
    </div>
  </div>
);

// Document Item Component
const DocumentItem = ({ document }) => (
  <div className="flex items-center justify-between hover:bg-gray-800 p-3 rounded">
    <div className="flex items-center space-x-3">
      <FileText size={20} className="text-gray-400" />
      <div>
        <p className="font-medium">{document.name}</p>
        <p className="text-xs text-gray-400">
          {document.size} • Uploaded by {document.uploadedBy} on {formatDate(document.uploadedDate)}
        </p>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="p-1 hover:bg-gray-700 rounded">
        <Download size={18} />
      </button>
      <button className="p-1 hover:bg-gray-700 rounded">
        <Link2 size={18} />
      </button>
      <button className="p-1 hover:bg-gray-700 rounded">
        <MoreVertical size={18} />
      </button>
    </div>
  </div>
);

// Comment Item Component
const CommentItem = ({ comment }) => (
  <div className="mb-4">
    <div className="flex items-start space-x-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
        {comment.author.split(' ')[0][0]}{comment.author.split(' ')[1][0]}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium">{comment.author}</h4>
          <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleString()}</span>
        </div>
        <p className="text-sm">{comment.text}</p>
        
        {comment.attachments.length > 0 && (
          <div className="mt-2 bg-gray-800 p-2 rounded">
            {comment.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center text-xs text-blue-400 hover:underline cursor-pointer">
                <Paperclip size={12} className="mr-1" />
                {attachment}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Tab Component
const Tab = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-3 border-b-2 ${
      active 
        ? 'border-purple-500 text-purple-500' 
        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
    }`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ProjectDetail = ({ onBack }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showAddComment, setShowAddComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Thêm vào trong component ProjectDetail
const [showProjectEdit, setShowProjectEdit] = useState(false);
const [showTaskEdit, setShowTaskEdit] = useState(false);

  
  // Load project data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProject(projectData);
      setLoading(false);
    }, 500);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-gray-400">The requested project could not be found.</p>
        <button className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700">
          Back to Projects
        </button>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(project.status);
  const daysRemaining = getDaysRemaining(project.dueDate);

  if (showProjectEdit) {
    return <ProjectEdit project={project} onBack={() => setShowProjectEdit(false)} />;
  }
  
  if (showTaskEdit) {
    return <TaskEdit isNew={true} projectId={project.id} projectName={project.name} onBack={() => setShowTaskEdit(false)} />;
  }
  
  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center text-gray-400 hover:text-white" onClick={onBack}>
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Projects</span>
        </button>
        
        <div className="flex space-x-2">
        <button 
  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
  onClick={() => setShowProjectEdit(true)}
>
  <Edit size={16} className="mr-2" />
  Edit Project
</button>
          <button className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center">
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Project Title and Status */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h1 className="text-2xl font-bold mr-3">{project.name}</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} bg-opacity-20 ${statusInfo.textColor}`}>
            {statusInfo.text}
          </div>
        </div>
        <p className="text-gray-300">{project.description}</p>
      </div>
      
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Timeline</p>
              <p className="font-medium">
                {formatDate(project.startDate)} - {formatDate(project.dueDate)}
              </p>
            </div>
            <Calendar size={20} className="text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Days Remaining</p>
              <p className="font-medium">
                {daysRemaining > 0 
                  ? `${daysRemaining} days left` 
                  : daysRemaining === 0 
                    ? "Due today" 
                    : `${Math.abs(daysRemaining)} days overdue`
                }
              </p>
            </div>
            <Clock size={20} className={daysRemaining < 0 ? "text-red-500" : "text-purple-500"} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Team Members</p>
              <p className="font-medium">{project.users.length} members</p>
            </div>
            <Users size={20} className="text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tasks Progress</p>
              <p className="font-medium">{project.completedTasks}/{project.totalTasks} completed</p>
            </div>
            <ListChecks size={20} className="text-purple-500" />
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-purple-600 h-2.5 rounded-full" 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar">
          <Tab 
            icon={<ListChecks size={18} />} 
            label="Tasks" 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')} 
          />
          <Tab 
            icon={<Users size={18} />} 
            label="Team" 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
          />
          <Tab 
            icon={<FileText size={18} />} 
            label="Documents" 
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')} 
          />
          <Tab 
            icon={<MessageSquare size={18} />} 
            label="Comments" 
            active={activeTab === 'comments'} 
            onClick={() => setActiveTab('comments')} 
          />
          <Tab 
            icon={<PieChart size={18} />} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Tasks</h2>
              <button 
  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
  onClick={() => setShowTaskEdit(true)}
>
  <Plus size={16} className="mr-2" />
  Add Task
</button>
            </div>
            
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Total</div>
                  <div className="text-2xl font-bold">{project.totalTasks}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">In Progress</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {project.tasks.filter(t => t.status === 'IN_PROGRESS').length}
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Completed</div>
                  <div className="text-2xl font-bold text-green-500">
                    {project.tasks.filter(t => t.status === 'COMPLETED').length}
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Not Started</div>
                  <div className="text-2xl font-bold text-gray-500">
                    {project.tasks.filter(t => t.status === 'NOT_STARTED').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {project.tasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'team' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center">
                <Plus size={16} className="mr-2" />
                Add Member
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.users.map((user) => (
                <TeamMember key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Documents</h2>
              <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center">
                <Plus size={16} className="mr-2" />
                Upload Document
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              {project.documents.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {project.documents.map((doc) => (
                    <DocumentItem key={doc.id} document={doc} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Comments</h2>
              <button 
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                onClick={() => setShowAddComment(!showAddComment)}
              >
                <Plus size={16} className="mr-2" />
                Add Comment
              </button>
            </div>
            
            {showAddComment && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white resize-none mb-3"
                  rows="4"
                  placeholder="Type your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <div className="flex items-center justify-between">
                  <button className="flex items-center text-gray-400 hover:text-white">
                    <Paperclip size={16} className="mr-1" />
                    Attach File
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                      onClick={() => {
                        setCommentText('');
                        setShowAddComment(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {project.comments.length === 0 ? (
                <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                project.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Task Status Distribution</h3>
                <div className="flex items-center h-60 justify-center text-center">
                  <div className="text-gray-400">
                    <PieChart size={100} className="mx-auto mb-3 opacity-50" />
                    <p>Task status chart visualization would appear here</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Completed ({project.completedTasks})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">In Progress ({project.tasks.filter(t => t.status === 'IN_PROGRESS').length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    <span className="text-sm">Not Started ({project.tasks.filter(t => t.status === 'NOT_STARTED').length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">On Hold ({project.tasks.filter(t => t.status === 'ON_HOLD').length})</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Project Timeline</h3>
                <div className="flex items-center h-60 justify-center text-center">
                  <div className="text-gray-400">
                    <Calendar size={100} className="mx-auto mb-3 opacity-50" />
                    <p>Project timeline chart would appear here</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Task Ownership</h3>
                <div className="text-sm text-gray-400 mb-4">
                  Distribution of tasks among team members
                </div>
                
                {project.users.map((user) => {
                  const userTasks = project.tasks.filter(t => t.assigneeId === user.id);
                  const completedTasks = userTasks.filter(t => t.status === 'COMPLETED');
                  const percentage = userTasks.length ? (completedTasks.length / userTasks.length) * 100 : 0;
                  
                  return (
                    <div key={user.id} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs mr-2">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                        <span className="text-sm">{completedTasks.length}/{userTasks.length} tasks</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Priority Distribution</h3>
                <div className="flex items-center h-40 justify-center text-center">
                  <div className="text-gray-400">
                    <PieChart size={100} className="mx-auto mb-3 opacity-50" />
                    <p>Priority distribution chart would appear here</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">High ({project.tasks.filter(t => t.priority === 'HIGH').length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">Medium ({project.tasks.filter(t => t.priority === 'MEDIUM').length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Low ({project.tasks.filter(t => t.priority === 'LOW').length})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;