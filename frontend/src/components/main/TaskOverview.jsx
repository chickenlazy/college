import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  ChevronDown,
  User,
  MoreVertical,
  ArrowUpDown,
  PieChart,
  BarChart,
  ListChecks
} from 'lucide-react';

// Mock task data
const mockTasks = [
  {
    id: 1,
    name: "Project Planning and Requirements Gathering",
    description: "Define project scope, objectives, and collect requirements from stakeholders",
    assigneeId: 1,
    assigneeName: "John Doe",
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-03-17T23:53:00",
    dueDate: "2025-03-24T23:53:00",
    status: "COMPLETED",
    priority: "HIGH",
    progress: 100
  },
  {
    id: 2,
    name: "UI/UX Design",
    description: "Create wireframes, mockups, and design system for the application",
    assigneeId: 2,
    assigneeName: "Jane Smith",
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-03-25T10:00:00",
    dueDate: "2025-04-05T17:00:00",
    status: "IN_PROGRESS",
    priority: "HIGH",
    progress: 40
  },
  {
    id: 3,
    name: "Database Design",
    description: "Design database schema and relationships",
    assigneeId: 4,
    assigneeName: "Emily Davis",
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-03-25T10:00:00",
    dueDate: "2025-04-01T17:00:00",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    progress: 65
  },
  {
    id: 4,
    name: "Frontend Development",
    description: "Implement user interface components and pages",
    assigneeId: 3,
    assigneeName: "Michael Johnson",
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-04-06T09:00:00",
    dueDate: "2025-04-20T17:00:00",
    status: "NOT_STARTED",
    priority: "HIGH",
    progress: 0
  },
  {
    id: 5,
    name: "Backend Development",
    description: "Implement server-side logic and API endpoints",
    assigneeId: 4,
    assigneeName: "Emily Davis",
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-04-06T09:00:00",
    dueDate: "2025-04-25T17:00:00",
    status: "NOT_STARTED",
    priority: "HIGH",
    progress: 0
  },
  {
    id: 6,
    name: "Integration and Testing",
    description: "Integrate frontend and backend, perform testing",
    assigneeId: null,
    assigneeName: null,
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-04-26T09:00:00",
    dueDate: "2025-05-10T17:00:00",
    status: "NOT_STARTED",
    priority: "MEDIUM",
    progress: 0
  },
  {
    id: 7,
    name: "Deployment and Documentation",
    description: "Deploy application and prepare documentation",
    assigneeId: null,
    assigneeName: null,
    projectId: 31,
    projectName: "Đồ án tốt nghiệp updated",
    startDate: "2025-05-11T09:00:00",
    dueDate: "2025-05-17T17:00:00",
    status: "NOT_STARTED",
    priority: "LOW",
    progress: 0
  },
  {
    id: 8,
    name: "Update marketing website",
    description: "Update the company website with new product features",
    assigneeId: 2,
    assigneeName: "Jane Smith",
    projectId: 2,
    projectName: "Project B",
    startDate: "2025-04-01T10:00:00",
    dueDate: "2025-04-10T17:00:00",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    progress: 30
  },
  {
    id: 9,
    name: "Prepare monthly report",
    description: "Create monthly performance report for stakeholders",
    assigneeId: 1,
    assigneeName: "John Doe",
    projectId: 2,
    projectName: "Project B",
    startDate: "2025-04-20T09:00:00",
    dueDate: "2025-04-30T17:00:00",
    status: "NOT_STARTED",
    priority: "HIGH",
    progress: 0
  },
  {
    id: 10,
    name: "Client meeting preparation",
    description: "Prepare presentation and demos for client meeting",
    assigneeId: 3,
    assigneeName: "Michael Johnson",
    projectId: 3,
    projectName: "Project C",
    startDate: "2025-04-05T10:00:00",
    dueDate: "2025-04-12T15:00:00",
    status: "ON_HOLD",
    priority: "HIGH",
    progress: 15
  }
];

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Get days remaining
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

