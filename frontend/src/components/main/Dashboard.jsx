import React, { useState } from "react";
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
import Login from "../utils/Login";

import {
  Menu,
  Users,
  Search,
  Settings,
  Bell,
  User,
  LayoutDashboard,
  FolderKanban,
  FileText,
  File,
  LogIn,
} from "lucide-react";
import UserManagement from "./UserManagement";

const DashboardUI = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Function to render the active component
  const renderComponent = () => {
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
      case "selfTask":
        return <SelfTask />;
      case "teamTask":
        return <TeamTask />;
      case "userManagement":
        return <UserManagement />;
      case "login":
        return <Login />;
      case "files":
        return (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">FILES MANAGEMENT</h2>
            <div className="h-96 flex items-center justify-center text-gray-500">
              <p>Files management content will be displayed here</p>
            </div>
          </div>
        );
      case "userProfile":
        return <UserProfile />;
      default:
        return (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">404 - NOT FOUND</h2>
            <div className="h-96 flex items-center justify-center text-gray-500">
              <p>The requested page does not exist</p>
            </div>
          </div>
        );
    }
  };

  const toggleSettingsMenu = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:flex flex-col w-64 h-full bg-gray-900 transition-all duration-300 z-50 ${
          isMenuOpen ? "left-0" : "-left-64"
        } lg:left-0`}
      >
        <div className="p-4 flex items-center">
          <h1 className="text-2xl font-bold text-purple-500">HaUI</h1>
        </div>

        <nav className="flex-1 mt-4">
          <ul>
            <li className="px-2">
              <button
                onClick={() => {
                  setActiveComponent("dashboard");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "dashboard"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className="px-2 mt-2">
              <button
                onClick={() => {
                  setActiveComponent("project");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "project"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <FolderKanban size={20} />
                <span>Project</span>
              </button>
            </li>
            <li className="px-2 mt-2">
              <button
                onClick={() => {
                  setActiveComponent("task");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "task"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <FileText size={20} />
                <span>Task</span>
              </button>
            </li>
            <li className="ml-6 mt-1">
              <button
                onClick={() => {
                  setActiveComponent("selfTask");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 w-full text-left rounded-md ${
                  activeComponent === "selfTask"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>Self Task</span>
              </button>
            </li>
            <li className="ml-6 mt-1">
              <button
                onClick={() => {
                  setActiveComponent("teamTask");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 w-full text-left rounded-md ${
                  activeComponent === "teamTask"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>Team Task</span>
              </button>
            </li>
            <li className="ml-6 mt-1">
              <button
                onClick={() => {
                  setActiveComponent("projectDetail");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 w-full text-left rounded-md ${
                  activeComponent === "projectDetail"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>Project Detail</span>
              </button>
            </li>
            <li className="ml-6 mt-1">
              <button
                onClick={() => {
                  setActiveComponent("taskDetail");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 w-full text-left rounded-md ${
                  activeComponent === "taskDetail"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>Task Detail</span>
              </button>
            </li>
            <li className="ml-6 mt-1">
              <button
                onClick={() => {
                  setActiveComponent("projectEdit");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 w-full text-left rounded-md ${
                  activeComponent === "projectEdit"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>Project Edit</span>
              </button>
            </li>
            <li className="ml-6 mt-1">
              <button
                onClick={() => {
                  setActiveComponent("taskEdit");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 w-full text-left rounded-md ${
                  activeComponent === "taskEdit"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span>Task Edit</span>
              </button>
            </li>
            <li className="px-2 mt-2">
              <button
                onClick={() => {
                  setActiveComponent("userProfile");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "userProfile"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <Users size={20} />
                <span>User Profile</span>
              </button>
            </li>
            <li className="px-2 mt-2">
              <button
                onClick={() => {
                  setActiveComponent("userManagement");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "userManagement"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <Users size={20} />
                <span>User Management</span>
              </button>
            </li>
            <li className="px-2 mt-2">
              <button
                onClick={() => {
                  setActiveComponent("login");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "login"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <LogIn size={20} />
                <span>Login</span>
              </button>
            </li>
            <li className="px-2 mt-2">
              <button
                onClick={() => {
                  setActiveComponent("files");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${
                  activeComponent === "files"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <File size={20} />
                <span>Files</span>
              </button>
            </li>
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
              <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white">
                <Search size={20} />
              </button>
              <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white">
                  <User size={20} />
                </button>
                <span className="hidden md:inline">Chicken Lazy</span>
              </div>
              <button
                className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
                onClick={toggleSettingsMenu}
              >
                <Settings size={20} />
              </button>
            </div>
            {isSettingsOpen && (
              <div className="absolute top-14 right-4 bg-gray-800 text-white rounded-md shadow-lg p-2 z-10">
                <ul>
                  <li>
                    <button
                      onClick={() => {
                        setActiveComponent("userProfile");
                        setIsSettingsOpen(false);
                      }}
                      className="block px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        // Call logout logic here (e.g., clearing tokens, redirecting to login)
                        setIsSettingsOpen(false);
                        alert("Logged out!");
                      }}
                      className="block px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-950">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardUI;
