import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Save,
  X,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  ChevronLeft,
} from "lucide-react";

// User Card Component for Team Members
const UserCard = ({ user, onRemove, isSelectable = false, onSelect }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isSelectable
          ? "bg-gray-800 hover:bg-gray-700 cursor-pointer"
          : "bg-gray-800"
      }`}
      onClick={isSelectable ? () => onSelect(user) : undefined}
    >
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
          {user.fullName ? user.fullName.charAt(0) : "?"}
        </div>
        <div className="ml-3">
          <div className="font-medium">{user.fullName}</div>
          <div className="text-sm text-gray-400">{user.role}</div>
        </div>
      </div>
      {!isSelectable && (
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(user.id);
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// Tag Component
const TagBadge = ({ tag, onRemove, isSelectable = false, onSelect }) => {
  const tagStyle = {
    backgroundColor: tag.color + "20", // Adding transparency
    color: tag.color,
    borderColor: tag.color,
  };

  return (
    <div
      className={`flex items-center px-3 py-1 rounded-full border text-sm ${
        isSelectable ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={tagStyle}
      onClick={isSelectable ? () => onSelect(tag) : undefined}
    >
      <span>{tag.name}</span>
      {!isSelectable && (
        <button
          className="ml-2 hover:bg-gray-700 rounded-full p-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">{title}</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">{children}</div>
    </div>
  );
};

// Sửa component Toast để nhận onClose từ props thay vì gọi trực tiếp setToast
const Toast = ({ message, type }) => {
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const icon = type === "success" ? (
    <CheckCircle size={20} />
  ) : (
    <XCircle size={20} />
  );

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out opacity-0 translate-y-6 animate-toast`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};
// Component SuccessDialog cần thêm vào đầu file ProjectEdit.js
const SuccessDialog = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Tự động đóng dialog sau 1.5 giây
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      
      // Cleanup timer khi component unmount hoặc isOpen thay đổi
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in flex flex-col items-center">
        <CheckCircle size={50} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center">{message}</h2>
      </div>
    </div>
  );
};

const ProjectEdit = ({ project: initialProject, onBack, isNew = false }) => {
  const [project, setProject] = useState(
    isNew
      ? {
          name: "",
          description: "",
          startDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
          status: "NOT_STARTED",
          managerId: null,
          userIds: [],
          tagIds: [],
        }
      : null
  );

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [savingData, setSavingData] = useState(false);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const [successDialog, setSuccessDialog] = useState({
    show: false,
    message: "",
  });

  // Load project data when editing existing project
  useEffect(() => {
    if (!isNew && initialProject?.id) {
      fetchProjectData(initialProject.id);
    } else {
      setLoading(false);
    }

    // Fetch available users and tags
    fetchUsers();
    fetchTags();
  }, [isNew, initialProject]);

  const fetchProjectData = async (projectId) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get(
        `http://localhost:8080/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const projectData = response.data;

      // Convert userIds and tagIds arrays for editing
      const formattedProject = {
        ...projectData,
        userIds: projectData.users
          ? projectData.users.map((user) => user.id)
          : [],
        tagIds: projectData.tags ? projectData.tags.map((tag) => tag.id) : [],
      };

      setProject(formattedProject);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setApiError("Failed to load project data. Please try again later.");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get(
        "http://localhost:8080/api/users/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get("http://localhost:8080/api/tags", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllTags(response.data.content);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({
      ...project,
      [name]: value,
    });

    // Clear error message when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const showSuccessDialog = (message) => {
    setSuccessDialog({
      show: true,
      message: message
    });
  };

  const handleAddMember = (user) => {
    // Thêm kiểm tra project tồn tại
    if (project && !project.userIds.includes(user.id)) {
      setProject({
        ...project,
        userIds: [...project.userIds, user.id],
      });
    }
    setMembersMenuOpen(false);
  };

  const handleRemoveMember = (userId) => {
    // Thêm kiểm tra project tồn tại
    if (project) {
      setProject({
        ...project,
        userIds: project.userIds.filter((id) => id !== userId),
      });
    }
  };

  const handleAddTag = (tag) => {
    // Thêm kiểm tra project tồn tại
    if (project && !project.tagIds.includes(tag.id)) {
      setProject({
        ...project,
        tagIds: [...project.tagIds, tag.id],
      });
    }
    setTagsMenuOpen(false);
  };

  const handleRemoveTag = (tagId) => {
    // Thêm kiểm tra project tồn tại
    if (project) {
      setProject({
        ...project,
        tagIds: project.tagIds.filter((id) => id !== tagId),
      });
    }
  };

