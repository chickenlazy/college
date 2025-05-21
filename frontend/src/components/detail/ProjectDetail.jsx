import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  File,
  Upload,
  Download,
  Archive,
  Image,
  Monitor,
  Info,
  ChevronLeft,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Users,
  ListChecks,
  PieChart,
  MessageSquare,
  Shield,
  Plus,
  User,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Link2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Tag,
  X,
} from "lucide-react";

import ProjectEdit from "../edit/ProjectEdit";
import TaskEdit from "../edit/TaskEdit";
import TaskDetail from "./TaskDetail";

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format date with time for file info
const formatDateWithTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate days remaining
const getDaysRemaining = (endDateString) => {
  const endDate = new Date(endDateString);
  const today = new Date();

  // Set time to beginning of day for accurate day calculation
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// File Manager Component
const FileManager = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    fileId: null,
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      // Gọi API thật để lấy danh sách file
      const response = await axios.get(
        `http://localhost:8080/api/files/project/${projectId}`, // URL của API get files by project
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cấu trúc response theo FileListResponse
      setFiles(response.data.files);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
      showToast("Failed to load files", "error");
    }
  };

  // Trong FileManager component
  useEffect(() => {
    // Lắng nghe sự kiện fileListUpdated từ FileList component
    const handleFileListUpdated = (e) => {
      setFiles(e.detail);
      showToast("Cập nhật tập tin thành công", "success");
    };

    window.addEventListener("fileListUpdated", handleFileListUpdated);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("fileListUpdated", handleFileListUpdated);
    };
  }, []);

  const handleDeleteFile = (fileId) => {
    setConfirmDelete({
      show: true,
      fileId,
    });
  };

  const confirmDeleteFile = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      // Gọi API xóa file
      await axios.delete(
        `http://localhost:8080/api/files/${confirmDelete.fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật state sau khi xóa
      setFiles(files.filter((file) => file.id !== confirmDelete.fileId));
      showToast("Xóa tập tin thành công", "success");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("Failed to Xóa tập tin", "error");
    } finally {
      setConfirmDelete({
        show: false,
        fileId: null,
      });
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      showToast(`Đang tải xuống ${file.originalName}...`, "info");

      // Gọi API để tải file với responseType là 'blob'
      const response = await axios.get(
        `http://localhost:8080/api/files/${file.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Cài đặt này quan trọng để xử lý dữ liệu nhị phân
        }
      );

      // Tạo URL từ Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Tạo thẻ a và giả lập click để tải xuống
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp sau khi tải xuống
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showToast(`Đã tải xuống ${file.originalName}`, "success");
    } catch (error) {
      console.error("Error downloading file:", error);
      showToast("Không thể tải xuống tệp", "error");
    }
  };

  const handleFileUploaded = (newFiles) => {
    setFiles([...newFiles, ...files]);
    showToast(`${newFiles.length} tập tin đã được tải lên thành công`, "success");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tập tin dự án</h2>
      </div>

      <FileUpload projectId={projectId} onFileUploaded={handleFileUploaded} />

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-gray-400">Loading files...</p>
        </div>
      ) : (
        <FileList
          files={files}
          onDelete={handleDeleteFile}
          onDownload={handleDownloadFile}
        />
      )}

      {/* Confirmation Dialog for Deleting File */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Xóa tập tin</h2>
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa tập tin này không? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
                onClick={() => setConfirmDelete({ show: false, fileId: null })}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md flex items-center gap-2"
                onClick={confirmDeleteFile}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : toast.type === "info"
              ? "bg-blue-600"
              : "bg-yellow-600"
          } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : toast.type === "error" ? (
            <AlertTriangle size={20} />
          ) : toast.type === "info" ? (
            <Info size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Component upload file
const FileUpload = ({ projectId, onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState(""); // Thêm state cho mô tả
  const [showDescriptionForm, setShowDescriptionForm] = useState(false); // Hiển thị form mô tả
  const [selectedFiles, setSelectedFiles] = useState([]); // Lưu trữ files đã chọn
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      // Thay vì upload ngay, chúng ta lưu files và hiển thị form mô tả
      setSelectedFiles(Array.from(files));
      setShowDescriptionForm(true);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      // Thay vì upload ngay, chúng ta lưu files và hiển thị form mô tả
      setSelectedFiles(Array.from(files));
      setShowDescriptionForm(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Tạo form data để upload
    const formData = new FormData();
    formData.append("projectId", projectId);

    // Thêm user ID từ localStorage
    const storedUser = localStorage.getItem("user");
    let userId = null;
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userId = user.id;
      token = user.accessToken;
    }
    formData.append("userId", userId);

    // Thêm mô tả cho tất cả file
    if (description.trim()) {
      formData.append("description", description);
    }

    // Thêm các files vào formData
    if (selectedFiles.length === 1) {
      // Nếu chỉ có 1 file, sử dụng API upload đơn
      formData.append("file", selectedFiles[0]);

      try {
        // Tạo progress simulation
        const simulateProgress = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(simulateProgress);
              return prev;
            }
            return prev + 5;
          });
        }, 100);

        // Gọi API upload đơn
        const response = await axios.post(
          "http://localhost:8080/api/files",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        clearInterval(simulateProgress);
        setUploadProgress(100);

        // Xử lý response từ API
        onFileUploaded([response.data]); // Đặt trong mảng để có cùng cấu trúc với upload nhiều
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFiles([]);
        setDescription("");
        setShowDescriptionForm(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setIsUploading(false);
        setUploadProgress(0);
        alert("Failed to upload file");
      }
    } else {
      // Nếu có nhiều file, sử dụng API upload multiple
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }

      try {
        // Tạo progress simulation
        const simulateProgress = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(simulateProgress);
              return prev;
            }
            return prev + 5;
          });
        }, 100);

        // Gọi API upload nhiều
        const response = await axios.post(
          "http://localhost:8080/api/files/multiple",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        clearInterval(simulateProgress);
        setUploadProgress(100);

        // Xử lý response từ API
        onFileUploaded(response.data);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFiles([]);
        setDescription("");
        setShowDescriptionForm(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        setIsUploading(false);
        setUploadProgress(0);
        alert("Failed to Tải lên tập tin");
      }
    }
  };

  return (
    <div className="mb-4">
      {/* Form mô tả trước khi upload */}
      {showDescriptionForm && selectedFiles.length > 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-4 border border-gray-700">
          <h3 className="text-lg font-medium mb-4">
            Tải lên {selectedFiles.length}{" "}
            {selectedFiles.length === 1 ? "file" : "files"}
          </h3>

          {/* Danh sách file đã chọn */}
          <div className="mb-4 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center py-2 border-b border-gray-700"
              >
                <div className="text-gray-400 mr-2">{index + 1}.</div>
                <div className="truncate">{file.name}</div>
                <div className="text-gray-400 ml-2 text-sm">
                  ({(file.size / 1024).toFixed(1)} KB)
                </div>
              </div>
            ))}
          </div>

          {/* Form nhập mô tả */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Mô tả (tùy chọn)
            </label>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
              rows="3"
              placeholder="Nhập mô tả cho các tập tin này"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              onClick={() => {
                setSelectedFiles([]);
                setDescription("");
                setShowDescriptionForm(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Tải lên {selectedFiles.length > 1 ? "Files" : "File"}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-purple-500 bg-purple-500 bg-opacity-10"
              : "border-gray-600 hover:border-purple-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 relative">
                <svg
                  className="animate-spin w-16 h-16 text-purple-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-purple-500 font-medium">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <p>Đang tải lên tập tin...</p>
            </div>
          ) : (
            <>
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-300 mb-1">Kéo & thả tập tin vào đây</p>
              <p className="text-gray-400 text-sm">hoặc nhấp để duyệt</p>
            </>
          )}
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
          />
        </div>
      )}
    </div>
  );
};

