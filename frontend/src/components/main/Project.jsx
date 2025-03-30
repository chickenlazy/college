import React, { useState, useEffect } from "react";
import axios from "axios";
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
  return users.map((user) => user.fullName).join(", ");
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
    case "OVER_DUE":
      color = "text-orange-500";
      break;
    default:
      color = "text-gray-500";
  }

  return <span className={color}>{displayText}</span>;
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
    { id: "OVER_DUE", label: "Over Due" },
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
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [apiData, setApiData] = useState({
    content: [],
    pageNo: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  // Load data from API
  // 1. Cập nhật hàm fetchProjects để gửi các tham số tìm kiếm và lọc
  const fetchProjects = async (
    page = currentPage,
    size = itemsPerPage,
    searchTerm = search,
    filterStatus = activeFilter
  ) => {
    setLoading(true);
    try {
      const params = {
        pageNo: page,
        pageSize: size,
      };

      // Thêm tham số tìm kiếm nếu có
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Thêm tham số lọc status nếu không phải "all"
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const response = await axios.get(`http://localhost:8080/api/projects`, {
        params: params,
      });
      setApiData(response.data);
      setProjects(response.data.content);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
      setLoading(false);
    }
  };

  // 2. Cập nhật useEffect để phản ứng với sự thay đổi của search và activeFilter
  useEffect(() => {
    fetchProjects(currentPage, itemsPerPage, search, activeFilter);
  }, [currentPage, itemsPerPage, search, activeFilter]);

  // Reload data when page or items per page changes
  // useEffect(() => {
  //   fetchProjects(currentPage, itemsPerPage);
  // }, [currentPage, itemsPerPage]);

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

  const refreshData = () => {
    fetchProjects(currentPage, itemsPerPage, search, activeFilter);
  };
  

  // Filter projects based on active filter and search
  const filteredProjects = projects;

  const currentProjects = filteredProjects;

  const totalPages = apiData.totalPages;

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
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

  // Handle Reset functionality
  const handleReset = () => {
    setSearch(""); // Reset search query
    setActiveFilter("all"); // Reset active filter to 'all'
    setCurrentPage(1); // Reset to the first page
    setSelectAll(false); // Unselect 'select all' checkbox
    setSelectedProjects([]); // Deselect all projects
    fetchProjects(1, itemsPerPage); // Reload data from API
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
        onBack={() => {
          setShowProjectEdit(false);
          refreshData(); 
        }}
        isNew={selectedProject === null}
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
                  setSelectedProject(null);
                  setShowProjectEdit(true);
                }}
              >
                <Plus size={18} />
                <span>New</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md">
                <Edit size={18} />
                <span>Edit</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-700 rounded-md"
                onClick={handleReset}
              >
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
                    setCurrentPage(1);
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
              setCurrentPage(1);
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
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-red-500">
                      {error}
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
                        {project.totalCompletedTasks}/{project.totalTasks}
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
            totalItems={apiData.totalElements}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
};

export default Project;
