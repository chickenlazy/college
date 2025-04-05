import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  BarChart4 as BarIcon, 
  LineChart as LineIcon, 
  PieChart as PieIcon,
  ListChecks,
  FolderKanban,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

// Calculate days remaining
const getDaysRemaining = (dateString) => {
  if (!dateString) return 0;
  const dueDate = new Date(dateString);
  const today = new Date();
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
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
    case 'OVER_DUE':
      color = 'text-red-600';
      bgColor = 'bg-red-100';
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

// Stats Card Component
const StatsCard = ({ title, value, icon, trend }) => {
  // Generate random trend percentage between 3 and 15
  const randomTrend = Math.floor(Math.random() * 13) + 3;
  const showTrend = trend !== undefined ? trend : randomTrend;
  const isPositive = showTrend > 0;
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-400">{title}</div>
        <div className="p-2 bg-gray-700 rounded-full">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{Math.abs(showTrend)}% from last month</span>
      </div>
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
  const daysRemaining = getDaysRemaining(project.dueDate);
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progress</span>
          <span>{project.progress.toFixed(1)}%</span>
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
      {project.manager && (
        <div className="flex items-center mt-2 text-sm text-gray-400">
          <User size={14} className="mr-1" />
          <span>Manager: {project.manager.fullName}</span>
        </div>
      )}
    </div>
  );
};

