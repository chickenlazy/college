import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  RotateCcw,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";
import ProjectDetail from "../detail/ProjectDetail";
import ProjectEdit from "../edit/ProjectEdit";

// Mock data from the provided JSON
const mockData = {
  content: [
    {
      id: 32,
      name: "GIang ne ne ne",
      description: "gjdfjg",
      startDate: "2025-03-21T21:00:00",
      dueDate: "2025-03-24T21:00:00",
      status: "NOT_STARTED",
      managerId: 1,
      users: [],
      tasks: [],
      totalTask: 0,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 31,
      name: "Đồ án tốt nghiệp updated",
      description: "Đồ án tốt nghiệp Description",
      startDate: "2025-03-17T23:53:00",
      dueDate: "2025-05-17T23:53:00",
      status: "IN_PROGRESS",
      managerId: 1,
      users: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
        },
      ],
      tasks: [],
      totalTask: 0,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 1,
      name: "Project A",
      description: "Description for Project A",
      startDate: "2025-03-01T08:00:00",
      dueDate: "2025-06-01T08:00:00",
      status: "NOT_STARTED",
      managerId: 1,
      users: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
        },
        {
          id: 3,
          firstName: "Michael",
          lastName: "Johnson",
          email: "michael.johnson@example.com",
        },
        {
          id: 4,
          firstName: "Emily",
          lastName: "Davis",
          email: "emily.davis@example.com",
        },
      ],
      tasks: [
        {
          id: 2,
          name: "Task 2 for Project A",
          status: "IN_PROGRESS",
        },
        {
          id: 1,
          name: "Task 1 for Project A",
          status: "PENDING",
        },
      ],
      totalTask: 2,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 2,
      name: "Project B",
      description: "Description for Project B",
      startDate: "2025-04-01T09:00:00",
      dueDate: "2025-07-01T09:00:00",
      status: "IN_PROGRESS",
      managerId: 2,
      users: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        },
        {
          id: 5,
          firstName: "William",
          lastName: "Martinez",
          email: "william.martinez@example.com",
        },
      ],
      tasks: [
        {
          id: 3,
          name: "Task 3 for Project B",
          status: "COMPLETED",
        },
        {
          id: 4,
          name: "Task 4 for Project B",
          status: "ON_HOLD",
        },
      ],
      totalTask: 2,
      totalCompletedTask: 1,
      progress: 50.0,
    },
    {
      id: 3,
      name: "Project C",
      description: "Description for Project C",
      startDate: "2025-05-01T10:00:00",
      dueDate: "2025-08-01T10:00:00",
      status: "COMPLETED",
      managerId: 3,
      users: [
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
        },
        {
          id: 6,
          firstName: "Olivia",
          lastName: "Hernandez",
          email: "olivia.hernandez@example.com",
        },
      ],
      tasks: [
        {
          id: 5,
          name: "Task 5 for Project C",
          status: "PENDING",
        },
      ],
      totalTask: 1,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 4,
      name: "Project D",
      description: "Description for Project D",
      startDate: "2025-06-01T11:00:00",
      dueDate: "2025-09-01T11:00:00",
      status: "ON_HOLD",
      managerId: 4,
      users: [
        {
          id: 3,
          firstName: "Michael",
          lastName: "Johnson",
          email: "michael.johnson@example.com",
        },
        {
          id: 7,
          firstName: "James",
          lastName: "Lopez",
          email: "james.lopez@example.com",
        },
      ],
      tasks: [
        {
          id: 7,
          name: "Task 7 for Project D",
          status: "COMPLETED",
        },
        {
          id: 6,
          name: "Task 6 for Project D",
          status: "IN_PROGRESS",
        },
      ],
      totalTask: 2,
      totalCompletedTask: 1,
      progress: 50.0,
    },
    {
      id: 5,
      name: "Project E",
      description: "Description for Project E",
      startDate: "2025-07-01T12:00:00",
      dueDate: "2025-10-01T12:00:00",
      status: "NOT_STARTED",
      managerId: 5,
      users: [],
      tasks: [
        {
          id: 8,
          name: "Task 8 for Project E",
          status: "ON_HOLD",
        },
      ],
      totalTask: 1,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 6,
      name: "Project F",
      description: "Description for Project F",
      startDate: "2025-08-01T13:00:00",
      dueDate: "2025-11-01T13:00:00",
      status: "IN_PROGRESS",
      managerId: 6,
      users: [],
      tasks: [
        {
          id: 9,
          name: "Task 9 for Project F",
          status: "PENDING",
        },
      ],
      totalTask: 1,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 7,
      name: "Project G",
      description: "Description for Project G",
      startDate: "2025-09-01T14:00:00",
      dueDate: "2025-12-01T14:00:00",
      status: "COMPLETED",
      managerId: 7,
      users: [],
      tasks: [
        {
          id: 10,
          name: "Task 10 for Project G",
          status: "IN_PROGRESS",
        },
      ],
      totalTask: 1,
      totalCompletedTask: 0,
      progress: 0.0,
    },
    {
      id: 8,
      name: "Project H",
      description: "Description for Project H",
      startDate: "2025-10-01T15:00:00",
      dueDate: "2026-01-01T15:00:00",
      status: "ON_HOLD",
      managerId: 8,
      users: [],
      tasks: [],
      totalTask: 0,
      totalCompletedTask: 0,
      progress: 0.0,
    },
  ],
  pageNo: 0,
  pageSize: 10,
  totalElements: 32,
  totalPages: 4,
  last: false,
};

