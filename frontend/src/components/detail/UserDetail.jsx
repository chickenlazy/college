import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Loader,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Check,
  Clock,
  ChevronLeft,
  Shield, 
  IdCard  
} from "lucide-react";

const UserDetail = ({ user, onBack }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [subtasksLoading, setSubtasksLoading] = useState(true);

  useEffect(() => {
    const fetchUserProjectsAndSubtasks = async () => {
      if (!user) return;

      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          token = userObj.accessToken;
        }

        // Gọi API lấy danh sách projects
        const projectsResponse = await axios.get(
          `http://localhost:8080/api/projects/user/${user.id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProjects(projectsResponse.data);
        setProjectsLoading(false);

        // Gọi API lấy danh sách subtasks
        const subtasksResponse = await axios.get(
          `http://localhost:8080/api/subtasks/user/${user.id}/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubtasks(subtasksResponse.data);
        setSubtasksLoading(false);
      } catch (err) {
        console.error("Error fetching projects and subtasks:", err);
        setProjectsLoading(false);
        setSubtasksLoading(false);
      }
    };

    fetchUserProjectsAndSubtasks();
  }, [user]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!user) {
        setError("No user information available");
        setLoading(false);
        return;
      }

      try {
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          token = userObj.accessToken;
        }

        const response = await axios.get(
          `http://localhost:8080/api/users/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [user]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-950 text-white">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onBack(true)} // Thêm tham số true để báo hiệu cần refresh
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
      </div>
      {/* <div className="flex items-center mb-6">
        <button
          onClick={() => onBack()}
          className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div> */}
   
      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={36} className="text-purple-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-20 text-red-500 p-4 rounded-md">
          {error}
        </div>
      ) : userData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info Card */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mr-4">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userData.fullName}</h2>
                  <div className="flex items-center text-gray-400 mt-1">
                    <Briefcase size={14} className="mr-1" />
                    <span>{userData.position}</span>
                  </div>
                </div>
              </div>
   
              <div className="space-y-4 mt-6">
                <div className="flex items-start">
                  <Mail className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p>{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <IdCard  className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p>{userData.username}</p>
                  </div>
                </div>
   
                <div className="flex items-start">
                  <Phone className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p>{userData.phoneNumber || "N/A"}</p>
                  </div>
                </div>
   
                <div className="flex items-start">
                  <Shield className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p>{userData.role?.replace("ROLE_", "") || "N/A"}</p>
                  </div>
                </div>
   
                <div className="flex items-start">
                  <Briefcase className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Department</p>
                    <p>{userData.department || "N/A"}</p>
                  </div>
                </div>
   
                <div className="flex items-start">
                  <MapPin className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p>{userData.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
   
            {/* Status and Timestamps Card */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2">
                Status Information
              </h3>
   
              <div className="space-y-4">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      userData.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span>Status: {userData.status}</span>
                </div>
   
                <div className="flex items-start mt-4">
                  <Calendar className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Created Date</p>
                    <p>{formatDate(userData.createdDate)}</p>
                  </div>
                </div>
   
                <div className="flex items-start mt-4">
                  <Clock className="mr-3 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Last Modified</p>
                    <p>{formatDate(userData.lastModifiedDate)}</p>
                  </div>
                </div>
              </div>
            </div>
   
            {/* Additional Information Card */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2">
                Additional Information
              </h3>
   
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Position</p>
                  <p className="font-medium">{userData.position || "N/A"}</p>
                </div>
   
                <div>
                  <p className="text-gray-400 text-sm">ID</p>
                  <p className="font-medium">#{userData.id}</p>
                </div>
   
                {/* Additional fields can be added here */}
              </div>
            </div>
          </div>
   
          {/* Projects and Subtasks Section */}
          <div className="mt-8 col-span-full">
            {/* Projects Card */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2 flex items-center">
                <Briefcase size={18} className="mr-2 text-purple-400" />
                Projects ({projects.length})
              </h3>
              
              {projectsLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader size={24} className="text-purple-500 animate-spin" />
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(project => (
                    <div key={project.id} className="bg-gray-800 hover:bg-gray-750 transition-colors rounded-md p-4 border-l-4 border-purple-500">
                      <h4 className="font-medium text-lg">{project.name}</h4>
                      <div className="mt-2 flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === "COMPLETED" ? "bg-green-900 text-green-300" : 
                          project.status === "IN_PROGRESS" ? "bg-blue-900 text-blue-300" :
                          project.status === "NOT_STARTED" ? "bg-gray-700 text-gray-300" :
                          "bg-yellow-900 text-yellow-300"
                        }`}>
                          {project.status.replace(/_/g, " ")}
                        </span>
                        <div className="w-24 bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No projects found for this user</p>
                </div>
              )}
            </div>
            
            {/* Subtasks Card */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg mt-6">
              <h3 className="font-semibold text-lg mb-4 border-b border-gray-800 pb-2 flex items-center">
                <Check size={18} className="mr-2 text-purple-400" />
                Assigned Subtasks ({subtasks.length})
              </h3>
              
              {subtasksLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader size={24} className="text-purple-500 animate-spin" />
                </div>
              ) : subtasks.length > 0 ? (
                <div className="space-y-3">
                  {subtasks.map(subtask => (
                    <div key={subtask.id} className="bg-gray-800 rounded-md p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${subtask.completed ? "bg-green-500" : "border-2 border-gray-600"}`}>
                            {subtask.completed && <Check size={12} className="text-green-900" />}
                          </div>
                          <h4 className="font-medium">{subtask.name}</h4>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-xs ${subtask.completed ? "bg-green-900 text-green-300" : "bg-yellow-900 text-red-300"}`}>
                          {subtask.completed ? "Completed" : "In Progress"}
                        </div>
                      </div>
                      <div className="ml-7 mt-2 grid grid-cols-2 gap-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Briefcase size={12} className="mr-1" />
                          <span>{subtask.projectName}</span>
                        </div>
                        <div className="flex items-center">
                          <Check size={12} className="mr-1" />
                          <span>{subtask.taskName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          <span>Due: {formatDate(subtask.dueDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          <span>Created: {formatDate(subtask.createdDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Check size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No subtasks assigned to this user</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-900 bg-opacity-20 text-yellow-500 p-4 rounded-md">
          No user data available
        </div>
      )}
    </div>
   );
};

export default UserDetail;
