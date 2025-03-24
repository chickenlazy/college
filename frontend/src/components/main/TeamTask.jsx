import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Mock data for self tasks
const mockTasks = [
  {
    id: 1,
    name: "Complete project proposal",
    description: "Draft and finalize project proposal for client review",
    dueDate: "2025-04-01T10:00:00",
    priority: "HIGH",
    status: "IN_PROGRESS",
    project: "Project A",
    createdAt: "2025-03-15T09:30:00"
  },
  {
    id: 2,
    name: "Research market trends",
    description: "Analyze current market trends for quarterly report",
    dueDate: "2025-03-25T17:00:00",
    priority: "MEDIUM",
    status: "NOT_STARTED",
    project: "Market Analysis",
    createdAt: "2025-03-10T14:20:00"
  },
  {
    id: 3,
    name: "Prepare presentation slides",
    description: "Create slides for next week's client meeting",
    dueDate: "2025-03-28T09:00:00",
    priority: "HIGH",
    status: "NOT_STARTED",
    project: "Client Presentation",
    createdAt: "2025-03-18T11:45:00"
  },
  {
    id: 4,
    name: "Review code changes",
    description: "Review pull requests and provide feedback",
    dueDate: "2025-03-23T16:00:00",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    project: "Development",
    createdAt: "2025-03-20T08:15:00"
  },
  {
    id: 5,
    name: "Update documentation",
    description: "Update user guide with new features",
    dueDate: "2025-03-30T12:00:00",
    priority: "LOW",
    status: "NOT_STARTED",
    project: "Documentation",
    createdAt: "2025-03-19T13:40:00"
  },
  {
    id: 6,
    name: "Fix reported bugs",
    description: "Address bugs reported in latest release",
    dueDate: "2025-03-24T15:00:00",
    priority: "HIGH",
    status: "IN_PROGRESS",
    project: "Bug Fixes",
    createdAt: "2025-03-21T10:20:00"
  },
  {
    id: 7,
    name: "Client meeting",
    description: "Weekly progress meeting with client",
    dueDate: "2025-03-26T13:00:00",
    priority: "MEDIUM",
    status: "NOT_STARTED",
    project: "Client Relations",
    createdAt: "2025-03-17T16:30:00"
  },
  {
    id: 8,
    name: "Update project timeline",
    description: "Revise project timeline based on current progress",
    dueDate: "2025-03-27T11:00:00",
    priority: "MEDIUM",
    status: "NOT_STARTED",
    project: "Project Management",
    createdAt: "2025-03-22T09:10:00"
  },
  {
    id: 9,
    name: "Team sync-up",
    description: "Daily team sync-up meeting",
    dueDate: "2025-03-22T09:00:00",
    priority: "LOW",
    status: "COMPLETED",
    project: "Team Collaboration",
    createdAt: "2025-03-21T17:00:00"
  },
  {
    id: 10,
    name: "Prepare monthly report",
    description: "Compile data and prepare monthly performance report",
    dueDate: "2025-03-31T16:00:00",
    priority: "HIGH",
    status: "NOT_STARTED",
    project: "Reporting",
    createdAt: "2025-03-20T14:30:00"
  }
];

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let icon;
  let displayText = status.replace(/_/g, ' ');
  
  switch (status) {
    case 'NOT_STARTED':
      color = 'bg-gray-200 text-gray-800';
      icon = <Clock size={14} />;
      break;
    case 'IN_PROGRESS':
      color = 'bg-blue-200 text-blue-800';
      icon = <Clock size={14} />;
      break;
    case 'COMPLETED':
      color = 'bg-green-200 text-green-800';
      icon = <CheckCircle size={14} />;
      break;
    case 'OVERDUE':
      color = 'bg-red-200 text-red-800';
      icon = <AlertTriangle size={14} />;
      break;
    default:
      color = 'bg-gray-200 text-gray-800';
      icon = <Clock size={14} />;
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {displayText}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  let color;
  
  switch (priority) {
    case 'HIGH':
      color = 'bg-red-200 text-red-800';
      break;
    case 'MEDIUM':
      color = 'bg-yellow-200 text-yellow-800';
      break;
    case 'LOW':
      color = 'bg-green-200 text-green-800';
      break;
    default:
      color = 'bg-gray-200 text-gray-800';
  }
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {priority}
    </span>
  );
};

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Tasks' },
    { id: 'NOT_STARTED', label: 'Not Started' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'OVERDUE', label: 'Overdue' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`px-4 py-2 rounded-md ${activeFilter === filter.id ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-gray-400 gap-4">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select 
          className="bg-gray-800 border border-gray-700 rounded-md p-1"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>entries</span>
      </div>
      
      <div className="text-sm">
        Showing page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronsLeft size={18} />
        </button>
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show pages around current page
          let pageNum = i + 1;
          if (currentPage > 3 && totalPages > 5) {
            pageNum = i + currentPage - 2;
          }
          
          if (pageNum <= totalPages) {
            return (
              <button 
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-md ${pageNum === currentPage ? 'bg-purple-600' : 'bg-gray-800'}`}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({ task }) => {
  return (
    <div className="flex gap-2">
      <button className="p-2 rounded-full bg-green-600 text-white" title="View Details">
        <Eye size={16} />
      </button>
      <button className="p-2 rounded-full bg-blue-600 text-white" title="Edit Task">
        <Edit size={16} />
      </button>
      <button className="p-2 rounded-full bg-red-600 text-white" title="Delete Task">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const TeamTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Load data initially
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, []);

  // Handle checkbox selection
  const handleSelectTask = (id) => {
    if (selectedTasks.includes(id)) {
      setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
    } else {
      setSelectedTasks([...selectedTasks, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
    setSelectAll(!selectAll);
  };

  // Check if a task is overdue
  const isOverdue = (task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== 'COMPLETED';
  };

  // Filter tasks based on active filter and search
  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (activeFilter === 'OVERDUE') {
      if (!isOverdue(task)) return false;
    } else if (activeFilter !== 'all' && task.status !== activeFilter) {
      return false;
    }
    
    // Apply search filter
    if (search && !task.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Calculate pagination
  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">TEAM TASKS</h1>
        
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center gap-2">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <FilterTabs 
          activeFilter={activeFilter} 
          onFilterChange={(filter) => {
            setActiveFilter(filter);
            setCurrentPage(1); // Reset to first page when changing filter
          }} 
        />
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-4 pr-10 py-2 bg-gray-800 rounded-md w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Tasks Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-3 border-b border-gray-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
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
                  Due Date
                  <button><ArrowUpDown size={14} /></button>
                </div>
              </th>
              <th className="p-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  Priority
                  <button><ArrowUpDown size={14} /></button>
                </div>
              </th>
              <th className="p-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  Status
                  <button><ArrowUpDown size={14} /></button>
                </div>
              </th>
              <th className="p-3 border-b border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">Loading...</td>
              </tr>
            ) : currentTasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">No tasks found</td>
              </tr>
            ) : (
              currentTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-800">
                  <td className="p-3 border-b border-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleSelectTask(task.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3 border-b border-gray-700">
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-sm text-gray-400">{task.description}</div>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-700">{task.project}</td>
                  <td className="p-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-700">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="p-3 border-b border-gray-700">
                    <StatusBadge status={isOverdue(task) ? 'OVERDUE' : task.status} />
                  </td>
                  <td className="p-3 border-b border-gray-700">
                    <ActionButtons task={task} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredTasks.length}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default TeamTask;