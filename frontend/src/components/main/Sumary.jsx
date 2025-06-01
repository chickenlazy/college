import React, { useState, useEffect } from "react";
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
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
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
      {status === "NOT_STARTED"
        ? "Chưa bắt đầu"
        : status === "IN_PROGRESS"
        ? "Đang tiến hành"
        : status === "COMPLETED"
        ? "Hoàn thành"
        : status === "ON_HOLD"
        ? "Tạm dừng"
        : status === "OVER_DUE"
        ? "Quá hạn"
        : status.replace(/_/g, " ")}
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
    {/* {viewAllLink && (
      <a
        href={viewAllLink}
        className="text-purple-500 text-sm flex items-center hover:underline"
      >
        View All
        <ChevronRight size={16} />
      </a>
    )} */}
  </div>
);

// Project Card Component
const ProjectCard = ({ project }) => {
    const daysRemaining = getDaysRemaining(project.dueDate);
    
    return (
      <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium mb-2">{project.name}</h3>
            {/* Hiển thị tags nếu có */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-purple-900 text-purple-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <StatusBadge status={project.status} />
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Tiến độ</span>
            <span>{project.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
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
        
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <Calendar size={14} className="mr-1" />
          <span>Hạn: {formatDate(project.dueDate)}</span>
          <span className={`ml-2 ${
            daysRemaining < 0 ? 'text-red-400' : 
            daysRemaining < 7 ? 'text-yellow-400' : 
            'text-gray-400'
          }`}>
            ({daysRemaining < 0 ? `quá hạn ${Math.abs(daysRemaining)} ngày` : `còn ${daysRemaining} ngày`})
          </span>
        </div>
        
        {project.manager && (
          <div className="flex items-center text-sm text-gray-400">
            <User size={14} className="mr-1" />
            <span>Quản lý: {project.manager.fullName}</span>
          </div>
        )}
      </div>
    );
  };

// Deadline Item Component
const DeadlineItem = ({ item }) => {
    const daysRemaining = getDaysRemaining(item.dueDate);
    
    return (
      <div className="flex items-center py-3 border-b border-gray-700 hover:bg-gray-750 transition-colors">
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
              {item.type === "task" ? "CÔNG VIỆC" : "DỰ ÁN"}
            </span>
          </div>
        </div>
        <div className="text-sm text-right mr-4">
          <div>{formatDate(item.dueDate)}</div>
          <div className={`text-xs font-medium ${
            daysRemaining < 0 ? 'text-red-400' : 
            daysRemaining < 3 ? 'text-yellow-400' : 
            'text-gray-400'
          }`}>
            {daysRemaining < 0 ? 
              `Quá hạn ${Math.abs(daysRemaining)} ngày` : 
              `Còn ${daysRemaining} ngày`
            }
          </div>
        </div>
        <div>
          <StatusBadge status={item.status} />
        </div>
      </div>
    );
  };

// Team Workload Component
const TeamWorkloadRow = ({ member }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="flex items-center py-3 border-b border-gray-700 hover:bg-gray-750 transition-colors relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3">
        {member.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)}
      </div>
      <div className="flex-1">
        <div className="font-medium">{member.fullName}</div>
        <div className="text-xs text-gray-400 capitalize">
          {member.role.replace('ROLE_', '').toLowerCase()}
        </div>
        {/* Hiển thị workload và performance */}
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            member.workloadPercentage > 75 ? 'bg-red-900 text-red-200' :
            member.workloadPercentage > 50 ? 'bg-yellow-900 text-yellow-200' :
            'bg-green-900 text-green-200'
          }`}>
            {member.workloadPercentage}% workload
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            member.performanceScore >= 80 ? 'bg-green-900 text-green-200' :
            member.performanceScore >= 60 ? 'bg-yellow-900 text-yellow-200' :
            'bg-red-900 text-red-200'
          }`}>
            {member.performanceScore.toFixed(1)} score
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-lg">
          {member.completedTasks}/{member.assignedTasks}
        </div>
        <div className="text-xs text-gray-400">Hoàn thành</div>
        
        {/* Hiển thị thông tin bổ sung */}
        <div className="text-xs space-y-1 mt-1">
          {member.overdueTasks > 0 && (
            <div className="text-red-400 font-medium">
              {member.overdueTasks} quá hạn
            </div>
          )}
          {member.currentActiveProjects > 0 && (
            <div className="text-blue-400">
              {member.currentActiveProjects} dự án
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-full ml-2 top-0 z-10 w-64">
          <WorkloadTooltip member={member} />
        </div>
      )}
    </div>
  );
};

