import React, { useEffect, useState } from "react";
import Project from "./Project";
import TeamTask from "./TeamTask";
import TaskOverview from "./TaskOverview";
import SelfTask from "./SelfTask";
import TaskDetail from "../detail/TaskDetail";
import ProjectDetail from "../detail/ProjectDetail";
import Sumary from "./Sumary";
import ProjectEdit from "../edit/ProjectEdit";
import TaskEdit from "../edit/TaskEdit";
import UserProfile from "../utils/UserProfile";
import UserManagement from "./UserManagement";
import Subtask from "./SubTask";
import UserProject from "./UserProject";

import {
  Menu,
  ClipboardList,
  ChevronDown,
  LogOut,
  Settings,
  ListChecks,
  Kanban,
  Bell,
  User,
  LayoutDashboard,
  FolderKanban,
  FileText,
  File,
  LogIn,
} from "lucide-react";
import NotificationCenter from "../utils/Notification";

const DashboardUI = ({ onLogout, initialComponent }) => {
  const [user, setUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(
    initialComponent || ""
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Nếu không có initialComponent, đặt trang mặc định dựa trên vai trò
      if (!initialComponent) {
        if (userData.role === "ROLE_ADMIN") {
          setActiveComponent("dashboard");
        } else if (userData.role === "ROLE_MANAGER") {
          setActiveComponent("project");
        } else if (userData.role === "ROLE_USER") {
          setActiveComponent("userProject"); // Thay đổi từ subTask thành userProject
        }
      }
    }
  }, [initialComponent]);

  // Hàm kiểm tra quyền truy cập
  const hasAccess = (component) => {
    if (!user) return false;

    switch (component) {
      case "dashboard":
        return user.role === "ROLE_ADMIN";
      case "project":
      case "teamTask":
        return user.role === "ROLE_ADMIN" || user.role === "ROLE_MANAGER";
      case "subTask":
        return true; // Tất cả role đều có thể truy cập subtask
      case "userProject":
        return (
          user.role === "ROLE_USER" ||
          user.role === "ROLE_ADMIN" ||
          user.role === "ROLE_MANAGER"
        ); // Tất cả role đều có thể truy cập userProject
      case "userManagement":
        return user.role === "ROLE_ADMIN";
      case "userProfile":
        return true; // Mọi người dùng đều có thể truy cập profile
      case "projectDetail":
      case "taskDetail":
      case "projectEdit":
      case "taskEdit":
      case "task":
        return user.role === "ROLE_ADMIN" || user.role === "ROLE_MANAGER";
      default:
        return false;
    }
  };

  // Kiểm tra quyền truy cập mỗi khi thay đổi component
  useEffect(() => {
    if (user && activeComponent && !hasAccess(activeComponent)) {
      // Chuyển hướng về trang mặc định theo vai trò
      if (user.role === "ROLE_ADMIN") {
        setActiveComponent("dashboard");
      } else if (user.role === "ROLE_MANAGER") {
        setActiveComponent("project");
      } else if (user.role === "ROLE_USER") {
        setActiveComponent("userProject"); // Thay đổi từ subTask thành userProject
      }
    }
  }, [activeComponent, user]);

  // Function to render the active component
  const renderComponent = () => {
    if (user && activeComponent && !hasAccess(activeComponent)) {
      return (
        <div className="bg-gray-950 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Access Denied</h2>
          <div className="h-96 flex items-center justify-center text-gray-500">
            <p>You don't have permission to access this resource</p>
          </div>
        </div>
      );
    }

    switch (activeComponent) {
      case "projectDetail":
        return <ProjectDetail />;
      case "taskDetail":
        return <TaskDetail />;
      case "projectEdit":
        return <ProjectEdit />;
      case "taskEdit":
        return <TaskEdit />;
      case "dashboard":
        return <Sumary />;
      case "project":
        return <Project />;
      case "task":
        return <TaskOverview />;
      case "subTask":
        return <Subtask />;
      case "userProject":
        return <UserProject />;
      case "teamTask":
        return <TeamTask />;
      case "userManagement":
        return <UserManagement />;
      case "userProfile":
        return <UserProfile user={user} />;
      default:
        return (
          <div className="bg-gray-950 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">404 - NOT FOUND</h2>
            <div className="h-96 flex items-center justify-center text-gray-500">
              <p>The requested page does not exist</p>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const toggleSettingsMenu = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage khi đăng xuất
    localStorage.removeItem("user");
    onLogout(); // Gọi hàm onLogout để chuyển hướng về màn hình đăng nhập
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:flex flex-col w-64 h-full bg-gray-900 border-r border-gray-700 transition-all duration-300 z-50 ${
          isMenuOpen ? "left-0" : "-left-64"
        } lg:left-0`}
      >
        <div className="p-4 flex items-center">
          <h1 className="text-2xl font-bold text-purple-500">Enter Track</h1>
        </div>

        <nav className="flex-1 mt-4">
          <ul>
            {user?.role === "ROLE_ADMIN" && (
              <li className="px-2">
                <button
                  onClick={() => {
                    setActiveComponent("dashboard");
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                    activeComponent === "dashboard"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>THỐNG KÊ</span>
                </button>
              </li>
            )}
            {(user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MANAGER") && (
              <li className="px-2 mt-2">
                <button
                  onClick={() => {
                    setActiveComponent("project");
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                    activeComponent === "project"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FolderKanban size={20} />
                  <span>DỰ ÁN</span>
                </button>
              </li>
            )}
            {(user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MANAGER") && (
              <li className="px-2 mt-2">
                <button
                  onClick={() => {
                    setActiveComponent("teamTask");
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                    activeComponent === "teamTask"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <ListChecks size={20} />
                  <span>NHIỆM VỤ</span>
                </button>
              </li>
            )}
            {user?.role === "ROLE_USER" && (
              <li className="px-2 mt-2">
                <button
                  onClick={() => {
                    setActiveComponent("userProject");
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                    activeComponent === "userProject"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <FolderKanban size={20} />
                  <span>DỰ ÁN</span>
                </button>
              </li>
            )}
            {user?.role === "ROLE_USER" && (
              <li className="px-2 mt-2">
                <button
                  onClick={() => {
                    setActiveComponent("subTask");
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                    activeComponent === "subTask"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <ClipboardList size={20} />
                  <span>NHIỆM VỤ</span>
                </button>
              </li>
            )}
            {user?.role === "ROLE_ADMIN" && (
              <li className="px-2 mt-2">
                <button
                  onClick={() => {
                    setActiveComponent("userManagement");
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                    activeComponent === "userManagement"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <User size={20} />
                  <span>NGƯỜI DÙNG</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gray-900 py-3 px-4">
          <div className="flex justify-between items-center">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center ml-auto gap-4">
              <NotificationCenter />

              {/* User Profile Dropdown - Cách 1 */}
              <div className="flex items-center gap-2 relative user-menu-container">
                <button
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User size={20} />
                  <span className="hidden md:inline">
                    {user ? user.fullName : ""}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-gray-800 text-white rounded-md shadow-lg p-2 z-10 min-w-[200px]">
                    <ul>
                      <li>
                        <button
                          onClick={() => {
                            setActiveComponent("userProfile");
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 rounded"
                        >
                          <User size={16} className="mr-2" />
                          Cá nhân
                        </button>
                      </li>
                      {/* <li>
                        <button
                          onClick={() => {
                            setActiveComponent("settings");
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 rounded"
                        >
                          <Settings size={16} className="mr-2" />
                          Settings
                        </button>
                      </li> */}
                      <li className="border-t border-gray-700 my-1"></li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                        >
                          <LogOut size={16} className="mr-2" />
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-black">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardUI;