// Check if a task is overdue
const isOverdue = (task) => {
  const daysRemaining = getDaysRemaining(task.dueDate);
  return daysRemaining < 0 && task.status !== 'COMPLETED';
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let bgColor;
  let icon;
  let displayText = status.replace(/_/g, ' ');
  
  switch (status) {
    case 'NOT_STARTED':
      color = 'text-gray-600';
      bgColor = 'bg-gray-200';
      icon = <Clock size={14} />;
      break;
    case 'IN_PROGRESS':
      color = 'text-blue-600';
      bgColor = 'bg-blue-100';
      icon = <Clock size={14} />;
      break;
    case 'COMPLETED':
      color = 'text-green-600';
      bgColor = 'bg-green-100';
      icon = <CheckCircle size={14} />;
      break;
    case 'ON_HOLD':
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      icon = <AlertTriangle size={14} />;
      break;
    case 'OVERDUE':
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      icon = <AlertTriangle size={14} />;
      displayText = 'Overdue';
      break;
    default:
      color = 'text-gray-600';
      bgColor = 'bg-gray-200';
      icon = <Clock size={14} />;
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>
      {icon}
      {displayText}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  let color;
  let bgColor;
  
  switch (priority) {
    case 'HIGH':
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      break;
    case 'MEDIUM':
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      break;
    case 'LOW':
      color = 'text-green-600';
      bgColor = 'bg-green-100';
      break;
    default:
      color = 'text-gray-600';
      bgColor = 'bg-gray-200';
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>
      <Flag size={14} />
      {priority}
    </span>
  );
};

// Task Row Component
const TaskRow = ({ task, onClick }) => {
  const effectiveStatus = isOverdue(task) ? 'OVERDUE' : task.status;
  const daysRemaining = getDaysRemaining(task.dueDate);
  
  return (
    <tr 
      className="hover:bg-gray-800 cursor-pointer"
      onClick={onClick}
    >
      <td className="p-3 border-b border-gray-700">
        <div className="font-medium">{task.name}</div>
        <div className="text-sm text-gray-400 line-clamp-1">{task.description}</div>
      </td>
      <td className="p-3 border-b border-gray-700">
        {task.projectName}
      </td>
      <td className="p-3 border-b border-gray-700">
        <div className="flex items-center">
          {task.assigneeName ? (
            <>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs mr-2">
                  {task.assigneeName.split(' ').map(n => n[0]).join('')}
                </div>
                <span>{task.assigneeName}</span>
              </div>
            </>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>
      </td>
      <td className="p-3 border-b border-gray-700">
        <div className="flex flex-col">
          <span>{formatDate(task.dueDate)}</span>
          <span className={`text-xs ${
            daysRemaining < 0 ? 'text-red-500' : 
            daysRemaining === 0 ? 'text-yellow-500' : 
            daysRemaining <= 3 ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {daysRemaining > 0 
              ? `${daysRemaining} days left` 
              : daysRemaining === 0 
                ? "Due today" 
                : `${Math.abs(daysRemaining)} days overdue`
            }
          </span>
        </div>
      </td>
      <td className="p-3 border-b border-gray-700">
        <StatusBadge status={effectiveStatus} />
      </td>
      <td className="p-3 border-b border-gray-700">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="p-3 border-b border-gray-700">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              task.progress >= 100 ? 'bg-green-500' : 
              task.progress > 0 ? 'bg-blue-500' : 'bg-gray-600'
            }`} 
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-right mt-1">{task.progress}%</div>
      </td>
      <td className="p-3 border-b border-gray-700">
        <button className="p-1 hover:bg-gray-700 rounded-full">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
};

// Task Card Component for Grid View
const TaskCard = ({ task, onClick }) => {
  const effectiveStatus = isOverdue(task) ? 'OVERDUE' : task.status;
  const daysRemaining = getDaysRemaining(task.dueDate);
  
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <StatusBadge status={effectiveStatus} />
          <PriorityBadge priority={task.priority} />
        </div>
        
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{task.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm">
            <div className="flex items-center text-gray-400">
              <Calendar size={14} className="mr-1" />
              {formatDate(task.dueDate)}
            </div>
            <div className={`text-xs ${
              daysRemaining < 0 ? 'text-red-500' : 
              daysRemaining === 0 ? 'text-yellow-500' : 
              daysRemaining <= 3 ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {daysRemaining > 0 
                ? `${daysRemaining} days left` 
                : daysRemaining === 0 
                  ? "Due today" 
                  : `${Math.abs(daysRemaining)} days overdue`
              }
            </div>
          </div>
          
          <div className="text-right">
            <div className="w-16 bg-gray-700 rounded-full h-1.5 mb-1">
              <div 
                className={`h-1.5 rounded-full ${
                  task.progress >= 100 ? 'bg-green-500' : 
                  task.progress > 0 ? 'bg-blue-500' : 'bg-gray-600'
                }`} 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400">{task.progress}%</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            {task.projectName}
          </div>
          {task.assigneeName ? (
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs">
                {task.assigneeName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter Component
const FilterDropdown = ({ title, options, selectedOption, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}: {selectedOption === 'all' ? 'All' : selectedOption}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-gray-800 rounded-md shadow-lg z-10">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${selectedOption === option.value ? 'bg-purple-600' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// View Toggle Component
const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="flex rounded-md overflow-hidden">
      <button 
        className={`px-3 py-2 ${view === 'list' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
        onClick={() => onViewChange('list')}
      >
        <ListChecks size={18} />
      </button>
      <button 
        className={`px-3 py-2 ${view === 'grid' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
        onClick={() => onViewChange('grid')}
      >
        <BarChart size={18} />
      </button>
    </div>
  );
};

// Summary Cards Component
const SummaryCards = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const notStartedTasks = tasks.filter(t => t.status === 'NOT_STARTED').length;
  const onHoldTasks = tasks.filter(t => t.status === 'ON_HOLD').length;
  const overdueTasks = tasks.filter(t => isOverdue(t)).length;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>
          <ListChecks size={20} className="text-purple-500" />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
          </div>
          <CheckCircle size={20} className="text-green-500" />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-500">{inProgressTasks}</p>
          </div>
          <Clock size={20} className="text-blue-500" />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">Not Started</p>
            <p className="text-2xl font-bold text-gray-500">{notStartedTasks}</p>
          </div>
          <Clock size={20} className="text-gray-500" />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">On Hold</p>
            <p className="text-2xl font-bold text-yellow-500">{onHoldTasks}</p>
          </div>
          <AlertTriangle size={20} className="text-yellow-500" />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-500">{overdueTasks}</p>
          </div>
          <AlertTriangle size={20} className="text-red-500" />
        </div>
      </div>
    </div>
  );
};

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  
  // Load task data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, []);
  
  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    if (statusFilter === 'overdue') {
      if (!isOverdue(task)) return false;
    } else if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    
    // Apply assignee filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned' && task.assigneeId) return false;
      if (assigneeFilter !== 'unassigned' && task.assigneeName !== assigneeFilter) return false;
    }
    
    // Apply project filter
    if (projectFilter !== 'all' && task.projectName !== projectFilter) {
      return false;
    }
    
    return true;
  });
  
  // Extract unique values for filter dropdowns
  const uniqueProjects = [...new Set(tasks.map(task => task.projectName))];
  const uniqueAssignees = [...new Set(tasks.filter(task => task.assigneeName).map(task => task.assigneeName))];
  
  // Handle task click (would typically navigate to task detail)
  const handleTaskClick = (taskId) => {
    console.log(`Clicked on task ${taskId}`);
    // In a real app, you'd navigate to the task detail page
  };
  
  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">TASK OVERVIEW</h1>
        
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center gap-2">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards tasks={tasks} />
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-10 pr-4 py-2 bg-gray-800 rounded-md w-full text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <FilterDropdown 
            title="Status"
            options={[
              { value: 'all', label: 'All' },
              { value: 'NOT_STARTED', label: 'Not Started' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ON_HOLD', label: 'On Hold' },
              { value: 'overdue', label: 'Overdue' }
            ]}
            selectedOption={statusFilter}
            onChange={setStatusFilter}
          />
          
          <FilterDropdown 
            title="Priority"
            options={[
              { value: 'all', label: 'All' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' }
            ]}
            selectedOption={priorityFilter}
            onChange={setPriorityFilter}
          />
          
          <FilterDropdown 
            title="Assignee"
            options={[
              { value: 'all', label: 'All' },
              ...uniqueAssignees.map(name => ({ value: name, label: name })),
              { value: 'unassigned', label: 'Unassigned' }
            ]}
            selectedOption={assigneeFilter}
            onChange={setAssigneeFilter}
          />
          
          <FilterDropdown 
            title="Project"
            options={[
              { value: 'all', label: 'All' },
              ...uniqueProjects.map(name => ({ value: name, label: name }))
            ]}
            selectedOption={projectFilter}
            onChange={setProjectFilter}
          />
        </div>
        
        <ViewToggle view={view} onViewChange={setView} />
      </div>
      
      {/* Task List or Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-gray-300 mb-2">No tasks found</h3>
          <p className="text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : view === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-800">
                <th className="p-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    Task
                    <button><ArrowUpDown size={14} /></button>
                  </div>
                </th>
                <th className="p-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    Project
                    <button><ArrowUpDown size={14} /></button>
                  </div>
                </th>
                <th className="p-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    Assignee
                    <button><ArrowUpDown size={14} /></button>
                  </div>
                </th>
                <th className="p-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    Due Date
                    <button><ArrowUpDown size={14} /></button>
                  </div>
                </th>
                <th className="p-3 border-b border-gray-700">Status</th>
                <th className="p-3 border-b border-gray-700">Priority</th>
                <th className="p-3 border-b border-gray-700">Progress</th>
                <th className="p-3 border-b border-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => handleTaskClick(task.id)}
            />
          ))}
        </div>
      )}
      
      {/* Pagination (simplified) */}
      {filteredTasks.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
          
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-800 rounded">Previous</button>
            <button className="px-3 py-1 bg-purple-600 rounded">1</button>
            <button className="px-3 py-1 bg-gray-800 rounded">2</button>
            <button className="px-3 py-1 bg-gray-800 rounded">3</button>
            <button className="px-3 py-1 bg-gray-800 rounded">Next</button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Show</span>
            <select className="bg-gray-800 border border-gray-700 rounded p-1">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span className="text-sm text-gray-400">per page</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskOverview;