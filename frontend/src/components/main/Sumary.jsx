import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  BarChart4, 
  LineChart, 
  PieChart,
  ListChecks,
  FolderKanban,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data for dashboard
const mockData = {
  stats: {
    totalProjects: 10,
    activeProjects: 6,
    completedProjects: 2,
    overdueProjects: 1,
    totalTasks: 32,
    completedTasks: 14,
    pendingTasks: 15,
    overdueTasks: 3
  },
  recentProjects: [
    {
      id: 31,
      name: "Đồ án tốt nghiệp updated",
      status: "IN_PROGRESS",
      progress: 20,
      dueDate: "2025-05-17T23:53:00"
    },
    {
      id: 32,
      name: "GIang ne ne ne",
      status: "NOT_STARTED",
      progress: 0,
      dueDate: "2025-03-24T21:00:00"
    },
    {
      id: 2,
      name: "Project B",
      status: "IN_PROGRESS",
      progress: 50,
      dueDate: "2025-07-01T09:00:00"
    },
    {
      id: 1,
      name: "Project A",
      status: "NOT_STARTED",
      progress: 0,
      dueDate: "2025-06-01T08:00:00"
    }
  ],
  upcomingTasks: [
    {
      id: 4,
      name: "Frontend Development",
      projectName: "Đồ án tốt nghiệp updated",
      assigneeName: "Michael Johnson",
      dueDate: "2025-04-20T17:00:00",
      status: "NOT_STARTED",
      priority: "HIGH"
    },
    {
      id: 3,
      name: "Database Design",
      projectName: "Đồ án tốt nghiệp updated",
      assigneeName: "Emily Davis",
      dueDate: "2025-04-01T17:00:00",
      status: "IN_PROGRESS",
      priority: "MEDIUM"
    },
    {
      id: 9,
      name: "Prepare monthly report",
      projectName: "Project B",
      assigneeName: "John Doe",
      dueDate: "2025-04-30T17:00:00",
      status: "NOT_STARTED",
      priority: "HIGH"
    },
    {
      id: 10,
      name: "Client meeting preparation",
      projectName: "Project C",
      assigneeName: "Michael Johnson",
      dueDate: "2025-04-12T15:00:00",
      status: "ON_HOLD",
      priority: "HIGH"
    }
  ],
  activityLog: [
    {
      id: 1,
      action: "created a new project",
      user: "John Doe",
      timestamp: "2025-03-22T09:30:00",
      details: "Đồ án tốt nghiệp updated"
    },
    {
      id: 2,
      action: "completed a task",
      user: "Jane Smith",
      timestamp: "2025-03-21T16:45:00",
      details: "Create wireframes for UI/UX Design"
    },
    {
      id: 3,
      action: "added a new team member",
      user: "John Doe",
      timestamp: "2025-03-21T14:20:00",
      details: "Emily Davis was added to Đồ án tốt nghiệp updated"
    },
    {
      id: 4,
      action: "commented on a task",
      user: "Michael Johnson",
      timestamp: "2025-03-21T11:15:00",
      details: "Left a comment on Database Design task"
    },
    {
      id: 5,
      action: "created a new task",
      user: "John Doe",
      timestamp: "2025-03-20T15:40:00",
      details: "Frontend Development for Đồ án tốt nghiệp updated"
    }
  ],
  teamMembers: [
    {
      id: 1,
      name: "John Doe",
      role: "Project Manager",
      tasks: 8,
      completedTasks: 3
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "UI/UX Designer",
      tasks: 5,
      completedTasks: 2
    },
    {
      id: 3,
      name: "Michael Johnson",
      role: "Frontend Developer",
      tasks: 7,
      completedTasks: 3
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Backend Developer",
      tasks: 6,
      completedTasks: 2
    }
  ],
  tasksByPriority: {
    HIGH: 12,
    MEDIUM: 15,
    LOW: 5
  },
  tasksByStatus: {
    COMPLETED: 14,
    IN_PROGRESS: 8,
    NOT_STARTED: 7,
    ON_HOLD: 3
  },
  projectProgress: [
    { month: 'Jan', progress: 15 },
    { month: 'Feb', progress: 30 },
    { month: 'Mar', progress: 45 },
    { month: 'Apr', progress: 60 },
    { month: 'May', progress: 80 },
    { month: 'Jun', progress: 90 }
  ]
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

// Get timestamp relative to now
const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let bgColor;
  
  switch (status) {
    case 'NOT_STARTED':
      color = 'text-gray-600';
      bgColor = 'bg-gray-200';
      break;
    case 'IN_PROGRESS':
      color = 'text-blue-600';
      bgColor = 'bg-blue-100';
      break;
    case 'COMPLETED':
      color = 'text-green-600';
      bgColor = 'bg-green-100';
      break;
    case 'ON_HOLD':
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      break;
    default:
      color = 'text-gray-600';
      bgColor = 'bg-gray-200';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>
      {status.replace(/_/g, ' ')}
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
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}>
      {priority}
    </span>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-400">{title}</div>
        <div className="p-2 bg-gray-700 rounded-full">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      {trend && (
        <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trendValue}% from last month</span>
        </div>
      )}
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ title, viewAllLink }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">{title}</h2>
    {viewAllLink && (
      <a href={viewAllLink} className="text-purple-500 text-sm flex items-center hover:underline">
        View All
        <ChevronRight size={16} />
      </a>
    )}
  </div>
);