// Thêm component để hiển thị chi tiết workload
const WorkloadTooltip = ({ member }) => (
  <div className="bg-gray-700 border border-gray-600 p-3 rounded-lg text-xs space-y-2 shadow-lg">
    <div className="font-medium text-white border-b border-gray-600 pb-2">
      Chi tiết công việc
    </div>
    
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="text-gray-400">Đang làm:</div>
        <div className="text-blue-300 font-medium">{member.inProgressTasks}</div>
      </div>
      <div>
        <div className="text-gray-400">Quá hạn:</div>
        <div className="text-red-300 font-medium">{member.overdueTasks}</div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="text-gray-400">Dự án tham gia:</div>
        <div className="text-purple-300 font-medium">{member.currentActiveProjects}</div>
      </div>
      <div>
        <div className="text-gray-400">Hoàn thành tuần này:</div>
        <div className="text-green-300 font-medium">{member.thisWeekCompletedTasks}</div>
      </div>
    </div>
    
    <div className="border-t border-gray-600 pt-2">
      <div className="text-gray-400">Tỷ lệ đúng hạn:</div>
      <div className="text-yellow-300 font-medium">{member.onTimeCompletionRate.toFixed(1)}%</div>
    </div>
    
    <div>
      <div className="text-gray-400">Thời gian hoàn thành TB:</div>
      <div className="text-indigo-300 font-medium">
        {member.averageTaskCompletionDays > 0 ? 
          `${member.averageTaskCompletionDays.toFixed(1)} ngày` : 
          'Chưa có dữ liệu'
        }
      </div>
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
        setError(
          "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau."
        );
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
        <p className="text-gray-400">Đang tải dữ liệu bảng điều khiển...</p>
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
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.data) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Không có dữ liệu bảng điều khiển</div>
      </div>
    );
  }

  const { stats, recentProjects, upcomingDeadlines, teamWorkload } =
    dashboardData.data;

  return (
    <div className="bg-gray-950 text-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4">THỐNG KÊ</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Tổng dự án"
          value={stats.totalProjects}
          icon={<FolderKanban size={20} className="text-purple-500" />}
        />
        <StatsCard
          title="Dự án đang tiến hành"
          value={stats.inProgressProjects}
          icon={<Clock size={20} className="text-blue-500" />}
        />
        <StatsCard
          title="Dự án đã hoàn thành"
          value={stats.completedProjects}
          icon={<CheckCircle size={20} className="text-green-500" />}
        />
        <StatsCard
          title="Tổng nhiệm vụ"
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
            <SectionHeader title="Dự án gần đây" viewAllLink="/projects" />
            <div className="space-y-4">
              {recentProjects && recentProjects.length > 0 ? (
                recentProjects
                  .slice(0, 3)
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                  Không có dự án gần đây
                </div>
              )}
            </div>
          </div>

          {/* Team Workload - Auto height with no scrolling */}
          <div>
            <SectionHeader title="Thành viên" viewAllLink="/users" />
            <div className="bg-gray-800 rounded-lg p-4">
              {teamWorkload && teamWorkload.length > 0 ? (
                teamWorkload.map((member) => (
                  <TeamWorkloadRow key={member.userId} member={member} />
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  Không có dữ liệu về khối lượng công việc của thành viên
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 6 columns wide */}
        <div className="col-span-12 lg:col-span-6">
          {/* Upcoming Deadlines - Auto height with no scrolling */}
          <div className="mb-6">
            <SectionHeader title="Deadline sắp tới" viewAllLink="/tasks" />
            <div className="bg-gray-800 rounded-lg p-4">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((item) => (
                  <DeadlineItem key={`${item.type}-${item.id}`} item={item} />
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  Không có hạn chót sắp tới
                </div>
              )}
            </div>
          </div>

          {/* Project Status Summary */}
          <div>
            <SectionHeader title="Trạng thái chung" />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-medium mb-4">Trạng thái dự án</h3>
                <div className="space-y-3">
                  {Object.entries(dashboardData.data.projectStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              status === "completed"
                                ? "bg-green-500"
                                : status === "inProgress"
                                ? "bg-blue-500"
                                : status === "notStarted"
                                ? "bg-gray-500"
                                : status === "onHold"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm">
                            {status === "completed"
                              ? "Hoàn thành"
                              : status === "inProgress"
                              ? "Đang tiến hành"
                              : status === "notStarted"
                              ? "Chưa bắt đầu"
                              : status === "onHold"
                              ? "Tạm dừng"
                              : status === "overDue"
                              ? "Quá hạn"
                              : status.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-medium mb-4">
                  Trạng thái nhiệm vụ
                </h3>
                <div className="space-y-3">
                  {Object.entries(dashboardData.data.taskStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              status === "completed"
                                ? "bg-green-500"
                                : status === "inProgress"
                                ? "bg-blue-500"
                                : status === "notStarted"
                                ? "bg-gray-500"
                                : status === "onHold"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm">
                            {status === "completed"
                              ? "Hoàn thành"
                              : status === "inProgress"
                              ? "Đang tiến hành"
                              : status === "notStarted"
                              ? "Chưa bắt đầu"
                              : status === "onHold"
                              ? "Tạm dừng"
                              : status === "overDue"
                              ? "Quá hạn"
                              : status.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
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