// Deadline Item Component
const DeadlineItem = ({ item }) => (
  <div className="flex items-center py-3 border-b border-gray-700">
    <div className="flex-1">
      <div className="font-medium mb-1">{item.name}</div>
      {item.projectName && <div className="text-xs text-gray-400">{item.projectName}</div>}
      <div className="text-xs flex items-center mt-1">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'task' ? 'bg-blue-900 text-blue-200' : 'bg-purple-900 text-purple-200'}`}>
          {item.type === 'task' ? 'TASK' : 'PROJECT'}
        </span>
      </div>
    </div>
    <div className="text-sm text-right mr-4">
      <div>{formatDate(item.dueDate)}</div>
      <div className="text-xs text-gray-400">
        {getDaysRemaining(item.dueDate)} days left
      </div>
    </div>
    <div>
      <StatusBadge status={item.status} />
    </div>
  </div>
);

// Team Workload Component
const TeamWorkloadRow = ({ member }) => (
  <div className="flex items-center py-3 border-b border-gray-700">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3">
      {member.fullName.split(' ').map(n => n[0]).join('')}
    </div>
    <div className="flex-1">
      <div className="font-medium">{member.fullName}</div>
    </div>
    <div className="text-right">
      <div className="font-medium">{member.completedTasks}/{member.assignedTasks}</div>
      <div className="text-xs text-gray-400">Tasks Completed</div>
    </div>
  </div>
);

// Project Status Chart component
const ProjectStatusChart = ({ data }) => {
  // Define colors for different status
  const statusColors = {
    inProgress: '#3B82F6', // blue
    notStarted: '#6B7280', // gray
    onHold: '#F59E0B',     // amber
    completed: '#10B981',  // green
    overDue: '#EF4444'     // red
  };

  // Prepare data for the pie chart
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    value: value,
    fill: statusColors[key] || '#6B7280'
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-64">
      <h3 className="text-sm font-medium mb-3">Project Status</h3>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Task Status Chart component
const TaskStatusChart = ({ data }) => {
  // Define colors for different status
  const statusColors = {
    completed: '#10B981',   // green
    inProgress: '#3B82F6',  // blue
    notStarted: '#6B7280',  // gray
    overDue: '#EF4444',     // red
    onHold: '#F59E0B'       // amber
  };

  // Prepare data for the bar chart
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    value: value,
    fill: statusColors[key] || '#6B7280'
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-64">
      <h3 className="text-sm font-medium mb-3">Task Status</h3>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`${value} tasks`, 'Count']}
              contentStyle={{ backgroundColor: '#374151', border: 'none' }}
              labelStyle={{ color: 'white' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Progress Trend Chart Component
const ProgressTrendChart = () => {
  // Sample data for project completion trend
  const trendData = [
    { name: 'Jan', completed: 5, total: 12 },
    { name: 'Feb', completed: 8, total: 15 },
    { name: 'Mar', completed: 12, total: 18 },
    { name: 'Apr', completed: 7, total: 10 },
    { name: 'May', completed: 9, total: 14 },
    { name: 'Jun', completed: 11, total: 16 },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-64">
      <h3 className="text-sm font-medium mb-3">Completion Trend</h3>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#374151', border: 'none' }}
              labelStyle={{ color: 'white' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2} 
              activeDot={{ r: 8 }} 
              name="Completed" 
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#6366F1" 
              strokeWidth={2} 
              name="Total" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get authentication token
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        // Fetch dashboard data
        const response = await axios.get("http://localhost:8080/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!dashboardData || !dashboardData.data) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">No dashboard data available</div>
      </div>
    );
  }

  const { 
    stats, 
    projectStatus, 
    taskStatus, 
    recentProjects, 
    upcomingDeadlines, 
    teamWorkload 
  } = dashboardData.data;
  
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
          value={stats.totalProjects} 
          icon={<FolderKanban size={20} className="text-purple-500" />}
        />
        <StatsCard 
          title="In Progress Projects" 
          value={stats.inProgressProjects} 
          icon={<Clock size={20} className="text-blue-500" />} 
        />
        <StatsCard 
          title="Completed Projects" 
          value={stats.completedProjects} 
          icon={<CheckCircle size={20} className="text-green-500" />} 
        />
        <StatsCard 
          title="Total Tasks" 
          value={stats.totalTasks} 
          icon={<ListChecks size={20} className="text-indigo-500" />} 
        />
      </div>
      
      {/* Second Row - Projects and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <SectionHeader title="Recent Projects" viewAllLink="/projects" />
          <div className="grid grid-cols-1 gap-4">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.slice(0, 3).map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                No recent projects
              </div>
            )}
          </div>
        </div>
        
        <div>
          <SectionHeader title="Upcoming Deadlines" viewAllLink="/tasks" />
          <div className="bg-gray-800 rounded-lg p-4">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(item => (
                <DeadlineItem key={`${item.type}-${item.id}`} item={item} />
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No upcoming deadlines
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Third Row - Status Charts and Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ProjectStatusChart data={projectStatus} />
        <TaskStatusChart data={taskStatus} />
        
        <div>
          <SectionHeader title="Team Workload" viewAllLink="/users" />
          <div className="bg-gray-800 rounded-lg p-4 h-64 overflow-auto">
            {teamWorkload && teamWorkload.length > 0 ? (
              teamWorkload.map(member => (
                <TeamWorkloadRow key={member.userId} member={member} />
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No team workload data
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fourth Row - Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressTrendChart />
        
        <div className="bg-gray-800 rounded-lg p-4 h-64">
          <h3 className="text-sm font-medium mb-3">Hot Projects</h3>
          <div className="space-y-4 overflow-auto h-52 pr-2">
            {recentProjects && recentProjects.length > 0 ? 
              recentProjects.slice(0, 4).map((project, index) => (
                <div key={project.id} className="flex items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <div className="flex items-center mt-1">
                      <StatusBadge status={project.status} />
                      <div className="ml-2 text-xs text-gray-400">
                        <Flame className="h-3 w-3 inline mr-1 text-amber-500" />
                        {project.progress.toFixed(0)}% complete
                      </div>
                    </div>
                  </div>
                  <div className="ml-2">
                    <TrendingUp className={`h-5 w-5 ${
                      project.progress > 50 ? 'text-green-500' : 'text-amber-500'
                    }`} />
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-400 py-4">
                  No projects data
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;