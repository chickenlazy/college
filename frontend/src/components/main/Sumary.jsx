import React, { useState, useEffect } from "react";
import ExportExcelButton from "../utils/export-excel";
import axios from "axios";
import {
  Loader,
  Calendar,
  Clock,
  CheckCircle,
  User,
  ListChecks,
  FolderKanban,
  ChevronRight,
  Flame,
  TrendingUp,
} from "lucide-react";

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
    case "NOT_STARTED":
      color = "text-gray-600";
      bgColor = "bg-gray-200";
      break;
    case "IN_PROGRESS":
      color = "text-blue-600";
      bgColor = "bg-blue-100";
      break;
    case "COMPLETED":
      color = "text-green-600";
      bgColor = "bg-green-100";
      break;
    case "ON_HOLD":
      color = "text-yellow-600";
      bgColor = "bg-yellow-100";
      break;
    case "OVER_DUE":
      color = "text-red-600";
      bgColor = "bg-red-100";
      break;
    default:
      color = "text-gray-600";
      bgColor = "bg-gray-200";
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-400">{title}</div>
        <div className="p-2 bg-gray-700 rounded-full">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ title, viewAllLink }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">{title}</h2>
    {viewAllLink && (
      <a
        href={viewAllLink}
        className="text-purple-500 text-sm flex items-center hover:underline"
      >
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
              project.progress >= 100
                ? "bg-green-500"
                : project.progress > 0
                ? "bg-blue-500"
                : "bg-gray-600"
            }`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-400">
        <Calendar size={14} className="mr-1" />
        <span>Due: {formatDate(project.dueDate)}</span>
        <span className="ml-2">
          ({daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left)
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
      {item.projectName && (
        <div className="text-xs text-gray-400">{item.projectName}</div>
      )}
      <div className="text-xs flex items-center mt-1">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            item.type === "task"
              ? "bg-blue-900 text-blue-200"
              : "bg-purple-900 text-purple-200"
          }`}
        >
          {item.type === "task" ? "TASK" : "PROJECT"}
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
      {member.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </div>
    <div className="flex-1">
      <div className="font-medium">{member.fullName}</div>
    </div>
    <div className="text-right">
      <div className="font-medium">
        {member.completedTasks}/{member.assignedTasks}
      </div>
      <div className="text-xs text-gray-400">Tasks Completed</div>
    </div>
  </div>
);

// Component này đã được loại bỏ theo yêu cầu

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
        const response = await axios.get(
          "http://localhost:8080/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

// Thay thế đoạn loading hiện tại trong Dashboard
if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Loader size={36} className="text-purple-500 animate-spin mb-4" />
      <p className="text-gray-400">Loading dashboard data...</p>
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

  const { stats, recentProjects, upcomingDeadlines, teamWorkload } = dashboardData.data;

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">DASHBOARD SUMMARY</h1>

        <div className="flex items-center space-x-4">
          <ExportExcelButton dashboardData={dashboardData} />
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - 6 columns wide */}
        <div className="col-span-12 lg:col-span-6">
          {/* Recent Projects */}
          <div className="mb-6">
            <SectionHeader title="Recent Projects" viewAllLink="/projects" />
            <div className="space-y-4">
              {recentProjects && recentProjects.length > 0 ? (
                recentProjects
                  .slice(0, 3)
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                  No recent projects
                </div>
              )}
            </div>
          </div>
          
          {/* Team Workload - Auto height with no scrolling */}
          <div>
            <SectionHeader title="Team Workload" viewAllLink="/users" />
            <div className="bg-gray-800 rounded-lg p-4">
              {teamWorkload && teamWorkload.length > 0 ? (
                teamWorkload.map((member) => (
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

        {/* Right Column - 6 columns wide */}
        <div className="col-span-12 lg:col-span-6">
          {/* Upcoming Deadlines - Auto height with no scrolling */}
          <div className="mb-6">
            <SectionHeader title="Upcoming Deadlines" viewAllLink="/tasks" />
            <div className="bg-gray-800 rounded-lg p-4">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((item) => (
                  <DeadlineItem key={`${item.type}-${item.id}`} item={item} />
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No upcoming deadlines
                </div>
              )}
            </div>
          </div>

          {/* Project Status Summary */}
          <div>
            <SectionHeader title="Status Summary" />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-medium mb-4">Project Status</h3>
                <div className="space-y-3">
                  {Object.entries(dashboardData.data.projectStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'inProgress' ? 'bg-blue-500' :
                          status === 'notStarted' ? 'bg-gray-500' :
                          status === 'onHold' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm capitalize">
                          {status.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-medium mb-4">Task Status</h3>
                <div className="space-y-3">
                  {Object.entries(dashboardData.data.taskStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'inProgress' ? 'bg-blue-500' :
                          status === 'notStarted' ? 'bg-gray-500' :
                          status === 'onHold' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm capitalize">
                          {status.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;