// Format date to show in the table
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// Get assigned users as a comma-separated string
const getAssignedUsers = (users) => {
  if (!users || users.length === 0) return "No body assigned";
  return users.map((user) => `${user.lastName}, ${user.firstName}`).join(", ");
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let color;
  let displayText = status.replace(/_/g, " ");

  switch (status) {
    case "NOT_STARTED":
      color = "text-red-500";
      break;
    case "IN_PROGRESS":
      color = "text-yellow-500";
      break;
    case "COMPLETED":
      color = "text-green-500";
      break;
    case "ON_HOLD":
      color = "text-blue-500";
      break;
    default:
      color = "text-gray-500";
  }

  return <span className={color}>{status}</span>;
};

// Progress Bar Component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full flex items-center gap-2">
      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${progress > 0 ? "bg-purple-500" : "bg-gray-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-sm">{progress}%</span>
    </div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-gray-400 gap-4">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select
          className="bg-gray-800 border border-gray-700 rounded-md p-1"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>entries</span>
      </div>

      <div className="text-sm">
        Showing page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show pages around current page
          let pageNum = i + 1;
          if (currentPage > 3 && totalPages > 5) {
            pageNum = i + currentPage - 2;
          }

          if (pageNum <= totalPages) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-md ${
                  pageNum === currentPage ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-800 disabled:opacity-50"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({ project, openProjectDetail, openProjectEdit }) => {
  return (
    <div className="flex gap-2">
      <button
        className="p-2 rounded-full bg-green-600 text-white"
        onClick={() => openProjectDetail(project)}
      >
        <Eye size={16} />
      </button>
      <button
        className="p-2 rounded-full bg-yellow-600 text-white"
        onClick={() => openProjectEdit(project)}
      >
        <Edit size={16} />
      </button>
      <button className="p-2 rounded-full bg-purple-600 text-white">
        <Download size={16} />
      </button>
      <button className="p-2 rounded-full bg-red-600 text-white">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "NOT_STARTED", label: "Not Started" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "COMPLETED", label: "Completed" },
    { id: "ON_HOLD", label: "On Hold" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`px-4 py-2 rounded-md ${
            activeFilter === filter.id
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Load data initially
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockData.content);
      setLoading(false);
    }, 500);
  }, []);

  // Handle checkbox selection
  const handleSelectProject = (id) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(
        selectedProjects.filter((projectId) => projectId !== id)
      );
    } else {
      setSelectedProjects([...selectedProjects, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map((project) => project.id));
    }
    setSelectAll(!selectAll);
  };

  // Filter projects based on active filter
  const filteredProjects = projects.filter((project) => {
    // Apply status filter
    if (activeFilter !== "all" && project.status !== activeFilter) {
      return false;
    }

    // Apply search filter
    if (search && !project.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Calculate pagination
  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showProjectEdit, setShowProjectEdit] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const openProjectDetail = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  const openProjectEdit = (project) => {
    setSelectedProject(project);
    setShowProjectEdit(true);
  };

  return (
    <div className="p-6 bg-gray-950 text-white">
      {showProjectDetail ? (
        <ProjectDetail
          project={selectedProject}
          onBack={() => setShowProjectDetail(false)}
        />
      ) : showProjectEdit ? (
        <ProjectEdit
          project={selectedProject}
          onBack={() => setShowProjectEdit(false)}
          isNew={selectedProject === null} // Thêm prop isNew
        />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">PROJECT MANAGEMENT</h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-md"
                onClick={() => {
                  setSelectedProject(null); // Set null vì đây là project mới
                  setShowProjectEdit(true); // Hiển thị form edit
                }}
              >
                <Plus size={18} />
                <span>New</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md">
                <Edit size={18} />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md">
                <RotateCcw size={18} />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-4 pr-10 py-2 bg-gray-800 rounded-md w-64"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              <button className="p-2 bg-gray-800 rounded-md">
                <ArrowUpDown size={18} className="text-white" />
                <span className="sr-only">Sort</span>
              </button>

              <button className="p-2 bg-gray-800 rounded-md">
                <MoreVertical size={18} className="text-white" />
                <span className="sr-only">More</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          />

          {/* Project Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 text-left">
                  <th className="p-4 border-b border-gray-800">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="p-4 border-b border-gray-800">ID</th>
                  <th className="p-4 border-b border-gray-800">Name</th>
                  <th className="p-4 border-b border-gray-800">Assigned To</th>
                  <th className="p-4 border-b border-gray-800">Tasks</th>
                  <th className="p-4 border-b border-gray-800">Progress</th>
                  <th className="p-4 border-b border-gray-800">Status</th>
                  <th className="p-4 border-b border-gray-800">Due Date</th>
                  <th className="p-4 border-b border-gray-800">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentProjects.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  currentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-900">
                      <td className="p-4 border-b border-gray-800">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {project.id}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {project.name}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {getAssignedUsers(project.users)}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {project.totalCompletedTask}/{project.totalTask}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <ProgressBar progress={project.progress} />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        {formatDate(project.dueDate)}
                      </td>
                      <td className="p-4 border-b border-gray-800">
                        <ActionButtons
                          project={project}
                          openProjectDetail={openProjectDetail}
                          openProjectEdit={openProjectEdit}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProjects.length}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
};

export default Project;
