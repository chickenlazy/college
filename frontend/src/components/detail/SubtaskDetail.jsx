import React from 'react';
import { ChevronLeft, Clock, Calendar, CheckCircle, User, FolderKanban, ClipboardList, Check, X } from 'lucide-react';
import axios from 'axios';

const SubtaskDetail = ({ subtask, onBack }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.patch(
        `http://localhost:8080/api/subtasks/${subtask.id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Call onBack with refresh flag to refresh the subtask list
      onBack(true);
    } catch (err) {
      console.error("Error toggling subtask status:", err);
      // You could add error handling here, like showing a toast
    }
  };

  if (!subtask) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg">
        <div className="flex items-center mb-6">
          <button
            className="mr-4 p-2 bg-gray-800 rounded-full"
            onClick={() => onBack()}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Subtask Not Found</h2>
        </div>
        <p className="text-gray-400">The requested subtask could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          className="mr-4 p-2 bg-gray-800 rounded-full"
          onClick={() => onBack()}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Subtask Details</h2>
      </div>

      {/* Subtask Information Card */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold">{subtask.name}</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
              subtask.completed
                ? "bg-green-200 text-green-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {subtask.completed ? (
              <>
                <CheckCircle size={14} />
                Completed
              </>
            ) : (
              <>
                <Clock size={14} />
                In Progress
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div className="bg-gray-750 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400 mb-1">Project</h4>
              <div className="flex items-center">
                <FolderKanban size={18} className="mr-2 text-purple-500" />
                <span>{subtask.projectName || "N/A"}</span>
              </div>
            </div>

            <div className="bg-gray-750 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400 mb-1">Task</h4>
              <div className="flex items-center">
                <ClipboardList size={18} className="mr-2 text-purple-500" />
                <span>{subtask.taskName || "N/A"}</span>
              </div>
            </div>

            <div className="bg-gray-750 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400 mb-1">Assignee</h4>
              <div className="flex items-center">
                <User size={18} className="mr-2 text-purple-500" />
                <span>{subtask.assigneeName || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Dates */}
          <div className="space-y-4">
            <div className="bg-gray-750 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400 mb-1">Start Date</h4>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-purple-500" />
                <span>{formatDate(subtask.startDate)}</span>
              </div>
            </div>

            <div className="bg-gray-750 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400 mb-1">Due Date</h4>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-purple-500" />
                <span>{formatDate(subtask.dueDate)}</span>
              </div>
            </div>

            <div className="bg-gray-750 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400 mb-1">Last Updated</h4>
              <div className="flex items-center">
                <Clock size={18} className="mr-2 text-purple-500" />
                <span>{formatDate(subtask.lastModifiedDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              subtask.completed
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {subtask.completed ? (
              <>
                <X size={18} />
                Mark as Incomplete
              </>
            ) : (
              <>
                <Check size={18} />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Additional sections could be added here if needed */}
    </div>
  );
};

export default SubtaskDetail;