// Component hiển thị danh sách file
const FileList = ({ files, onDelete, onDownload }) => {
  // Thêm state để theo dõi file nào đang mở rộng để hiển thị mô tả
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editOriginalName, setEditOriginalName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState(null);

  // Hàm để xác định icon dựa trên loại file
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension)) {
      return <Image size={16} />;
    } else if (["doc", "docx", "pdf", "txt"].includes(extension)) {
      return <FileText size={16} />;
    } else if (["xls", "xlsx", "csv"].includes(extension)) {
      return <FileSpreadsheet size={16} />;
    } else if (["ppt", "pptx"].includes(extension)) {
      return <Monitor size={16} />;
    } else if (["zip", "rar", "7z"].includes(extension)) {
      return <Archive size={16} />;
    } else {
      return <File size={16} />;
    }
  };

  // Format file size
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };

  // Toggle mở rộng file để hiển thị mô tả
  const toggleFileExpand = (fileId) => {
    if (expandedFileId === fileId) {
      setExpandedFileId(null); // Đóng nếu đã mở
    } else {
      setExpandedFileId(fileId); // Mở file được chọn
    }
  };

  // Mở form chỉnh sửa file
  const openEditForm = (file) => {
    setEditingFile(file);
    setEditDescription(file.description || "");
    setEditOriginalName(file.originalName || "");
    setEditError(null);
  };

  // Đóng form chỉnh sửa
  const closeEditForm = () => {
    setEditingFile(null);
    setEditDescription("");
    setEditOriginalName("");
    setEditError(null);
  };

  // Thêm hàm kiểm tra và xử lý tên file
  const handleOriginalNameChange = (newName) => {
    if (!editingFile) return;

    // Tách tên file và phần mở rộng
    const originalName = editingFile.originalName;
    const lastDotIndex = originalName.lastIndexOf(".");

    if (lastDotIndex === -1) {
      // Trường hợp file không có phần mở rộng
      setEditOriginalName(newName);
    } else {
      // Lấy phần mở rộng của file
      const extension = originalName.substring(lastDotIndex);

      // Nếu tên mới đã có phần mở rộng giống với phần mở rộng hiện tại
      if (newName.endsWith(extension)) {
        setEditOriginalName(newName);
      } else {
        // Nếu không, chỉ cập nhật phần tên file mà không thay đổi phần mở rộng
        const newNameWithoutExt =
          newName.lastIndexOf(".") > -1
            ? newName.substring(0, newName.lastIndexOf("."))
            : newName;
        setEditOriginalName(newNameWithoutExt + extension);
      }
    }
  };

  // Xử lý cập nhật file
  // Xử lý cập nhật file
  const handleUpdateFile = async () => {
    if (!editingFile) return;

    // Kiểm tra dữ liệu
    if (!editOriginalName.trim()) {
      setEditError("File name cannot be empty");
      return;
    }

    // Kiểm tra phần mở rộng
    const originalExtension = editingFile.originalName.split(".").pop();
    const newExtension = editOriginalName.split(".").pop();

    if (originalExtension !== newExtension) {
      setEditError("File extension cannot be changed");
      return;
    }

    setIsUpdating(true);

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      // Tạo dữ liệu cập nhật
      const updateData = {
        description: editDescription.trim(),
        originalName: editOriginalName.trim(),
      };

      // Gọi API cập nhật
      const response = await axios.put(
        `http://localhost:8080/api/files/${editingFile.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật lại trạng thái file trong UI
      const updatedFiles = files.map((file) =>
        file.id === editingFile.id ? response.data : file
      );

      // Thông báo thành công và đóng form
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fileListUpdated", { detail: updatedFiles })
        );
      }

      closeEditForm();
    } catch (error) {
      console.error("Error updating file:", error);
      setEditError("Failed to update file. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      {files.length === 0 ? (
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <FileText size={40} className="mx-auto text-gray-500 mb-2" />
          <p className="text-gray-400">Chưa có tập tin nào được tải lên</p>
        </div>
      ) : (
        files.map((file) => (
          <div key={file.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <div
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-750"
              onClick={() => toggleFileExpand(file.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-700 rounded">
                  {getFileIcon(file.originalName)}
                </div>
                <div>
                  <h4 className="font-medium">{file.originalName}</h4>
                  <div className="flex text-xs text-gray-400 mt-1 space-x-3">
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {formatDateWithTime(file.uploadDate)}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                    <span className="flex items-center">
                      <User size={12} className="mr-1" />
                      {file.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 hover:bg-gray-700 rounded-full text-yellow-400"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn không cho sự kiện click lan đến parent
                    openEditForm(file);
                  }}
                  title="Sửa thông tin tập tin"
                >
                  <Edit size={18} />
                </button>
                <button
                  className="p-2 hover:bg-gray-700 rounded-full text-blue-400"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn không cho sự kiện click lan đến parent (không mở rộng file)
                    onDownload(file);
                  }}
                  title="Tải xuống tập tin"
                >
                  <Download size={18} />
                </button>
                <button
                  className="p-2 hover:bg-gray-700 rounded-full text-red-400"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn không cho sự kiện click lan đến parent
                    onDelete(file.id);
                  }}
                  title="Xóa tập tin"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-full">
                  {expandedFileId === file.id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Phần mở rộng để hiển thị mô tả */}
            {expandedFileId === file.id && (
              <div className="p-3 border-t border-gray-700 bg-gray-750">
                <div className="mb-2 text-xs text-gray-400">Description:</div>
                <div className="text-sm pl-2">
                  {file.description ? (
                    file.description
                  ) : (
                    <span className="text-gray-500 italic">Không có mô tả</span>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Lần sửa đổi cuối:
                </div>
                <div className="text-sm pl-2">
                  {formatDateWithTime(file.lastModifiedDate)}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Form chỉnh sửa thông tin file */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold mb-4">
              Chỉnh sửa thông tin tập tin
            </h2>

            {editError && (
              <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md">
                {editError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Tên tập tin (không thể thay đổi phần mở rộng)
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                placeholder="File name"
                value={editOriginalName}
                onChange={(e) => handleOriginalNameChange(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">
                Tập tin gốc: {editingFile?.originalName}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Description
              </label>
              <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                rows="4"
                placeholder="Nhập mô tả tập tin"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
                onClick={closeEditForm}
                disabled={isUpdating}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-md flex items-center"
                onClick={handleUpdateFile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Get status color and icon
const getStatusInfo = (status) => {
  switch (status) {
    case "NOT_STARTED":
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        icon: <Clock size={16} />,
        text: "Not Started",
      };
    case "IN_PROGRESS":
      return {
        color: "bg-blue-500",
        textColor: "text-blue-500",
        icon: <Clock size={16} />,
        text: "In Progress",
      };
    case "COMPLETED":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        icon: <CheckCircle size={16} />,
        text: "Completed",
      };
    case "ON_HOLD":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        icon: <AlertCircle size={16} />,
        text: "On Hold",
      };
    case "OVER_DUE":
      return {
        color: "bg-red-500",
        textColor: "text-red-500",
        icon: <AlertTriangle size={16} />,
        text: "Over Due",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        icon: <Clock size={16} />,
        text: status,
      };
  }
};

// Comment component mới
const Comment = ({ comment, onReply, onDelete }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchReplies = async () => {
    if (!showReplies && comment.replyCount > 0) {
      try {
        setLoadingReplies(true);
        const storedUser = localStorage.getItem("user");
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken;
        }

        const response = await axios.get(
          // http://localhost:8080/api/comments/${comment.id}/replies
          `http://localhost:8080/api/comments/${comment.id}/replies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReplies(response.data || []);
        setShowReplies(true);
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    } else {
      setShowReplies(!showReplies);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.post(
        "http://localhost:8080/api/comments",
        {
          content: replyText,
          type: "TASK",
          referenceId: comment.referenceId,
          parentId: comment.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Thêm reply mới vào danh sách
      setReplies([...replies, response.data]);
      // Reset form
      setReplyText("");
      setShowReplyForm(false);
      // Đảm bảo hiển thị replies
      setShowReplies(true);

      onReply && onReply(response.data);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  return (
    <div className="mb-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0">
            {comment.user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium">{comment.user.fullName}</h4>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdDate).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>

            <div className="mt-3 flex items-center text-sm text-gray-400 space-x-4">
              <button
                className="hover:text-purple-400"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                Reply
              </button>

              {comment.replyCount > 0 && (
                <button
                  className="hover:text-purple-400 flex items-center"
                  onClick={fetchReplies}
                >
                  {showReplies
                    ? "Ẩn phản hồi"
                    : `View ${comment.replyCount} phản hồi`}
                  {loadingReplies && (
                    <span className="ml-2 animate-spin">⏳</span>
                  )}
                </button>
              )}

              {/* Chỉ hiển thị nút Delete nếu người dùng hiện tại là người tạo comment */}
              {currentUser &&
                (currentUser.id === comment.user.id ||
                  currentUser.role === "ROLE_ADMIN") && (
                  <button
                    className="hover:text-red-400"
                    onClick={() => onDelete && onDelete(comment.id)}
                  >
                    Delete
                  </button>
                )}
            </div>

            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                  placeholder="Write a reply..."
                  rows="2"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md"
                    onClick={handleSubmitReply}
                  >
                    Phản hồi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="ml-10 mt-2 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0">
                  {reply.user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm">
                      {reply.user.fullName}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {new Date(reply.createdDate).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Get priority color and text
const getPriorityInfo = (priority) => {
  switch (priority) {
    case "HIGH":
      return {
        color: "bg-red-500",
        textColor: "text-red-500",
        text: "High",
      };
    case "MEDIUM":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        text: "Medium",
      };
    case "LOW":
      return {
        color: "bg-green-500",
        textColor: "text-green-500",
        text: "Low",
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-500",
        text: priority,
      };
  }
};

// Member Modal Popup Component
const MemberModal = ({ isOpen, onClose, users, onSelect, usedUserIds }) => {
  // Di chuyển các useState ra ngoài điều kiện if
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");

  // Return sớm nếu modal không mở
  if (!isOpen) return null;

  // Lọc ra những user chưa được thêm vào project
  const availableUsers = users.filter((user) => !usedUserIds.includes(user.id));

  // Lấy danh sách các role duy nhất
  const uniqueRoles = [
    "All",
    ...new Set(availableUsers.map((user) => user.role).filter(Boolean)),
  ];

  // Lọc users dựa trên tìm kiếm và role
  const filteredUsers = availableUsers.filter((user) => {
    const matchesSearch = user.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "All" || user.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-750">
          <h3 className="text-lg font-medium text-white">Thêm thành viên</h3>
          <button
            className="p-2 hover:bg-gray-700 hover:text-white text-gray-400 rounded-full transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and filter section */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm thành viên theo tên..."
              className="w-full bg-gray-700 rounded-md px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          {/* <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Filter by role:
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueRoles.map((role) => (
                <button
                  key={role}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                    selectedRoleFilter === role
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        {/* Members list */}
        <div className="overflow-y-auto flex-grow custom-scrollbar p-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3 opacity-50"
              >
                <path d="M17.5 8c.7 0 1.4.3 1.9.8.6.6.8 1.3.8 2 0 .7-.3 1.4-.8 2-.3.2-.5.5-.8.7"></path>
                <path d="M3 3l18 18"></path>
                <path d="M16.5 16.5 21 21"></path>
                <path d="M10 5.5a7 7 0 0 1 10.5 6c0 1.5-.5 2.8-1.3 4"></path>
                <path d="M7.7 7.8a7 7 0 0 0-1.2 3.8c0 .7.1 1.4.3 2"></path>
                <path d="M12 12a7 7 0 0 0 1.3 4"></path>
              </svg>
              <p className="text-base mb-2">No matching members found</p>
              {searchTerm && (
                <button
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300 py-1 px-3 rounded-md hover:bg-gray-700"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRoleFilter("All");
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-3 hover:bg-gray-750 bg-gray-800 rounded-lg cursor-pointer transition-colors group border border-gray-700 hover:border-purple-500"
                  onClick={() => onSelect(user.id)}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium text-white">{user.fullName}</h4>
                    <div className="flex items-center flex-wrap">
                      {user.role && (
                        <span className="text-xs text-gray-400">
                          {user.position}
                        </span>
                      )}
                      {user.department && (
                        <>
                          <span className="text-gray-600 text-xs mx-1">•</span>
                          <span className="text-xs text-gray-400">
                            {user.department}
                          </span>
                        </>
                      )}
                      {user.email && (
                        <div className="w-full text-xs text-gray-500 mt-0.5 truncate">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-750 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Hiển thị {filteredUsers.length} trong tổng số {availableUsers.length} thành viên khả dụng
          </span>
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task, index, onTaskDetail, onTaskDeleted }) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden mb-3">
      <div
        className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer hover:bg-gray-750"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-400 w-6">{index + 1}.</div>
          <div className={`h-3 w-3 rounded-full ${statusInfo.color}`}></div>
          <h3 className="font-medium">{task.name}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <span className={`mr-2 ${priorityInfo.textColor}`}>●</span>
              <span>{priorityInfo.text}</span>
            </div>
            {task.assigneeName && (
              <div className="flex items-center text-sm">
                <User size={14} className="mr-1 text-gray-400" />
                <span>{task.assigneeName}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-1 text-gray-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
          <button>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-3">{task.description}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <div className="flex items-center">
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Priority</p>
              <div className="flex items-center">
                <span className={`mr-1 ${priorityInfo.textColor}`}>●</span>
                <span>{priorityInfo.text}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Start Date</p>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                <span>{formatDate(task.startDate)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Due Date</p>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Hiển thị subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 mb-4">
              <p className="text-xs text-gray-400 mb-2">Subtasks</p>
              <div className="space-y-2 pl-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center">
                    <CheckCircle2
                      size={14}
                      className={
                        subtask.completed
                          ? "text-green-500 mr-2"
                          : "text-gray-400 mr-2"
                      }
                    />
                    <span
                      className={
                        subtask.completed ? "text-gray-400 line-through" : ""
                      }
                    >
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-2">
            <button
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              onClick={() => onTaskDetail(task)}
            >
              Chi tiết
            </button>
            <button
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const storedUser = localStorage.getItem("user");
                  let token = null;
                  if (storedUser) {
                    const user = JSON.parse(storedUser);
                    token = user.accessToken;
                  }

                  // Dùng ConfirmationDialog thay vì window.confirm
                  if (
                    window.confirm(
                      "Bạn có chắc chắn muốn xóa nhiệm vụ này không? Hành động này không thể hoàn tác."
                    )
                  ) {
                    await axios.delete(
                      `http://localhost:8080/api/tasks/${task.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    // Thay vì reload toàn bộ trang, gọi API lấy dữ liệu project mới nhất
                    const projectResponse = await axios.get(
                      `http://localhost:8080/api/projects/${task.projectId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    // Dùng callback để cập nhật dữ liệu
                    onTaskDeleted(projectResponse.data);
                  }
                } catch (error) {
                  console.error("Error deleting task:", error);
                  alert("Failed to delete task. Please try again.");
                }
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Member Component
const TeamMember = ({ user }) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
      {user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)}
    </div>
    <div>
      <h4 className="font-medium">{user.fullName}</h4>
      <p className="text-sm text-gray-400">{user.position}</p>
    </div>
  </div>
);

// Tag Component
const TagItem = ({ tag }) => (
  <div
    className="inline-flex items-center px-3 py-1 rounded-full text-sm mr-2 mb-2"
    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
  >
    <Tag size={12} className="mr-1" />
    {tag.name}
  </div>
);

// Tab Component
const Tab = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-3 border-b-2 ${
      active
        ? "border-purple-500 text-purple-500"
        : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
    }`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Thêm component này vào trước hoặc sau component chính
const TagDropdownMenu = ({ isOpen, onClose, tags, onSelect, usedTagIds }) => {
  if (!isOpen) return null;

  // Lọc ra những tag chưa được sử dụng
  const availableTags = tags.filter((tag) => !usedTagIds.includes(tag.id));

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium">Chọn thẻ</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        {availableTags.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>Không còn thẻ nào khả dụng</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableTags.map((tag) => (
              <div
                key={tag.id}
                className="cursor-pointer flex items-center px-3 py-2 rounded-md hover:bg-gray-700"
                style={{ borderLeft: `4px solid ${tag.color}` }}
                onClick={() => onSelect(tag.id)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <span>{tag.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDetail = ({ project: initialProject, onBack: navigateBack }) => {
  // Thêm state cho phần chỉnh sửa file
  const [editingFile, setEditingFile] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editOriginalName, setEditOriginalName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [loadingTag, setLoadingTag] = useState(false);
  const [tagError, setTagError] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [memberError, setMemberError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const onBack = (needRefresh) => {
    if (needRefresh) {
      fetchProjectData();
    } else {
      navigateBack();
    }
  };

  // Thêm hàm xử lý task bị xóa
  const handleTaskDeleted = (updatedProject) => {
    // Cập nhật state project với dữ liệu mới
    setProject(updatedProject);
    // Hiển thị thông báo
    showToast("Xóa nhiệm vụ thành công", "success");
  };

  const openTaskDetail = async (task) => {
    try {
      setTaskLoading(true);
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      // Gọi API để lấy chi tiết task
      const response = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật task với dữ liệu chi tiết từ API
      setSelectedTask(response.data);
      setShowTaskDetail(true);
    } catch (error) {
      console.error("Error fetching task details:", error);
      showToast("Failed to load task details", "error");
    } finally {
      setTaskLoading(false);
    }
  };

  // Trong useEffect để fetch comments, thêm điều kiện kiểm tra project
  useEffect(() => {
    const fetchComments = async () => {
      if (activeTab === "comments" && project && project.id) {
        // Thêm kiểm tra project và project.id
        try {
          setLoadingComments(true);
          const storedUser = localStorage.getItem("user");
          let token = null;
          if (storedUser) {
            const user = JSON.parse(storedUser);
            token = user.accessToken;
          }

          const response = await axios.get(
            `http://localhost:8080/api/comments?type=PROJECT&referenceId=${project.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setComments(response.data || []);
        } catch (error) {
          console.error("Error fetching comments:", error);
          showToast("Failed to load comments", "error");
        } finally {
          setLoadingComments(false);
        }
      }
    };

    fetchComments();
  }, [project, activeTab]); // Đảm bảo dependency list bao gồm project

  useEffect(() => {
    const fetchAllUsers = async () => {
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

        // Lọc chỉ lấy những user có role là ROLE_USER
        const userRoleOnly = response.data.filter(
          (user) => user.role === "ROLE_USER"
        );
        setAllUsers(userRoleOnly);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // Thêm hàm xử lý Delete Project
  // Trong ProjectDetail.jsx

  const handleDeleteProject = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      await axios.delete(`http://localhost:8080/api/projects/${project.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("Xóa dự án thành công", "success");

      // Thay đổi ở đây: chuyển trực tiếp về trang Project
      setTimeout(() => {
        navigateBack(true); // Truyền tham số true để báo hiệu cần refresh dữ liệu
      }, 1000);
    } catch (err) {
      console.error("Error deleting project:", err);
      showToast("Failed to delete project", "error");
    }
  };

  // Hàm hiển thị toast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm thêm member vào project
  const handleAddMember = async (userId) => {
    if (!project || !userId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingMember(true);
    setMemberError(null);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/projects/${project.id}/members/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
      setMembersMenuOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
      setMemberError("Failed to add member. Please try again.");
    } finally {
      setLoadingMember(false);
    }
  };

  // Hàm xóa member khỏi project
  const handleRemoveMember = async (userId) => {
    if (!project || !userId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingMember(true);
    setMemberError(null);

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/projects/${project.id}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error("Error removing member:", error);
      setMemberError("Failed to remove member. Please try again.");
    } finally {
      setLoadingMember(false);
    }
  };

  useEffect(() => {
    const fetchAllTags = async () => {
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
        setAllTags(response.data.content || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchAllTags();
  }, []);

  const handleAddTag = async (tagId) => {
    if (!project || !tagId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingTag(true);
    setTagError(null);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/projects/${project.id}/tags/${tagId}`,
        {}, // empty data object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
      setTagsMenuOpen(false);
    } catch (error) {
      console.error("Error adding tag:", error);
      setTagError("Failed to add tag. Please try again.");
    } finally {
      setLoadingTag(false);
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (!project || !tagId) return;

    const storedUser = localStorage.getItem("user");
    let token = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.accessToken;
    }

    setLoadingTag(true);
    setTagError(null);

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/projects/${project.id}/tags/${tagId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error("Error removing tag:", error);
      setTagError("Failed to remove tag. Please try again.");
    } finally {
      setLoadingTag(false);
    }
  };

  // Load project data
  useEffect(() => {
    if (initialProject) {
      // If project is passed as prop
      setProject(initialProject);
      setLoading(false);
    } else {
      // If we need to fetch project
      fetchProjectData();
    }
  }, [initialProject]);

  const fetchProjectData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.accessToken;
      }

      const response = await axios.get(
        `http://localhost:8080/api/projects/${initialProject.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy dự án</h2>
        <p className="text-gray-400">
          The requested project could not be found.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
          onClick={() => onBack(false)}
        >
          Back
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(project.status);
  const daysRemaining = getDaysRemaining(project.dueDate);

  // Trong ProjectDetail.jsx - phần render TaskEdit

  if (showTaskEdit) {
    return (
      <TaskEdit
        isNew={true}
        projectId={project.id}
        projectName={project.name}
        projectStartDate={project.startDate}
        projectDueDate={project.dueDate}
        onBack={(needRefresh) => {
          setShowTaskEdit(false);
          if (needRefresh) {
            fetchProjectData();
          }
        }}
      />
    );
  }

  return (
    <>
      {showTaskDetail ? (
        taskLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <TaskDetail
            task={selectedTask}
            onBack={(needRefresh) => {
              setShowTaskDetail(false);
              setSelectedTask(null);

              // Nếu needRefresh là true, cập nhật lại dữ liệu project
              if (needRefresh) {
                const fetchProjectData = async () => {
                  try {
                    const storedUser = localStorage.getItem("user");
                    let token = null;
                    if (storedUser) {
                      const user = JSON.parse(storedUser);
                      token = user.accessToken;
                    }

                    const response = await axios.get(
                      `http://localhost:8080/api/projects/${project.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    setProject(response.data);
                  } catch (error) {
                    console.error("Error fetching project details:", error);
                    showToast("Failed to refresh project data", "error");
                  }
                };

                fetchProjectData();
              }
            }}
          />
        )
      ) : (
        <div className="p-6 bg-gray-900 text-white rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              className="flex items-center text-gray-400 hover:text-white"
              onClick={() => onBack(false)}
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Project Title and Status */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h1 className="text-2xl font-bold mr-3">{project.name}</h1>
              <div className="relative">
                <div
                  className="cursor-pointer"
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                >
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 
      ${
        project.status === "COMPLETED"
          ? "bg-green-200 text-green-800"
          : project.status === "IN_PROGRESS"
          ? "bg-blue-200 text-blue-800"
          : project.status === "NOT_STARTED"
          ? "bg-gray-200 text-gray-800"
          : project.status === "OVER_DUE"
          ? "bg-red-200 text-red-800"
          : project.status === "ON_HOLD"
          ? "bg-yellow-200 text-yellow-800"
          : "bg-gray-200 text-gray-800"
      }`}
                  >
                    {project.status === "COMPLETED" ? (
                      <CheckCircle size={16} />
                    ) : project.status === "IN_PROGRESS" ? (
                      <Clock size={16} />
                    ) : project.status === "NOT_STARTED" ? (
                      <Clock size={16} />
                    ) : project.status === "OVER_DUE" ? (
                      <AlertTriangle size={16} />
                    ) : project.status === "ON_HOLD" ? (
                      <AlertCircle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                    <span>{project.status.replace(/_/g, " ")}</span>
                    <ChevronDown size={12} />
                  </div>
                </div>
                {statusMenuOpen && (
                  <div className="absolute left-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700 min-w-[171px] w-auto">
                    {[
                      // "COMPLETED",
                      "IN_PROGRESS",
                      // "NOT_STARTED",
                      // "OVER_DUE",
                      "ON_HOLD",
                    ].map((status) => (
                      <div
                        key={status}
                        className={`px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer my-1 hover:bg-gray-700 mx-1 ${
                          project.status === status ? "bg-gray-700" : ""
                        }`}
                        onClick={async () => {
                          try {
                            const storedUser = localStorage.getItem("user");
                            let token = null;
                            if (storedUser) {
                              const user = JSON.parse(storedUser);
                              token = user.accessToken;
                            }

                            await axios.patch(
                              `http://localhost:8080/api/projects/${project.id}/status?status=${status}`,
                              {},
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );

                            // Fetch lại dữ liệu project
                            fetchProjectData();
                            showToast(
                              `Project status updated to ${status.replace(
                                /_/g,
                                " "
                              )}`,
                              "success"
                            );
                            setStatusMenuOpen(false);
                          } catch (error) {
                            console.error(
                              "Error updating project status:",
                              error
                            );
                            showToast(
                              "Failed to update project status",
                              "error"
                            );
                            setStatusMenuOpen(false);
                          }
                        }}
                      >
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-w-[120px] justify-center ${
                            status === "NOT_STARTED"
                              ? "bg-gray-200 text-gray-800"
                              : status === "IN_PROGRESS"
                              ? "bg-blue-200 text-blue-800"
                              : status === "COMPLETED"
                              ? "bg-green-200 text-green-800"
                              : status === "OVER_DUE"
                              ? "bg-red-200 text-red-800"
                              : status === "ON_HOLD"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {status === "NOT_STARTED" ? (
                            <Clock size={16} />
                          ) : status === "IN_PROGRESS" ? (
                            <Clock size={16} />
                          ) : status === "COMPLETED" ? (
                            <CheckCircle size={16} />
                          ) : status === "OVER_DUE" ? (
                            <AlertTriangle size={16} />
                          ) : status === "ON_HOLD" ? (
                            <AlertCircle size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                          <span>{status.replace(/_/g, " ")}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-300">{project.description}</p>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap">
                {project.tags.map((tag) => (
                  <TagItem key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Thời gian</p>
                  <p className="font-medium">
                    {formatDate(project.startDate)} -{" "}
                    {formatDate(project.dueDate)}
                  </p>
                </div>
                <Calendar size={20} className="text-purple-500" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Số ngày còn lại</p>
                  <p className="font-medium">
                    {daysRemaining > 0
                      ? `${daysRemaining} ngày còn lại`
                      : daysRemaining === 0
                      ? "Hết hạn hôm nay"
                      : project.status === "COMPLETED"
                      ? "Completed"
                      : `${Math.abs(daysRemaining)} days overdue`}
                  </p>
                </div>
                <Clock
                  size={20}
                  className={
                    daysRemaining < 0 && project.status !== "COMPLETED"
                      ? "text-red-500"
                      : "text-purple-500"
                  }
                />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Thành viên</p>
                  <p className="font-medium">{project.users.length} members</p>
                </div>
                <Users size={20} className="text-purple-500" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Tiến trình nhiệm vụ
                  </p>
                  <p className="font-medium">
                    {project.totalCompletedTasks}/{project.totalTasks} completed
                  </p>
                </div>
                <ListChecks size={20} className="text-purple-500" />
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <div className="flex overflow-x-auto hide-scrollbar">
              <Tab
                icon={<ListChecks size={18} />}
                label="Nhiệm vụ"
                active={activeTab === "tasks"}
                onClick={() => setActiveTab("tasks")}
              />
              <Tab
                icon={<Users size={18} />}
                label="Thành viên"
                active={activeTab === "team"}
                onClick={() => setActiveTab("team")}
              />
              <Tab
                icon={<Tag size={18} />}
                label="Nhãn"
                active={activeTab === "tags"}
                onClick={() => setActiveTab("tags")}
              />
              <Tab
                icon={<MessageSquare size={18} />}
                label="Bình luận"
                active={activeTab === "comments"}
                onClick={() => setActiveTab("comments")}
              />
              <Tab
                icon={<FileText size={18} />}
                label="Files"
                active={activeTab === "files"}
                onClick={() => setActiveTab("files")}
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === "tasks" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Nhiệm vụ dự án</h2>
                  <button
                    className={`px-3 py-2 ${
                      project.status === "IN_PROGRESS"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-600 cursor-not-allowed opacity-60"
                    } rounded flex items-center`}
                    onClick={() =>
                      project.status === "IN_PROGRESS" && setShowTaskEdit(true)
                    }
                    disabled={project.status !== "IN_PROGRESS"}
                    title={
                      project.status !== "IN_PROGRESS"
                        ? "Dự án phải ở trạng thái đang tiến hành để thêm nhiệm vụ"
                        : ""
                    }
                  >
                    <Plus size={16} className="mr-2" />
                    Thêm nhiệm vụ
                  </button>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Tổng số</div>
                      <div className="text-2xl font-bold">
                        {project.totalTasks}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Đang tiến hành
                      </div>
                      <div className="text-2xl font-bold text-blue-500">
                        {
                          project.tasks.filter(
                            (t) => t.status === "IN_PROGRESS"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Hoàn thành
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        {
                          project.tasks.filter((t) => t.status === "COMPLETED")
                            .length
                        }
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">
                        Chưa bắt đầu
                      </div>
                      <div className="text-2xl font-bold text-gray-500">
                        {
                          project.tasks.filter(
                            (t) => t.status === "NOT_STARTED"
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {project.tasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                      <ListChecks
                        size={48}
                        className="mx-auto mb-3 opacity-50"
                      />
                      <p>Không tìm thấy nhiệm vụ nào cho dự án này.</p>
                    </div>
                  ) : (
                    project.tasks.map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={{ ...task, projectId: project.id }}
                        onTaskDeleted={handleTaskDeleted}
                        index={index}
                        onTaskDetail={openTaskDetail}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Thành viên</h2>
                  <div className="relative">
                    <button
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                      onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                      disabled={loadingMember}
                    >
                      <Plus size={16} className="mr-2" />
                      Thêm thành viên
                      {loadingMember && (
                        <span className="ml-2 animate-spin">⟳</span>
                      )}
                    </button>

                    {/* Member Modal */}
                    <MemberModal
                      isOpen={membersMenuOpen}
                      onClose={() => setMembersMenuOpen(false)}
                      users={allUsers}
                      onSelect={handleAddMember}
                      usedUserIds={project.users.map((user) => user.id)}
                    />
                  </div>
                </div>

                {memberError && (
                  <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md">
                    {memberError}
                  </div>
                )}

                {project.managerId && (
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-3 text-purple-400 flex items-center">
                      <Shield size={16} className="mr-2" />
                      Quản lý dự án
                    </h3>
                    <div className="bg-purple-900 bg-opacity-30 border border-purple-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                            {project.managerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">
                              {project.managerName}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-md font-medium mb-3 flex items-center">
                  <Users size={16} className="mr-2" />
                  Thành viên
                </h3>

                {project.users.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No Thành viên assigned to this project yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.users
                      .filter((user) => user.id !== project.managerId)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-medium">{user.fullName}</h4>
                              <p className="text-sm text-gray-400">
                                {user.position}
                              </p>
                            </div>
                          </div>
                          <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"
                            onClick={() => handleRemoveMember(user.id)}
                            disabled={loadingMember}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tags" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Project Tags</h2>
                  <div className="relative">
                    <button
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center"
                      onClick={() => setTagsMenuOpen(!tagsMenuOpen)}
                      disabled={loadingTag}
                    >
                      <Plus size={16} className="mr-2" />
                      Thêm nhãn
                      {loadingTag && (
                        <span className="ml-2 animate-spin">⟳</span>
                      )}
                    </button>

                    {/* Tag Dropdown Menu */}
                    <TagDropdownMenu
                      isOpen={tagsMenuOpen}
                      onClose={() => setTagsMenuOpen(false)}
                      tags={allTags}
                      onSelect={handleAddTag}
                      usedTagIds={
                        project.tags ? project.tags.map((tag) => tag.id) : []
                      }
                    />
                  </div>
                </div>

                {tagError && (
                  <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md">
                    {tagError}
                  </div>
                )}

                {!project.tags || project.tags.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg">
                    <Tag size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Chưa có thẻ nào được gán cho dự án này.</p>
                  </div>
                ) : (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex flex-wrap">
                      {project.tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between bg-gray-700 rounded-lg p-3 mr-4 mb-4"
                          style={{ borderLeft: `4px solid ${tag.color}` }}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: tag.color }}
                            ></div>
                            <span>{tag.name}</span>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              className="p-1 hover:bg-gray-600 rounded"
                              onClick={() => handleRemoveTag(tag.id)}
                              disabled={loadingTag}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div>
                <div className="mb-6">
                  <div className="flex flex-col space-y-4">
                    {/* Form thêm comment mới */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <textarea
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white"
                        placeholder="Viết comment..."
                        rows="3"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end mt-3">
                        <button
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
                          onClick={async () => {
                            if (!newComment.trim()) return;

                            try {
                              const storedUser = localStorage.getItem("user");
                              let token = null;
                              if (storedUser) {
                                const user = JSON.parse(storedUser);
                                token = user.accessToken;
                              }

                              const response = await axios.post(
                                "http://localhost:8080/api/comments",
                                {
                                  content: newComment,
                                  type: "PROJECT",
                                  referenceId: project.id,
                                  parentId: null,
                                },
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              // Thêm comment mới vào đầu danh sách
                              setComments([response.data, ...comments]);
                              // Reset form
                              setNewComment("");
                              showToast(
                                "Bình luận đã được thêm thành công",
                                "success"
                              );
                            } catch (error) {
                              console.error("Error adding comment:", error);
                              showToast("Failed to add comment", "error");
                            }
                          }}
                        >
                          Bình luận
                        </button>
                      </div>
                    </div>

                    {/* Danh sách comments */}
                    {loadingComments ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                        <p className="mt-2 text-gray-400">
                          Đang tải bình luận...
                        </p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-800 rounded-lg">
                        <MessageSquare
                          size={40}
                          className="mx-auto text-gray-500 mb-2"
                        />
                        <p className="text-gray-400">
                          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <Comment
                          key={comment.id}
                          comment={comment}
                          onReply={() => {
                            // Cập nhật lại danh sách comments sau khi reply
                            const updatedComments = [...comments];
                            const index = updatedComments.findIndex(
                              (c) => c.id === comment.id
                            );
                            if (index !== -1) {
                              updatedComments[index] = {
                                ...comment,
                                replyCount: comment.replyCount + 1,
                              };
                              setComments(updatedComments);
                            }
                          }}
                          onDelete={async (commentId) => {
                            try {
                              const storedUser = localStorage.getItem("user");
                              let token = null;
                              if (storedUser) {
                                const user = JSON.parse(storedUser);
                                token = user.accessToken;
                              }

                              await axios.delete(
                                `http://localhost:8080/api/comments/${commentId}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              // Xóa comment khỏi danh sách
                              setComments(
                                comments.filter((c) => c.id !== commentId)
                              );
                              showToast(
                                "Xóa bình luận thành công",
                                "success"
                              );
                            } catch (error) {
                              console.error("Error deleting comment:", error);
                              showToast("Failed to delete comment", "error");
                            }
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div>
                <FileManager projectId={project.id} />
              </div>
            )}
          </div>

          {/* Confirmation Dialog for Deleting Project */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl animate-scale-in">
                <h2 className="text-xl font-bold mb-4">Delete Project</h2>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md flex items-center gap-2"
                    onClick={handleDeleteProject}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-4 right-4 ${
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
              } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProjectDetail;