// Project Card Component
const ProjectCard = ({ project }) => {
  const daysRemaining = Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              project.progress >= 100 ? 'bg-green-500' : 
              project.progress > 0 ? 'bg-blue-500' : 'bg-gray-600'
            }`} 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-400">
        <Calendar size={14} className="mr-1" />
        <span>Due: {formatDate(project.dueDate)}</span>
        <span className="ml-2">
          ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left)
        </span>
      </div>
    </div>
  );
};

// Task Row Component
const TaskRow = ({ task }) => (
  <div className="flex items-center py-3 border-b border-gray-700">
    <div className="flex-1">
      <div className="font-medium mb-1">{task.name}</div>
      <div className="text-xs text-gray-400">{task.projectName}</div>
    </div>
    <div className="flex items-center mr-4">
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs mr-2">
        {task.assigneeName.split(' ').map(n => n[0]).join('')}
      </div>
    </div>
    <div className="text-sm text-right mr-4">
      <div>{formatDate(task.dueDate)}</div>
    </div>
    <div>
      <StatusBadge status={task.status} />
    </div>
  </div>
);

// Activity Log Item Component
const ActivityLogItem = ({ activity }) => (
  <div className="flex items-start py-3 border-b border-gray-700">
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs mr-3">
      {activity.user.split(' ').map(n => n[0]).join('')}
    </div>
    <div className="flex-1">
      <div className="mb-1">
        <span className="font-medium">{activity.user}</span>
        <span className="text-gray-400"> {activity.action}</span>
      </div>
      <div className="text-sm text-gray-400">{activity.details}</div>
      <div className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.timestamp)}</div>
    </div>
  </div>
);

// Team Member Component
const TeamMemberRow = ({ member }) => (
  <div className="flex items-center py-3 border-b border-gray-700">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3">
      {member.name.split(' ').map(n => n[0]).join('')}
    </div>
    <div className="flex-1">
      <div className="font-medium">{member.name}</div>
      <div className="text-sm text-gray-400">{member.role}</div>
    </div>
    <div className="text-right">
      <div className="font-medium">{member.completedTasks}/{member.tasks}</div>
      <div className="text-xs text-gray-400">Tasks Completed</div>
    </div>
  </div>
);

// Chart placeholder component
const ChartPlaceholder = ({ title, icon }) => (
  <div className="bg-gray-800 rounded-lg p-4 h-64 flex flex-col items-center justify-center">
    {icon}
    <p className="text-gray-400 mt-2">{title}</p>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load dashboard data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(mockData);
      setLoading(false);
    }, 500);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">DASHBOARD SUMMARY</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-4 pr-10 rounded-md bg-gray-700 text-white w-64"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Projects" 
          value={dashboardData.stats.totalProjects} 
          icon={<FolderKanban size={20} className="text-purple-500" />} 
          trend="up"
          trendValue={12}
        />
        <StatsCard 
          title="Active Projects" 
          value={dashboardData.stats.activeProjects} 
          icon={<Clock size={20} className="text-blue-500" />} 
        />
        <StatsCard 
          title="Total Tasks" 
          value={dashboardData.stats.totalTasks} 
          icon={<ListChecks size={20} className="text-indigo-500" />} 
          trend="up"
          trendValue={8}
        />
        <StatsCard 
          title="Completed Tasks" 
          value={dashboardData.stats.completedTasks} 
          icon={<CheckCircle size={20} className="text-green-500" />} 
        />
      </div>
      
      {/* Second Row - Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <SectionHeader title="Recent Projects" viewAllLink="#" />
          <div className="grid grid-cols-1 gap-4">
            {dashboardData.recentProjects.slice(0, 3).map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
        
        <div>
          <SectionHeader title="Upcoming Tasks" viewAllLink="#" />
          <div className="bg-gray-800 rounded-lg p-4">
            {dashboardData.upcomingTasks.slice(0, 4).map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Third Row - Activity and Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <SectionHeader title="Recent Activity" viewAllLink="#" />
          <div className="bg-gray-800 rounded-lg p-4">
            {dashboardData.activityLog.slice(0, 4).map(activity => (
              <ActivityLogItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
        
        <div>
          <SectionHeader title="Team Performance" />
          <div className="bg-gray-800 rounded-lg p-4">
            {dashboardData.teamMembers.map(member => (
              <TeamMemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Fourth Row - Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartPlaceholder 
          title="Tasks by Status" 
          icon={<PieChart size={48} className="text-gray-600" />} 
        />
        <ChartPlaceholder 
          title="Tasks by Priority" 
          icon={<BarChart4 size={48} className="text-gray-600" />} 
        />
        <ChartPlaceholder 
          title="Project Progress" 
          icon={<LineChart size={48} className="text-gray-600" />} 
        />
      </div>
    </div>
  );
};

export default Dashboard;