// Thay thế toàn bộ hàm validateForm trong ProjectEdit.js
const validateForm = () => {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ theo ngày

  // Validate project name
  if (!project?.name?.trim()) {
    errors.name = "Project name is required";
  } else if (project.name.length > 100) {
    errors.name = "Project name cannot exceed 100 characters";
  }

  // Validate description (không bắt buộc nhưng giới hạn độ dài)
  if (project.description && project.description.length > 200) {
    errors.description = "Description cannot exceed 200 characters";
  }

  // Validate manager
  if (!project.managerId) {
    errors.managerId = "Manager is required";
  }

  // Validate dates
  if (!project.startDate) {
    errors.startDate = "Start date is required";
  } else if (isNew && new Date(project.startDate) < today) {
    // Chỉ validate start date không được trong quá khứ khi thêm mới
    errors.startDate = "Start date cannot be in the past";
  }

  if (!project.dueDate) {
    errors.dueDate = "Due date is required";
  } else if (new Date(project.dueDate) <= new Date(project.startDate)) {
    errors.dueDate = "Due date must be after start date";
  }

  // Validate maximum project duration (2 years)
  if (project.startDate && project.dueDate) {
    const timeDiff = new Date(project.dueDate) - new Date(project.startDate);
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    if (daysDiff > 730) {
      // ~2 years
      errors.dueDate = "Project duration cannot exceed 2 years";
    }
  }

  // Validate team members limit
  if (project.userIds && project.userIds.length > 20) {
    errors.userIds = "Project cannot have more than 20 team members";
  }

  // Validate tags limit
  if (project.tagIds && project.tagIds.length > 10) {
    errors.tagIds = "Project cannot have more than 10 tags";
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  // Validate Start Date không được sau Due Date
  if (new Date(project.startDate) > new Date(project.dueDate)) {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      startDate: "Start date cannot be after due date",
      dueDate: "Due date cannot be before start date",
    }));
    return;
  }

  // Format the dates for API
  const formattedProject = {
    ...project,
    startDate: new Date(project.startDate).toISOString(),
    dueDate: new Date(project.dueDate).toISOString(),
  };

  // Remove fields that shouldn't be sent to create/update API
  const {
    id,
    users,
    tags,
    managerName,
    progress,
    totalTasks,
    totalCompletedTasks,
    ...apiProject
  } = formattedProject;

  setSavingData(true);
  setApiError(null);

  try {
    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    if (isNew) {
      // Create new project
      await axios.post("http://localhost:8080/api/projects", apiProject, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Hiển thị dialog thành công thay vì toast
      showSuccessDialog("Project created successfully!");
      
      // Tự động quay lại sau khi dialog đóng (sau 1.5 giây)
      setTimeout(() => {
        onBack(true);
      }, 1500);
    } else {
      // Update existing project
      await axios.put(
        `http://localhost:8080/api/projects/${id}`,
        apiProject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Hiển thị dialog thành công thay vì toast
      showSuccessDialog("Project updated successfully!");
  
      // Tự động quay lại sau khi dialog đóng (sau 1.5 giây)
      setTimeout(() => {
        onBack(true);
      }, 1500);
    }
  } catch (error) {
    console.error("Error saving project:", error);
    setApiError(
      `Failed to ${isNew ? "create" : "update"} project. ${
        error.response?.data?.message ||
        "Please check your input and try again."
      }`
    );
    setSavingData(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const selectedUsersDetails =
    allUsers && project && project.userIds
      ? allUsers.filter((user) => project.userIds.includes(user.id))
      : [];

  // Get selected tags' full details for display
  const selectedTagsDetails =
    allTags && project && project.tagIds
      ? allTags.filter((tag) => project.tagIds.includes(tag.id))
      : [];

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center text-gray-400 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>

        <h1 className="text-xl font-bold">
          {isNew ? "CREATE NEW PROJECT" : "EDIT PROJECT"}
        </h1>

        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center ${
              savingData ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={savingData}
          >
            <Save size={18} className="mr-2" />
            {savingData ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md mb-6">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">
                    Project Name *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 100 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={project ? project.name : ""}
                    onChange={handleChange}
                    maxLength={100}
                    className={`w-full bg-gray-700 border ${
                      formErrors.name ? "border-red-500" : "border-gray-600"
                    } rounded-md py-2 px-3 text-white`}
                    placeholder="Enter project name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {project?.name ? project.name.length : 0}/100
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">
                    Description{" "}
                    <span className="text-xs text-gray-500">
                      (Max 200 characters)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={project?.description || ""}
                    onChange={handleChange}
                    maxLength={200}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white h-32 resize-none"
                    placeholder="Enter project description"
                  ></textarea>
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {project?.description ? project.description.length : 0}/200
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">
                      Start Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={project.startDate.substring(0, 10)}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full bg-gray-700 border ${
                          formErrors.startDate
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-2 px-3 text-white`}
                      />
                      <Calendar
                        size={18}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {formErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">
                      Due Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dueDate"
                        value={project.dueDate.substring(0, 10)}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${
                          formErrors.dueDate
                            ? "border-red-500"
                            : "border-gray-600"
                        } rounded-md py-2 px-3 text-white`}
                      />
                      <Calendar
                        size={18}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {formErrors.dueDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={project.status}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    {/* <option value="COMPLETED">Completed</option>
                    <option value="OVER_DUE">Over Due</option> */}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Manager *</label>
                  <select
                    name="managerId"
                    value={project.managerId || ""}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 border ${
                      formErrors.managerId
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md py-2 px-3 text-white`}
                  >
                    <option value="">Select a manager</option>
                    {allUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  {formErrors.managerId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.managerId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Tags</h2>
                <div className="relative">
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-sm"
                    onClick={() => setTagsMenuOpen(!tagsMenuOpen)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Tag
                  </button>

                  <DropdownMenu
                    isOpen={tagsMenuOpen}
                    onClose={() => setTagsMenuOpen(false)}
                    title="Select Tags"
                  >
                    <div className="space-y-2">
                      {allTags && project && project.tagIds
                        ? allTags
                            .filter((tag) => !project.tagIds.includes(tag.id))
                            .map((tag) => (
                              <TagBadge
                                key={tag.id}
                                tag={tag}
                                isSelectable={true}
                                onSelect={handleAddTag}
                              />
                            ))
                        : null}
                    </div>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTagsDetails.length === 0 ? (
                  <p className="text-gray-400 text-sm">No tags added yet.</p>
                ) : (
                  selectedTagsDetails.map((tag) => (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      onRemove={handleRemoveTag}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Team Members */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team Members</h2>
                <div className="relative">
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-sm"
                    onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Member
                  </button>

                  <DropdownMenu
                    isOpen={membersMenuOpen}
                    onClose={() => setMembersMenuOpen(false)}
                    title="Select Team Members"
                  >
                    <div className="space-y-2">
                      {allUsers && project && project.userIds
                        ? allUsers
                            .filter(
                              (user) => !project.userIds.includes(user.id)
                            )
                            .map((user) => (
                              <UserCard
                                key={user.id}
                                user={user}
                                isSelectable={true}
                                onSelect={handleAddMember}
                              />
                            ))
                        : null}
                    </div>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                {selectedUsersDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No team members added yet.</p>
                  </div>
                ) : (
                  selectedUsersDetails.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onRemove={handleRemoveMember}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      <SuccessDialog
  isOpen={successDialog.show}
  message={successDialog.message}
  onClose={() => setSuccessDialog({ show: false, message: "" })}
/>
    </div>
  );
};

export default ProjectEdit;
