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
  Clock,
  Shield
} from "lucide-react";

const UserDetail = ({ user, onBack }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex items-center mb-6">
        <button
          onClick={() => onBack()}
          className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

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
                <div className={`w-3 h-3 rounded-full mr-2 ${userData.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}></div>
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
      ) : (
        <div className="bg-yellow-900 bg-opacity-20 text-yellow-500 p-4 rounded-md">
          No user data available
        </div>
      )}
    </div>
  );
};

export default UserDetail;